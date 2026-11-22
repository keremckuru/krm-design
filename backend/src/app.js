import { z } from 'zod';
import { createAuthModule } from './routes/auth.js';
import { createProjectsModule } from './routes/projects.js';
import { createMediaModule } from './routes/media.js';
import { createInquiriesModule } from './routes/inquiries.js';
import { createSettingsModule } from './routes/settings.js';

/* ── Error & Response Helpers ───────────────────────────────── */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const fail = (status, message) => {
  throw new HttpError(status, message);
};

export const json = (data, status = 200, headers = {}) =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });

export async function parseBody(req) {
  try {
    return await req.json();
  } catch {
    fail(400, 'Invalid JSON.');
  }
}

/* ── Origin Validation ───────────────────────────────────────── */

/**
 * Validates request origin against:
 * 1. Configured PUBLIC_ORIGIN (exact match)
 * 2. Any additional comma-separated origins in allowedOrigins
 * 3. Localhost / loopback origins (for development)
 */
export function isOriginAllowed(requestOrigin, configuredOrigin, extraAllowed = []) {
  if (!requestOrigin) return true; // server-side / direct requests
  if (requestOrigin === configuredOrigin) return true;
  if (extraAllowed.includes(requestOrigin)) return true;

  try {
    const url = new URL(requestOrigin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }
  } catch {
    // Malformed origin URL -> reject
  }

  return false;
}

/* ── Application Factory ─────────────────────────────────────── */

export function createApp({
  db,
  mediaDir,
  origin = 'http://localhost:3000',
  allowedOrigins = [],
}) {
  const secure = new URL(origin).protocol === 'https:';

  // Instantiate submodules
  const auth = createAuthModule({ db, origin, secure, fail, json, parseBody });
  const projects = createProjectsModule({ db, auth, fail, json, parseBody });
  const media = createMediaModule({ db, mediaDir, auth, fail, json });
  const inquiries = createInquiriesModule({ db, auth, json, parseBody });
  const settings = createSettingsModule({ db, auth, fail, json, parseBody });

  return async function handle(req) {
    try {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      // Origin validation
      const requestOrigin = req.headers.get('origin');
      if (!['GET', 'HEAD'].includes(method) && !isOriginAllowed(requestOrigin, origin, allowedOrigins)) {
        fail(403, 'Request origin is not allowed.');
      }

      // Health
      if (path === '/api/health' && method === 'GET') {
        db.prepare('SELECT 1').get();
        return json({ ok: true });
      }

      // Auth
      if (path === '/api/auth/login' && method === 'POST') return await auth.login(req);
      if (path === '/api/auth/me' && method === 'GET') return auth.me(req);
      if (path === '/api/auth/logout' && method === 'POST') return auth.logout(req);

      // Public Catalog & Settings
      if (path === '/api/catalog' && method === 'GET') return projects.catalog();
      if (path === '/api/public-settings' && method === 'GET') return settings.publicSettings();

      // Projects (Admin)
      if (path === '/api/projects') {
        if (method === 'GET') return projects.list(req, url);
        if (method === 'POST') return await projects.save(req);
        if (method === 'PATCH') return await projects.reorder(req);
        if (method === 'DELETE') return await projects.remove(req);
      }
      if (path === '/api/projects/restore' && method === 'POST') {
        return await projects.restore(req);
      }

      // Settings (Admin)
      if (path === '/api/settings') {
        if (method === 'GET') return settings.get(req);
        if (method === 'POST') return await settings.save(req);
      }

      // Media
      if (path === '/api/upload' && method === 'POST') return await media.upload(req);
      if (path.startsWith('/api/media/') && method === 'GET') return await media.serve(req, path);

      // Inquiries
      if (path === '/api/inquiries') {
        if (method === 'GET') return inquiries.list(req);
        if (method === 'POST') return await inquiries.submit(req);
      }

      fail(404, 'Not found.');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Check the required fields and image list.',
            fields: error.issues.map((i) => i.path.join('.')),
          },
          400
        );
      }
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }
      console.error('API failure:', error.message);
      return json(
        { error: 'Service temporarily unavailable. Your changes have not been confirmed.' },
        503
      );
    }
  };
}
