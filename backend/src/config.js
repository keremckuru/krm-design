import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Load .env file if present
try {
  process.loadEnvFile(resolve(root, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const dataDir = resolve(root, process.env.DATA_DIR || 'data');

// Warn if DATA_DIR is inside an ephemeral path (e.g., /tmp on serverless or cloud containers)
if (dataDir.startsWith('/tmp') || dataDir.startsWith('/var/tmp')) {
  console.warn(
    '[config] ⚠️ WARNING: DATA_DIR is located in a temporary directory (' +
      dataDir +
      '). SQLite data and uploaded media will be lost on container restart. Configure a persistent volume mount for production.'
  );
}

const origin = process.env.PUBLIC_ORIGIN || 'http://localhost:3000';
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

export const config = {
  port: Number(process.env.PORT || process.env.BACKEND_PORT || 4000),
  host: process.env.BACKEND_HOST || '0.0.0.0',
  origin,
  allowedOrigins,
  dataDir,
};
