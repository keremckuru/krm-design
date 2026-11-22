import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try { process.loadEnvFile(resolve(root, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
export const config = { port: Number(process.env.PORT || process.env.BACKEND_PORT || 4000), host: process.env.BACKEND_HOST || '0.0.0.0', origin: process.env.PUBLIC_ORIGIN || 'http://localhost:3000', dataDir: resolve(root, process.env.DATA_DIR || 'data') };
