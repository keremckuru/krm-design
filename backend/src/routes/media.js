import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export function createMediaModule({ db, mediaDir, auth, fail, json }) {
  async function upload(req) {
    auth.requireAdmin(req);
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file.arrayBuffer !== 'function' || file.size > 12 * 1024 * 1024) {
      fail(400, 'Choose a JPG, PNG or WebP under 12 MB.');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    let metadata;
    try {
      metadata = await sharp(buffer, { limitInputPixels: 40000000 }).metadata();
    } catch {
      fail(400, 'This image could not be read.');
    }
    if (!['jpeg', 'png', 'webp'].includes(metadata.format) || metadata.pages > 1) {
      fail(400, 'Use a still JPG, PNG or WebP image.');
    }
    const id = randomUUID();
    const key = id + '.webp';
    await mkdir(mediaDir, { recursive: true });
    const files = [];
    try {
      for (const [suffix, width] of [['', 1800], ['-600', 600]]) {
        const name = id + suffix + '.webp';
        const output = await sharp(buffer, { limitInputPixels: 40000000 })
          .rotate()
          .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 88 })
          .toBuffer();
        await writeFile(join(mediaDir, name), output);
        files.push(name);
      }
      await writeFile(join(mediaDir, id + '.original'), buffer);
      files.push(id + '.original');
      db.prepare('INSERT INTO media VALUES(?,?)').run(key, new Date().toISOString());
    } catch (error) {
      await Promise.all(files.map(name => rm(join(mediaDir, name), { force: true })));
      throw error;
    }
    return json({ url: '/api/media/' + key, thumbnail: '/api/media/' + id + '-600.webp' });
  }

  async function serve(req, path) {
    const name = path.slice('/api/media/'.length);
    if (!/^[a-f0-9-]+(?:-600)?\.webp$/.test(name)) fail(404, 'Image not found.');
    const key = name.replace(/-600\.webp$/, '.webp');
    if (!db.prepare('SELECT 1 FROM media WHERE key=?').get(key)) fail(404, 'Image not found.');
    if (!auth.getUser(req) && !db.prepare('SELECT 1 FROM project_media m JOIN projects p ON p.slug=m.slug WHERE m.key=? AND p.published=1 AND p.deleted=0 LIMIT 1').get(key)) {
      fail(404, 'Image not found.');
    }
    let data;
    try {
      data = await readFile(join(mediaDir, name));
    } catch {
      fail(404, 'Image not found.');
    }
    return new Response(data, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return { upload, serve };
}
