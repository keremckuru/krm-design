import 'server-only';
import { cookies } from 'next/headers';
import { initialProjects } from './catalog.js';

function getBackendBase() {
    const raw = process.env.BACKEND_URL;
    if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
        return raw.replace(/\/+$/, '');
    }
    return 'http://127.0.0.1:4000';
}

async function get(path, authenticated = false) {
    const headers = {};
    if (authenticated) headers.Cookie = (await cookies()).toString();
    const response = await fetch(getBackendBase() + '/api/' + path, {
        cache: 'no-store',
        headers,
        signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('Portfolio service unavailable');
    return response.json();
}

export async function catalog() {
    try {
        return await get('catalog');
    } catch {
        return initialProjects;
    }
}

export async function siteSettings() {
    try {
        return await get('public-settings');
    } catch {
        return { email: 'kerim.kuru59@gmail.com', terms: '' };
    }
}

export async function isAdmin() {
    try {
        await get('auth/me', true);
        return true;
    } catch {
        return false;
    }
}

export function sliceForClient(projects) {
    return projects.map(p => {
        const { description, images, ...rest } = p;
        return { ...rest, images: images && images.length ? [images[0]] : [] };
    });
}
