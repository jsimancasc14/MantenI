import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleLogin } from './api/core.js';
import handleApi from './api/core.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(root, '.env.local');
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.csv', 'text/csv; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webm', 'video/webm'],
  ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
]);

function loadLocalEnvironment() {
  if (!fs.existsSync(envFile)) {
    throw new Error('Falta .env.local. Cópiala desde .env.example y configura PostgreSQL.');
  }

  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    process.env[match[1]] = value;
  }

  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no está configurada en .env.local.');
  if (!process.env.AUTH_SECRET || Buffer.byteLength(process.env.AUTH_SECRET) < 32) {
    throw new Error('AUTH_SECRET debe tener al menos 32 bytes en .env.local.');
  }
}

function sendError(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

async function serveStatic(req, res, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return sendError(res, 400, 'Ruta inválida');
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.slice(1);
  const filePath = path.resolve(root, relativePath);
  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return sendError(res, 403, 'Acceso denegado');
  }

  const segments = relative.split(path.sep);
  if (segments.some(segment => segment.startsWith('.') || segment === 'node_modules' || segment === 'api')) {
    return sendError(res, 404, 'No encontrado');
  }

  const contentType = mimeTypes.get(path.extname(filePath).toLowerCase());
  if (!contentType) return sendError(res, 404, 'No encontrado');

  try {
    const stats = await fs.promises.stat(filePath);
    if (!stats.isFile()) return sendError(res, 404, 'No encontrado');
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return sendError(res, 404, 'No encontrado');
    }
    throw error;
  }
}

loadLocalEnvironment();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/backend/login.php' || url.pathname === '/api/login') {
    return handleLogin(req, res);
  }
  if (url.pathname === '/backend/api.php' || url.pathname === '/api/core') {
    return handleApi(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendError(res, 405, 'Método no permitido');
  }

  try {
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error('Error sirviendo archivo local:', error);
    if (!res.headersSent) sendError(res, 500, 'Error interno del servidor');
    else res.destroy(error);
  }
});

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un puerto válido entre 1 y 65535.');
}

server.listen(port, '127.0.0.1', () => {
  console.log(`MantTI disponible en http://localhost:${port}`);
});
