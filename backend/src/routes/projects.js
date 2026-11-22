import { z } from 'zod';
import { transaction, projectFromRow } from '../database.js';

const imagePath = z.string().regex(/^\/(images\/[a-zA-Z0-9_-]+\.(webp|png|jpg)|api\/media\/[a-f0-9-]+\.webp)$/);

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,100}$/),
  title: z.string().trim().min(1).max(150),
  team: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  kind: z.enum(['Club', 'National']),
  brand: z.string().max(150),
  year: z.string().regex(/^\d{4}$/),
  description: z.string().max(10000),
  images: z.array(imagePath).min(1).max(30),
  status: z.enum(['Concept', 'Commissioned', 'Produced']),
  published: z.boolean(),
  featured: z.boolean(),
  homepage: z.boolean().default(true),
  revision: z.number().int().positive().optional(),
  originalSlug: z.string().optional(),
});

export function createProjectsModule({ db, auth, fail, json, parseBody }) {
  const orderRevision = () =>
    Number(db.prepare("SELECT value FROM meta WHERE key='orderRevision'").get().value);

  const bumpOrder = () =>
    db.prepare("UPDATE meta SET value=CAST(value AS INTEGER)+1 WHERE key='orderRevision'").run();

  const record = (slug) => db.prepare('SELECT * FROM projects WHERE slug=?').get(slug);

  const checkRevision = (row, revision) => {
    if (!row) fail(404, 'Project not found.');
    if (row.revision !== revision) fail(409, 'This project changed in another session. Reload it before saving.');
  };

  const snapshot = (row) =>
    db.prepare('INSERT INTO revisions(slug,data,created) VALUES(?,?,?)').run(
      row.slug,
      JSON.stringify(projectFromRow(row)),
      new Date().toISOString()
    );

  function mediaRefs(p) {
    db.prepare('DELETE FROM project_media WHERE slug=?').run(p.slug);
    for (const url of new Set(p.images)) {
      if (url.startsWith('/api/media/')) {
        const key = url.split('/').pop();
        if (!db.prepare('SELECT 1 FROM media WHERE key=?').get(key)) {
          fail(400, 'An uploaded image is missing. Upload it again.');
        }
        db.prepare('INSERT INTO project_media(slug,key) VALUES(?,?)').run(p.slug, key);
      }
    }
  }

  function catalog() {
    return json(db.prepare('SELECT * FROM projects WHERE deleted=0 AND published=1 ORDER BY position,slug').all().map(projectFromRow));
  }

  function list(req, url) {
    auth.requireAdmin(req);
    const trash = url.searchParams.get('trash') === '1';
    return json(
      db.prepare('SELECT * FROM projects WHERE deleted=? ORDER BY position,slug').all(+trash).map(projectFromRow),
      200,
      { 'X-Order-Revision': String(orderRevision()) }
    );
  }

  async function save(req) {
    const p = projectSchema.parse(await parseBody(req));
    if (p.originalSlug && p.originalSlug !== p.slug) fail(400, 'An existing project URL cannot be changed.');
    const result = transaction(db, () => {
      const existing = record(p.slug);
      if (existing) {
        checkRevision(existing, p.revision);
        if (existing.deleted) fail(409, 'Restore this project from the trash first.');
        snapshot(existing);
      } else if (p.revision || p.originalSlug) {
        fail(409, 'This project no longer exists.');
      }
      const { revision, originalSlug, ...data } = p;
      if (existing) {
        db.prepare('UPDATE projects SET data=?,published=?,revision=revision+1,updated=? WHERE slug=?').run(
          JSON.stringify(data),
          +p.published,
          new Date().toISOString(),
          p.slug
        );
      } else {
        db.prepare('INSERT INTO projects(slug,data,published,position,updated) VALUES(?,?,?,?,?)').run(
          p.slug,
          JSON.stringify(data),
          +p.published,
          db.prepare('SELECT COALESCE(MAX(position),-1)+1 AS n FROM projects').get().n,
          new Date().toISOString()
        );
        bumpOrder();
      }
      mediaRefs(p);
      return projectFromRow(record(p.slug));
    });
    return json(result);
  }

  async function reorder(req) {
    const input = z.object({ slugs: z.array(z.string()).max(10000), orderRevision: z.number().int() }).parse(await parseBody(req));
    transaction(db, () => {
      if (input.orderRevision !== orderRevision()) fail(409, 'Project order changed. Reload the project list.');
      const current = db.prepare('SELECT slug FROM projects WHERE deleted=0').all().map(r => r.slug);
      if (input.slugs.length !== current.length || new Set(input.slugs).size !== current.length || input.slugs.some(s => !current.includes(s))) {
        fail(409, 'Project list changed. Reload before reordering.');
      }
      input.slugs.forEach((slug, index) => db.prepare('UPDATE projects SET position=? WHERE slug=?').run(index, slug));
      bumpOrder();
    });
    return json({ orderRevision: orderRevision() });
  }

  async function remove(req) {
    const p = z.object({ slug: z.string(), revision: z.number().int() }).parse(await parseBody(req));
    transaction(db, () => {
      const row = record(p.slug);
      checkRevision(row, p.revision);
      snapshot(row);
      db.prepare('UPDATE projects SET deleted=1,published=0,revision=revision+1,updated=? WHERE slug=?').run(
        new Date().toISOString(),
        p.slug
      );
      bumpOrder();
    });
    return json({ ok: true });
  }

  async function restore(req) {
    const p = z.object({ slug: z.string(), revision: z.number().int() }).parse(await parseBody(req));
    transaction(db, () => {
      const row = record(p.slug);
      checkRevision(row, p.revision);
      if (!row.deleted) fail(409, 'Project is already active.');
      snapshot(row);
      db.prepare('UPDATE projects SET deleted=0,published=0,revision=revision+1,updated=? WHERE slug=?').run(
        new Date().toISOString(),
        p.slug
      );
      bumpOrder();
    });
    return json(projectFromRow(record(p.slug)));
  }

  return { catalog, list, save, reorder, remove, restore };
}
