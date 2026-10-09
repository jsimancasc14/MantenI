import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'mantti_session';
const SESSION_TTL_SECONDS = 30 * 60;
const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE']);
let pool;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getPool() {
  const required = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : undefined,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }
  return pool;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('AUTH_SECRET debe tener al menos 32 bytes');
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createSession(user, csrfToken = crypto.randomBytes(32).toString('hex')) {
  const payload = Buffer.from(JSON.stringify({
    sub: Number(user.id),
    username: user.username,
    name: user.name,
    role: user.role,
    csrf: csrfToken,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, csrfToken };
}

function setSessionCookie(res, token, maxAge = SESSION_TTL_SECONDS) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`);
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const entry = header.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
}

function readSession(req) {
  const token = readCookie(req, SESSION_COOKIE);
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  try {
    const expected = Buffer.from(sign(payload));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.sub || !session.csrf || !session.exp || session.exp <= Date.now() / 1000) return null;
    return { ...session, token };
  } catch {
    return null;
  }
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return Object.fromEntries(new URLSearchParams(req.body).entries());
    }
  }
  if (req.method === 'GET' || req.method === 'HEAD') return {};
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }
}

function actionFromRequest(req) {
  const url = new URL(req.url, 'https://mantti.invalid');
  return { action: url.searchParams.get('action') || 'dashboard', url };
}

function requireMethod(req, res, methods) {
  if (!methods.includes(req.method)) {
    sendJson(res, 405, { ok: false, error: 'Método no permitido' });
    return false;
  }
  return true;
}

function requireRole(res, user, roles) {
  if (!roles.includes(user.role)) {
    sendJson(res, 403, { ok: false, error: 'No tienes permisos para esta operación' });
    return false;
  }
  return true;
}

function csrfIsValid(req, session) {
  const supplied = req.headers['x-csrf-token'];
  return typeof supplied === 'string' && supplied.length === session.csrf.length &&
    crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(session.csrf));
}

function notFound(res) {
  sendJson(res, 404, { ok: false, error: 'Acción no encontrada' });
}

export async function handleLogin(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Método no permitido' });
  try {
    const input = await readBody(req);
    const username = String(input.username || input.usuario || '').trim().toLowerCase();
    const password = String(input.password || '');
    if (!username || !password) return sendJson(res, 400, { ok: false, error: 'Usuario y contraseña requeridos' });

    const [rows] = await getPool().execute(
      'SELECT id, username, nombre_completo, rol, password_hash FROM usuarios WHERE username = ? AND activo = 1 LIMIT 1',
      [username]
    );
    const user = rows[0];
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) return sendJson(res, 401, { ok: false, error: 'Credenciales inválidas' });

    const sessionUser = {
      id: Number(user.id),
      username: user.username,
      name: user.nombre_completo,
      role: user.rol
    };
    const session = createSession(sessionUser);
    setSessionCookie(res, session.token);
    return sendJson(res, 200, { ok: true, user: sessionUser, csrf_token: session.csrfToken });
  } catch (error) {
    console.error('Login error:', error);
    return sendJson(res, 500, { ok: false, error: 'No se pudo autenticar contra la base de datos' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    res.statusCode = 204;
    return res.end();
  }

  const { action, url } = actionFromRequest(req);
  if (action === 'login') return handleLogin(req, res);

  if (action === 'logout' && req.method === 'POST') {
    const session = readSession(req);
    if (!session) return sendJson(res, 401, { ok: false, error: 'No autenticado' });
    if (!csrfIsValid(req, session)) return sendJson(res, 403, { ok: false, error: 'Token de seguridad inválido' });
    clearSessionCookie(res);
    return sendJson(res, 200, { ok: true, message: 'Sesión cerrada' });
  }

  const session = readSession(req);
  if (!session) return sendJson(res, 401, { ok: false, error: 'No autenticado' });
  if (WRITE_METHODS.has(req.method) && !csrfIsValid(req, session)) {
    return sendJson(res, 403, { ok: false, error: 'Token de seguridad inválido' });
  }

  try {
    const db = getPool();
    const [activeUsers] = await db.execute(
      'SELECT id, username, nombre_completo, rol FROM usuarios WHERE id = ? AND activo = 1 LIMIT 1',
      [session.sub]
    );
    const dbUser = activeUsers[0];
    if (!dbUser) {
      clearSessionCookie(res);
      return sendJson(res, 401, { ok: false, error: 'Sesión expirada' });
    }
    const user = { id: Number(dbUser.id), username: dbUser.username, name: dbUser.nombre_completo, role: dbUser.rol };
    const refreshedSession = createSession(user, session.csrf);
    setSessionCookie(res, refreshedSession.token);

    if (action === 'session') {
      if (!requireMethod(req, res, ['GET'])) return;
      return sendJson(res, 200, { ok: true, user, csrf_token: refreshedSession.csrfToken });
    }
    if (action === 'logout') return sendJson(res, 405, { ok: false, error: 'Método no permitido' });

    if (action === 'dashboard') {
      if (!requireMethod(req, res, ['GET'])) return;
      const [[inventory]] = await db.execute('SELECT COUNT(*) AS total FROM equipos');
      const [[orders]] = await db.execute("SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE estado != 'Cerrado'");
      const [[preventives]] = await db.execute("SELECT COUNT(*) AS total FROM preventivos WHERE estado = 'Programado'");
      return sendJson(res, 200, { ok: true, dashboard: {
        total_equipos: Number(inventory.total),
        ordenes_abiertas: Number(orders.total),
        preventivos_programados: Number(preventives.total)
      } });
    }

    if (action === 'inventario') {
      if (req.method === 'GET') {
        const [rows] = await db.execute('SELECT * FROM equipos ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      if (req.method !== 'POST') return requireMethod(req, res, ['GET', 'POST']);
      if (!requireRole(res, user, ['administrador', 'director'])) return;
      const input = await readBody(req);
      const required = ['codigo', 'tipo', 'marca', 'modelo', 'serial', 'numero_interno', 'dependencia', 'responsable', 'ubicacion'];
      for (const field of required) {
        if (!String(input[field] || '').trim()) return sendJson(res, 422, { ok: false, error: `El campo ${field} es obligatorio` });
      }
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.execute(
          `INSERT INTO equipos (codigo, tipo, marca, modelo, serial, numero_interno, dependencia, responsable, ubicacion, estado, procesador, ram, disco, sistema_operativo, office, programas, observaciones)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [input.codigo, input.tipo, input.marca, input.modelo, input.serial, input.numero_interno, input.dependencia, input.responsable, input.ubicacion,
            input.estado || 'Operativo', input.procesador || null, input.ram || null, input.disco || null, input.sistema_operativo || null,
            input.office || null, input.programas || null, input.observaciones || null]
        );
        await connection.execute(
          'INSERT INTO historial_equipos (equipo_codigo, accion, descripcion, usuario_id) VALUES (?, ?, ?, ?)',
          [input.codigo, 'Registro creado', 'Equipo incorporado al inventario institucional', user.id]
        );
        await connection.commit();
        return sendJson(res, 201, { ok: true, id: result.insertId });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    if (action === 'historial') {
      if (!requireMethod(req, res, ['GET'])) return;
      const codigo = (url.searchParams.get('equipo') || '').trim();
      if (!codigo) return sendJson(res, 422, { ok: false, error: 'Equipo requerido' });
      const [rows] = await db.execute(
        'SELECT h.id, h.accion, h.descripcion, h.created_at, COALESCE(u.nombre_completo, "Sistema") AS usuario FROM historial_equipos h LEFT JOIN usuarios u ON u.id = h.usuario_id WHERE h.equipo_codigo = ? ORDER BY h.created_at DESC, h.id DESC',
        [codigo]
      );
      return sendJson(res, 200, { ok: true, data: rows });
    }

    if (action === 'documentos') {
      const codigo = (url.searchParams.get('equipo') || '').trim();
      if (!codigo) return sendJson(res, 422, { ok: false, error: 'Equipo requerido' });
      if (req.method === 'GET') {
        const [rows] = await db.execute(
          'SELECT d.id, d.nombre_archivo, d.tipo, d.tamano, d.created_at, COALESCE(u.nombre_completo, "Sistema") AS usuario FROM documentos_equipos d LEFT JOIN usuarios u ON u.id = d.usuario_id WHERE d.equipo_codigo = ? ORDER BY d.created_at DESC',
          [codigo]
        );
        return sendJson(res, 200, { ok: true, data: rows });
      }
      if (req.method !== 'POST') return requireMethod(req, res, ['GET', 'POST']);
      if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
      return sendJson(res, 503, { ok: false, error: 'La carga de archivos requiere configurar almacenamiento persistente (por ejemplo, Vercel Blob).' });
    }

    if (action === 'documento') {
      if (!requireMethod(req, res, ['GET'])) return;
      if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
      return sendJson(res, 503, { ok: false, error: 'La descarga de archivos requiere configurar almacenamiento persistente.' });
    }

    if (action === 'backup') {
      if (!requireMethod(req, res, ['GET'])) return;
      if (!requireRole(res, user, ['administrador', 'director'])) return;
      const backup = { generated_at: new Date().toISOString(), generated_by: user.username };
      for (const table of ['usuarios', 'equipos', 'ordenes_trabajo', 'preventivos', 'dependencias', 'tecnicos', 'repuestos', 'historial_equipos', 'documentos_equipos']) {
        const [rows] = table === 'usuarios'
          ? await db.execute('SELECT id, username, nombre_completo, rol, activo, created_at FROM usuarios')
          : await db.query(`SELECT * FROM ${table}`);
        backup[table] = rows;
      }
      res.setHeader('Content-Disposition', `attachment; filename="mantenti-backup-${new Date().toISOString().slice(0, 10)}.json"`);
      return sendJson(res, 200, backup);
    }

    if (action === 'ordenes') {
      if (req.method === 'GET') {
        const [rows] = await db.execute('SELECT * FROM ordenes_trabajo ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      const input = await readBody(req);
      if (req.method === 'POST') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        const fields = ['codigo', 'equipo_codigo', 'tipo', 'prioridad', 'solicitante', 'dependencia_solicitante', 'tecnico', 'falla', 'fecha_solicitud', 'fecha_programada'];
        if (fields.some(field => !String(input[field] || '').trim())) return sendJson(res, 422, { ok: false, error: 'Faltan campos obligatorios de la orden' });
        const [result] = await db.execute(
          `INSERT INTO ordenes_trabajo (codigo, equipo_codigo, tipo, prioridad, solicitante, dependencia_solicitante, tecnico, falla, diagnostico_inicial, fecha_solicitud, fecha_programada, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Programado')`,
          [input.codigo, input.equipo_codigo, input.tipo, input.prioridad, input.solicitante, input.dependencia_solicitante,
            input.tecnico, input.falla, input.diagnostico_inicial || '', input.fecha_solicitud, input.fecha_programada]
        );
        return sendJson(res, 201, { ok: true, id: result.insertId });
      }
      if (req.method === 'PUT') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor', 'tecnico'])) return;
        const codigo = String(input.codigo || '').trim();
        const estado = String(input.estado || '').trim();
        if (!codigo || !estado) return sendJson(res, 422, { ok: false, error: 'Orden y estado son obligatorios' });
        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();
          const [rows] = await connection.execute('SELECT equipo_codigo FROM ordenes_trabajo WHERE codigo = ? LIMIT 1', [codigo]);
          if (!rows.length) {
            await connection.rollback();
            return sendJson(res, 404, { ok: false, error: 'Orden no encontrada' });
          }
          await connection.execute(
            `UPDATE ordenes_trabajo SET estado = ?, fecha_cierre = ?, actividades = ?, repuestos = ?, horas = ?, diagnostico_final = ?, estado_equipo_cierre = ?, observaciones = ? WHERE codigo = ?`,
            [estado, input.fecha_cierre || null, input.actividades || '', input.repuestos || '', Number(input.horas || 0),
              input.diagnostico_final || '', input.estado_equipo_cierre || null, input.observaciones || '', codigo]
          );
          await connection.execute(
            'INSERT INTO historial_equipos (equipo_codigo, accion, descripcion, usuario_id) VALUES (?, ?, ?, ?)',
            [rows[0].equipo_codigo, 'Orden actualizada', `La orden ${codigo} cambió a ${estado}`, user.id]
          );
          if (estado === 'Cerrado' && input.estado_equipo_cierre) {
            await connection.execute('UPDATE equipos SET estado = ? WHERE codigo = ?', [input.estado_equipo_cierre, rows[0].equipo_codigo]);
          }
          await connection.commit();
          return sendJson(res, 200, { ok: true });
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      }
      return requireMethod(req, res, ['GET', 'POST', 'PUT']);
    }

    if (action === 'preventivos') {
      if (req.method === 'GET') {
        const [rows] = await db.execute('SELECT * FROM preventivos ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      const input = await readBody(req);
      if (req.method === 'POST') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        const fields = ['codigo', 'equipo_codigo', 'dependencia', 'frecuencia', 'proximo_mantenimiento', 'tecnico', 'actividades'];
        if (fields.some(field => !String(input[field] || '').trim())) return sendJson(res, 422, { ok: false, error: 'Faltan campos obligatorios del preventivo' });
        const [result] = await db.execute(
          `INSERT INTO preventivos (codigo, equipo_codigo, dependencia, frecuencia, ultimo_mantenimiento, proximo_mantenimiento, tecnico, actividades, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Programado')`,
          [input.codigo, input.equipo_codigo, input.dependencia, input.frecuencia, input.ultimo_mantenimiento || null,
            input.proximo_mantenimiento, input.tecnico, input.actividades]
        );
        return sendJson(res, 201, { ok: true, id: result.insertId });
      }
      if (req.method === 'PUT') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor', 'tecnico'])) return;
        const fields = ['codigo', 'estado', 'proximo_mantenimiento'];
        if (fields.some(field => !String(input[field] || '').trim())) return sendJson(res, 422, { ok: false, error: 'Código, estado y próxima fecha son obligatorios' });
        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();
          const [result] = await connection.execute(
            'UPDATE preventivos SET estado = ?, ultimo_mantenimiento = ?, proximo_mantenimiento = ? WHERE codigo = ?',
            [input.estado, input.ultimo_mantenimiento || null, input.proximo_mantenimiento, input.codigo]
          );
          if (!result.affectedRows) {
            await connection.rollback();
            return sendJson(res, 404, { ok: false, error: 'Plan no encontrado' });
          }
          await connection.execute(
            'INSERT INTO historial_equipos (equipo_codigo, accion, descripcion, usuario_id) SELECT equipo_codigo, ?, ?, ? FROM preventivos WHERE codigo = ?',
            ['Preventivo actualizado', `El plan ${input.codigo} cambió a ${input.estado}`, user.id, input.codigo]
          );
          await connection.commit();
          return sendJson(res, 200, { ok: true });
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      }
      return requireMethod(req, res, ['GET', 'POST', 'PUT']);
    }

    if (action === 'catalogos') {
      if (!requireMethod(req, res, ['GET'])) return;
      const [dependencias] = await db.execute('SELECT * FROM dependencias ORDER BY id DESC');
      const [tecnicos] = await db.execute('SELECT * FROM tecnicos ORDER BY id DESC');
      const [repuestos] = await db.execute('SELECT * FROM repuestos ORDER BY id DESC');
      return sendJson(res, 200, { ok: true, data: { dependencias, tecnicos, repuestos } });
    }

    return notFound(res);
  } catch (error) {
    console.error('API error:', error);
    return sendJson(res, 500, { ok: false, error: 'Error en la API' });
  }
}
