import { createServer } from 'node:http';
import { join } from 'node:path';
import { config } from './config.js';
import { openDatabase } from './database.js';
import { createApp } from './app.js';

const db = openDatabase(join(config.dataDir, 'portfolio.sqlite'));
const app = createApp({
  db,
  mediaDir: join(config.dataDir, 'media'),
  origin: config.origin,
  allowedOrigins: config.allowedOrigins,
});

const server = createServer(async (req, res) => {
  try {
    const chunks = [];
    let size = 0;
    const maximum = req.url?.startsWith('/api/upload') ? 13 * 1024 * 1024 : 128 * 1024;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > maximum) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end('{"error":"Request is too large."}');
        return;
      }
      chunks.push(chunk);
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    const request = new Request('http://backend' + req.url, {
      method: req.method,
      headers,
      ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}),
    });
    const response = await app(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('Request failed:', error.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end('{"error":"Request failed."}');
  }
});

server.requestTimeout = 30000;
server.headersTimeout = 15000;
server.listen(config.port, config.host, () =>
  console.log(`KRM backend running at http://${config.host}:${config.port}`)
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    })
  );
}
