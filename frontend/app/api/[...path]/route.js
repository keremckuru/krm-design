export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
async function proxy(request, { params }) {
    const { path } = await params;
    const rawBase = process.env.BACKEND_URL;
    const base = (rawBase && (rawBase.startsWith('http://') || rawBase.startsWith('https://')))
        ? rawBase.replace(/\/+$/, '')
        : 'http://127.0.0.1:4000';
    if (path[0] === 'debug-me') return Response.json({ backend: base });
    const target = new URL('/api/' + path.map(encodeURIComponent).join('/'), base); target.search = new URL(request.url).search;
    const headers = new Headers(); for (const key of ['content-type', 'cookie', 'origin']) { const value = request.headers.get(key); if (value) headers.set(key, value); }
    try {
        const upstream = await fetch(target, { method: request.method, headers, body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body, duplex: 'half', redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(30000) });
        const outgoing = new Headers(); for (const key of ['content-type', 'set-cookie', 'cache-control', 'x-order-revision', 'x-content-type-options']) { const value = upstream.headers.get(key); if (value) outgoing.set(key, value); }
        if (['POST', 'PATCH', 'DELETE'].includes(request.method) && upstream.status >= 200 && upstream.status < 300) {
            revalidatePath('/', 'layout');
        }
        return new Response(upstream.body, { status: upstream.status, headers: outgoing });
    } catch (e) {
        console.error('API Proxy Error:', e.message, 'Target:', target.toString());
        return Response.json({ error: 'Service temporarily unavailable. Please try again.', details: e.message }, { status: 503 });
    }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
