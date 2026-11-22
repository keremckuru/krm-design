import { z } from 'zod';

export function createSettingsModule({ db, auth, fail, json, parseBody }) {
  function publicSettings() {
    return json(JSON.parse(db.prepare('SELECT data FROM settings WHERE id=1').get().data));
  }

  function get(req) {
    auth.requireAdmin(req);
    const row = db.prepare('SELECT * FROM settings WHERE id=1').get();
    return json({ ...JSON.parse(row.data), revision: row.revision });
  }

  async function save(req) {
    auth.requireAdmin(req);
    const { revision, ...data } = z.object({
      email: z.string().email().max(200),
      terms: z.string().max(30000),
      revision: z.number().int(),
    }).parse(await parseBody(req));
    const changed = db.prepare('UPDATE settings SET data=?,revision=revision+1 WHERE id=1 AND revision=?').run(
      JSON.stringify(data),
      revision
    );
    if (!changed.changes) fail(409, 'Settings changed in another session. Reload before saving.');
    return json({ ...data, revision: revision + 1 });
  }

  return { publicSettings, get, save };
}
