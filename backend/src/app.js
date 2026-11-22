import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { z } from 'zod';
import { transaction, projectFromRow, verifyPassword, passwordHash } from './database.js';
const imagePath = z.string().regex(/^\/(images\/[a-zA-Z0-9_-]+\.(webp|png|jpg)|api\/media\/[a-f0-9-]+\.webp)$/);
const projectSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,100}$/), title: z.string().trim().min(1).max(150), team: z.string().trim().min(1).max(100), country: z.string().trim().min(1).max(100), kind: z.enum(['Club', 'National']), brand: z.string().max(150), year: z.string().regex(/^\d{4}$/), description: z.string().max(10000), images: z.array(imagePath).min(1).max(30), status: z.enum(['Concept', 'Commissioned', 'Produced']), published: z.boolean(), featured: z.boolean(), homepage: z.boolean().default(true), revision: z.number().int().positive().optional(), originalSlug: z.string().optional() });
const inquirySchema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().email().max(200), company: z.string().max(150), service: z.string().min(1).max(80), budget: z.string().min(1).max(80), deadline: z.string().max(100), message: z.string().trim().min(20).max(8000), website: z.string().max(0) });
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
const hash = value => createHash('sha256').update(value).digest('hex');
export function createApp({ db, mediaDir, origin = 'http://localhost:3000' }) {
  const secure = new URL(origin).protocol === 'https:';
  const cookie = (value, age) => `krm-session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? '; Secure' : ''}`;
  const orderRevision = () => Number(db.prepare("SELECT value FROM meta WHERE key='orderRevision'").get().value);
  const bumpOrder = () => db.prepare("UPDATE meta SET value=CAST(value AS INTEGER)+1 WHERE key='orderRevision'").run();
  const user = req => { const token = req.headers.get('cookie')?.match(/(?:^|;\s*)krm-session=([a-f0-9]{64})(?:;|$)/)?.[1]; return token ? db.prepare('SELECT email FROM sessions WHERE token=? AND expires>?').get(hash(token), Date.now()) : null; };
  const admin = req => { const account = user(req); if (!account) fail(401, 'Please sign in again.'); return account; };
  const limit = (key, max, windowMs) => { const now = Date.now(); db.prepare('DELETE FROM rate_limits WHERE expires<?').run(now); const row = db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key); if (row?.count >= max) fail(429, 'Too many requests. Please try again later.'); db.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key, now + windowMs); };
  const record = slug => db.prepare('SELECT * FROM projects WHERE slug=?').get(slug);
  const checkRevision = (row, revision) => { if (!row) fail(404, 'Project not found.'); if (row.revision !== revision) fail(409, 'This project changed in another session. Reload it before saving.'); };
  const snapshot = row => db.prepare('INSERT INTO revisions(slug,data,created) VALUES(?,?,?)').run(row.slug, JSON.stringify(projectFromRow(row)), new Date().toISOString());
  function mediaRefs(p) { db.prepare('DELETE FROM project_media WHERE slug=?').run(p.slug); for (const url of new Set(p.images)) { if (url.startsWith('/api/media/')) { const key = url.split('/').pop(); if (!db.prepare('SELECT 1 FROM media WHERE key=?').get(key)) fail(400, 'An uploaded image is missing. Upload it again.'); db.prepare('INSERT INTO project_media(slug,key) VALUES(?,?)').run(p.slug, key); } } }
  async function body(req) { try { return await req.json(); } catch { fail(400, 'Invalid JSON.'); } }
  return async function handle(req) {
    try {
      const url = new URL(req.url), path = url.pathname, method = req.method;
      const hOrigin = req.headers.get('origin');
      if (!['GET', 'HEAD'].includes(method) && hOrigin && hOrigin !== origin && !hOrigin.includes('localhost') && !hOrigin.includes('vercel.app')) fail(403, 'Request origin is not allowed.');
      if (path === '/api/health' && method === 'GET') { db.prepare('SELECT 1').get(); return json({ ok: true }); }
      if (path === '/api/auth/login' && method === 'POST') {
        limit('login', 25, 15 * 60 * 1000);
        const input = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(256) }).parse(await body(req));
        const account = db.prepare('SELECT * FROM users WHERE email=?').get(input.email.toLowerCase());
        if (!verifyPassword(input.password, account?.password || passwordHash('unused-dummy-password')) || !account) fail(401, 'Email or password is incorrect.');
        const token = randomBytes(32).toString('hex'); db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now()); db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token), account.email, Date.now() + 8 * 3600000);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, 8 * 3600) });
      }
      if (path === '/api/auth/me' && method === 'GET') return json(admin(req));
      if (path === '/api/auth/logout' && method === 'POST') { const token = req.headers.get('cookie')?.match(/krm-session=([a-f0-9]{64})/)?.[1]; if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token)); return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) }); }
      if (path === '/api/catalog' && method === 'GET') {
        return json(db.prepare('SELECT * FROM projects WHERE deleted=0 AND published=1 ORDER BY position,slug').all().map(projectFromRow));
      }
      if (path === '/api/public-settings' && method === 'GET') return json(JSON.parse(db.prepare('SELECT data FROM settings WHERE id=1').get().data));
      if (path === '/api/projects') {
        admin(req);
        if (method === 'GET') { const trash = url.searchParams.get('trash') === '1'; return json(db.prepare('SELECT * FROM projects WHERE deleted=? ORDER BY position,slug').all(+trash).map(projectFromRow), 200, { 'X-Order-Revision': String(orderRevision()) }); }
        if (method === 'POST') {
          const p = projectSchema.parse(await body(req)); if (p.originalSlug && p.originalSlug !== p.slug) fail(400, 'An existing project URL cannot be changed.');
          const result = transaction(db, () => {
            const existing = record(p.slug); if (existing) { checkRevision(existing, p.revision); if (existing.deleted) fail(409, 'Restore this project from the trash first.'); snapshot(existing); } else if (p.revision || p.originalSlug) fail(409, 'This project no longer exists.');
            const { revision, originalSlug, ...data } = p;
            if (existing) db.prepare('UPDATE projects SET data=?,published=?,revision=revision+1,updated=? WHERE slug=?').run(JSON.stringify(data), +p.published, new Date().toISOString(), p.slug);
            else { db.prepare('INSERT INTO projects(slug,data,published,position,updated) VALUES(?,?,?,?,?)').run(p.slug, JSON.stringify(data), +p.published, db.prepare('SELECT COALESCE(MAX(position),-1)+1 AS n FROM projects').get().n, new Date().toISOString()); bumpOrder(); }
            mediaRefs(p); return projectFromRow(record(p.slug));
          }); return json(result);
        }
        if (method === 'PATCH') {
          const input = z.object({ slugs: z.array(z.string()).max(10000), orderRevision: z.number().int() }).parse(await body(req));
          transaction(db, () => { if (input.orderRevision !== orderRevision()) fail(409, 'Project order changed. Reload the project list.'); const current = db.prepare('SELECT slug FROM projects WHERE deleted=0').all().map(r => r.slug); if (input.slugs.length !== current.length || new Set(input.slugs).size !== current.length || input.slugs.some(s => !current.includes(s))) fail(409, 'Project list changed. Reload before reordering.'); input.slugs.forEach((slug, index) => db.prepare('UPDATE projects SET position=? WHERE slug=?').run(index, slug)); bumpOrder(); }); return json({ orderRevision: orderRevision() });
        }
        if (method === 'DELETE') { const p = z.object({ slug: z.string(), revision: z.number().int() }).parse(await body(req)); transaction(db, () => { const row = record(p.slug); checkRevision(row, p.revision); snapshot(row); db.prepare('UPDATE projects SET deleted=1,published=0,revision=revision+1,updated=? WHERE slug=?').run(new Date().toISOString(), p.slug); bumpOrder(); }); return json({ ok: true }); }
      }
      if (path === '/api/projects/restore' && method === 'POST') { admin(req); const p = z.object({ slug: z.string(), revision: z.number().int() }).parse(await body(req)); transaction(db, () => { const row = record(p.slug); checkRevision(row, p.revision); if (!row.deleted) fail(409, 'Project is already active.'); snapshot(row); db.prepare('UPDATE projects SET deleted=0,published=0,revision=revision+1,updated=? WHERE slug=?').run(new Date().toISOString(), p.slug); bumpOrder(); }); return json(projectFromRow(record(p.slug))); }
      if (path === '/api/settings') {
        admin(req); if (method === 'GET') { const row = db.prepare('SELECT * FROM settings WHERE id=1').get(); return json({ ...JSON.parse(row.data), revision: row.revision }); }
        if (method === 'POST') { const { revision, ...data } = z.object({ email: z.string().email().max(200), terms: z.string().max(30000), revision: z.number().int() }).parse(await body(req)); const changed = db.prepare('UPDATE settings SET data=?,revision=revision+1 WHERE id=1 AND revision=?').run(JSON.stringify(data), revision); if (!changed.changes) fail(409, 'Settings changed in another session. Reload before saving.'); return json({ ...data, revision: revision + 1 }); }
      }
      if (path === '/api/upload' && method === 'POST') {
        admin(req); const form = await req.formData(), file = form.get('file'); if (!file || typeof file.arrayBuffer !== 'function' || file.size > 12 * 1024 * 1024) fail(400, 'Choose a JPG, PNG or WebP under 12 MB.');
        const buffer = Buffer.from(await file.arrayBuffer()); let metadata; try { metadata = await sharp(buffer, { limitInputPixels: 40000000 }).metadata(); } catch { fail(400, 'This image could not be read.'); } if (!['jpeg', 'png', 'webp'].includes(metadata.format) || metadata.pages > 1) fail(400, 'Use a still JPG, PNG or WebP image.');
        const id = randomUUID(), key = id + '.webp'; await mkdir(mediaDir, { recursive: true }); const files = [];
        try { for (const [suffix, width] of [['', 1800], ['-600', 600]]) { const name = id + suffix + '.webp'; const output = await sharp(buffer, { limitInputPixels: 40000000 }).rotate().resize({ width, height: width, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toBuffer(); await writeFile(join(mediaDir, name), output); files.push(name); } await writeFile(join(mediaDir, id + '.original'), buffer); files.push(id + '.original'); db.prepare('INSERT INTO media VALUES(?,?)').run(key, new Date().toISOString()); } catch (error) { await Promise.all(files.map(name => rm(join(mediaDir, name), { force: true }))); throw error; }
        return json({ url: '/api/media/' + key, thumbnail: '/api/media/' + id + '-600.webp' });
      }
      if (path.startsWith('/api/media/') && method === 'GET') {
        const name = path.slice('/api/media/'.length); if (!/^[a-f0-9-]+(?:-600)?\.webp$/.test(name)) fail(404, 'Image not found.'); const key = name.replace(/-600\.webp$/, '.webp');
        if (!db.prepare('SELECT 1 FROM media WHERE key=?').get(key)) fail(404, 'Image not found.');
        if (!user(req) && !db.prepare('SELECT 1 FROM project_media m JOIN projects p ON p.slug=m.slug WHERE m.key=? AND p.published=1 AND p.deleted=0 LIMIT 1').get(key)) fail(404, 'Image not found.');
        let data; try { data = await readFile(join(mediaDir, name)); } catch { fail(404, 'Image not found.'); } return new Response(data, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-cache', 'X-Content-Type-Options': 'nosniff' } });
      }
      if (path === '/api/inquiries') {
        if (method === 'GET') { admin(req); return json(db.prepare('SELECT id,data,created,status FROM inquiries ORDER BY created DESC LIMIT 200').all()); }
        if (method === 'POST') { const data = inquirySchema.parse(await body(req)); const fingerprint = hash(JSON.stringify(data)); const previous = db.prepare('SELECT id FROM inquiries WHERE fingerprint=?').get(fingerprint); if (previous) return json({ ok: true, id: previous.id }); limit('inquiries-total', 60, 3600000); limit('inquiry:' + hash(data.email.toLowerCase()), 3, 3600000); const id = randomUUID(); db.prepare('INSERT INTO inquiries(id,data,created,fingerprint) VALUES(?,?,?,?)').run(id, JSON.stringify(data), new Date().toISOString(), fingerprint); return json({ ok: true, id }); }
      }
      fail(404, 'Not found.');
    } catch (error) { if (error instanceof z.ZodError) return json({ error: 'Check the required fields and image list.', fields: error.issues.map(i => i.path.join('.')) }, 400); if (error instanceof HttpError) return json({ error: error.message }, error.status); console.error('API failure:', error.message); return json({ error: 'Service temporarily unavailable. Your changes have not been confirmed.' }, 503); }
  };
}
