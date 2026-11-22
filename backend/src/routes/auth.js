import { randomBytes, createHash } from 'node:crypto';
import { z } from 'zod';
import { verifyPassword, passwordHash } from '../database.js';

const hash = (value) => createHash('sha256').update(value).digest('hex');

export function createAuthModule({ db, origin, secure, fail, json, parseBody }) {
  const makeCookie = (value, age) =>
    `krm-session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? '; Secure' : ''}`;

  const getUser = (req) => {
    const token = req.headers.get('cookie')?.match(/(?:^|;\s*)krm-session=([a-f0-9]{64})(?:;|$)/)?.[1];
    return token ? db.prepare('SELECT email FROM sessions WHERE token=? AND expires>?').get(hash(token), Date.now()) : null;
  };

  const requireAdmin = (req) => {
    const account = getUser(req);
    if (!account) fail(401, 'Please sign in again.');
    return account;
  };

  const rateLimit = (key, max, windowMs) => {
    const now = Date.now();
    db.prepare('DELETE FROM rate_limits WHERE expires<?').run(now);
    const row = db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key);
    if (row?.count >= max) fail(429, 'Too many requests. Please try again later.');
    db.prepare('INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key, now + windowMs);
  };

  async function login(req) {
    rateLimit('login', 25, 15 * 60 * 1000);
    const input = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(256) }).parse(await parseBody(req));
    const account = db.prepare('SELECT * FROM users WHERE email=?').get(input.email.toLowerCase());
    if (!verifyPassword(input.password, account?.password || passwordHash('unused-dummy-password')) || !account) {
      fail(401, 'Email or password is incorrect.');
    }
    const token = randomBytes(32).toString('hex');
    db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
    db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token), account.email, Date.now() + 8 * 3600000);
    return json({ ok: true }, 200, { 'Set-Cookie': makeCookie(token, 8 * 3600) });
  }

  function me(req) {
    return json(requireAdmin(req));
  }

  function logout(req) {
    const token = req.headers.get('cookie')?.match(/krm-session=([a-f0-9]{64})/)?.[1];
    if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));
    return json({ ok: true }, 200, { 'Set-Cookie': makeCookie('', 0) });
  }

  return { getUser, requireAdmin, rateLimit, login, me, logout };
}
