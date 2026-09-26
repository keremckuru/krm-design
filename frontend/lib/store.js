import 'server-only';
import { cookies } from 'next/headers';
async function get(path, authenticated = false) { const headers = {}; if (authenticated) headers.Cookie = (await cookies()).toString(); const response = await fetch((process.env.BACKEND_URL || 'http://127.0.0.1:4000') + '/api/' + path, { cache: 'no-store', headers, signal: AbortSignal.timeout(30000) }); if (!response.ok) throw new Error('Portfolio service unavailable'); return response.json(); }
export function catalog() { return get('catalog'); }
export function siteSettings() { return get('public-settings'); }
export async function isAdmin() { try { await get('auth/me', true); return true; } catch { return false; } }

export function sliceForClient(projects) {
    return projects.map(p => {
        const { description, images, ...rest } = p;
        return { ...rest, images: images && images.length ? [images[0]] : [] };
    });
}
