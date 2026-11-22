import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';

const hash = (value) => createHash('sha256').update(value).digest('hex');

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(200),
  company: z.string().max(150),
  service: z.string().min(1).max(80),
  budget: z.string().min(1).max(80),
  deadline: z.string().max(100),
  message: z.string().trim().min(20).max(8000),
  website: z.string().max(0),
});

export function createInquiriesModule({ db, auth, json, parseBody }) {
  function list(req) {
    auth.requireAdmin(req);
    return json(db.prepare('SELECT id,data,created,status FROM inquiries ORDER BY created DESC LIMIT 200').all());
  }

  async function submit(req) {
    const data = inquirySchema.parse(await parseBody(req));
    const fingerprint = hash(JSON.stringify(data));
    const previous = db.prepare('SELECT id FROM inquiries WHERE fingerprint=?').get(fingerprint);
    if (previous) return json({ ok: true, id: previous.id });
    auth.rateLimit('inquiries-total', 60, 3600000);
    auth.rateLimit('inquiry:' + hash(data.email.toLowerCase()), 3, 3600000);
    const id = randomUUID();
    db.prepare('INSERT INTO inquiries(id,data,created,fingerprint) VALUES(?,?,?,?)').run(
      id,
      JSON.stringify(data),
      new Date().toISOString(),
      fingerprint
    );
    return json({ ok: true, id });
  }

  return { list, submit };
}
