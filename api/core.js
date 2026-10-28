import crypto from 'node:crypto';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const SESSION_COOKIE = 'mantti_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE']);
const LOGIN_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT_MAX_ATTEMPTS = 5;
const loginAttempts = new Map();
const assistantRequests = new Map();
let pool;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('Falta la variable de entorno DATABASE_URL');
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : undefined,
      max: 5,
      idleTimeoutMillis: 10000
    });
  }
  return pool;
}

function loginRateLimitKeys(req, username) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : 'unknown';
  return [`ip:${ip}`, `account:${username}`];
}

function checkLoginRateLimit(key, now = Date.now()) {
  const record = loginAttempts.get(key);
  if (!record || now - record.startedAt >= LOGIN_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, count: 0 });
    return { allowed: true, retryAfter: 0 };
  }
  if (record.count >= LOGIN_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((record.startedAt + LOGIN_LIMIT_WINDOW_MS - now) / 1000))
    };
  }
  return { allowed: true, retryAfter: 0 };
}

function recordFailedLogin(key, now = Date.now()) {
  const record = loginAttempts.get(key);
  if (!record || now - record.startedAt >= LOGIN_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, count: 1 });
  } else {
    record.count += 1;
  }
  if (loginAttempts.size > 5000) {
    for (const [attemptKey, attempt] of loginAttempts) {
      if (now - attempt.startedAt >= LOGIN_LIMIT_WINDOW_MS) loginAttempts.delete(attemptKey);
    }
  }
}

function clearFailedLogins(key) {
  loginAttempts.delete(key);
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

async function isActiveTechnician(db, name) {
  const { rows } = await db.query(
    'SELECT EXISTS (SELECT 1 FROM tecnicos WHERE LOWER(BTRIM(nombre)) = LOWER(BTRIM($1)) AND activo = 1) AS enabled',
    [name]
  );
  return rows[0].enabled;
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

    const rateLimitKeys = loginRateLimitKeys(req, username);
    const rateLimits = rateLimitKeys.map(key => checkLoginRateLimit(key));
    const blocked = rateLimits.find(rateLimit => !rateLimit.allowed);
    if (blocked) {
      res.setHeader('Retry-After', String(blocked.retryAfter));
      return sendJson(res, 429, { ok: false, error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' });
    }

    const { rows } = await getPool().query(
      'SELECT id, username, nombre_completo, rol, password_hash FROM usuarios WHERE username = $1 AND activo = 1 LIMIT 1',
      [username]
    );
    const user = rows[0];
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!valid) {
      rateLimitKeys.forEach(key => recordFailedLogin(key));
      return sendJson(res, 401, { ok: false, error: 'Credenciales inválidas' });
    }
    rateLimitKeys.forEach(clearFailedLogins);

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
    const { rows: activeUsers } = await db.query(
      'SELECT id, username, nombre_completo, rol FROM usuarios WHERE id = $1 AND activo = 1 LIMIT 1',
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
      const [{ rows: inventoryRows }, { rows: printerRows }, { rows: orderRows }, { rows: preventiveRows }] = await Promise.all([
        db.query('SELECT COUNT(*) AS total FROM equipos'),
        db.query('SELECT COUNT(*) AS total FROM impresoras'),
        db.query("SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE estado != 'Cerrado'"),
        db.query("SELECT COUNT(*) AS total FROM preventivos WHERE estado = 'Programado'")
      ]);
      const inventory = inventoryRows[0];
      const printers = printerRows[0];
      const orders = orderRows[0];
      const preventives = preventiveRows[0];
      return sendJson(res, 200, { ok: true, dashboard: {
        total_equipos: Number(inventory.total),
        total_impresoras: Number(printers.total),
        ordenes_abiertas: Number(orders.total),
        preventivos_programados: Number(preventives.total)
      } });
    }

    if (action === 'assistant') {
      if (!requireMethod(req, res, ['POST'])) return;
      const now = Date.now();
      const recentRequests = (assistantRequests.get(user.id) || []).filter(time => now - time < 60_000);
      if (recentRequests.length >= 8) {
        res.setHeader('Retry-After', '60');
        return sendJson(res, 429, { ok: false, error: 'Límite temporal del asistente alcanzado. Vuelve a intentarlo en un minuto.' });
      }
      recentRequests.push(now);
      assistantRequests.set(user.id, recentRequests);
      const input = await readBody(req);
      const question = String(input.question || '').trim();
      if (!question || question.length > 500) {
        return sendJson(res, 422, { ok: false, error: 'Escribe una pregunta de hasta 500 caracteres.' });
      }
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return sendJson(res, 503, { ok: false, error: 'El asistente aún no está configurado. Falta OPENAI_API_KEY en las variables del servidor.' });

      const [{ rows: equipment }, { rows: printers }, { rows: openOrders }, { rows: planned }] = await Promise.all([
        db.query('SELECT COUNT(*) AS total FROM equipos'),
        db.query('SELECT COUNT(*) AS total FROM impresoras'),
        db.query("SELECT COUNT(*) AS total FROM ordenes_trabajo WHERE estado != 'Cerrado'"),
        db.query("SELECT COUNT(*) AS total FROM preventivos WHERE estado = 'Programado'")
      ]);
      const summary = {
        equipos_registrados: Number(equipment[0].total),
        impresoras_registradas: Number(printers[0].total),
        ordenes_abiertas: Number(openOrders[0].total),
        preventivos_programados: Number(planned[0].total)
      };
      const aiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          instructions: 'Eres el asistente de ManténTI para orientar al personal de soporte TI. Responde en español, con claridad y en máximo 120 palabras. Usa solo las cifras agregadas proporcionadas; no inventes detalles de equipos, personas, ubicaciones ni causas. Si faltan datos para una conclusión, dilo y sugiere qué consultar en los módulos. No afirmes haber ejecutado acciones.',
          input: `Resumen actual (solo totales, sin datos personales): ${JSON.stringify(summary)}\nPregunta: ${question}`,
          max_output_tokens: 220,
          store: false
        })
      });
      const payload = await aiResponse.json().catch(() => ({}));
      if (!aiResponse.ok) {
        console.error('OpenAI assistant error:', payload.error?.type || aiResponse.status);
        return sendJson(res, 502, { ok: false, error: 'El asistente no pudo responder ahora. Inténtalo de nuevo más tarde.' });
      }
      const answer = (payload.output || []).flatMap(item => item.content || [])
        .filter(item => item.type === 'output_text').map(item => item.text).join('\n').trim();
      if (!answer) return sendJson(res, 502, { ok: false, error: 'El asistente devolvió una respuesta vacía. Inténtalo de nuevo.' });
      return sendJson(res, 200, { ok: true, answer, data_scope: 'totales agregados' });
    }

    if (action === 'inventario') {
      if (req.method === 'GET') {
        const { rows } = await db.query('SELECT * FROM equipos ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      if (req.method !== 'POST') return requireMethod(req, res, ['GET', 'POST']);
      if (!requireRole(res, user, ['administrador', 'director'])) return;
      const input = await readBody(req);
      const required = ['codigo', 'tipo', 'marca', 'modelo', 'serial', 'numero_interno', 'dependencia', 'responsable', 'ubicacion'];
      for (const field of required) {
        if (!String(input[field] || '').trim()) return sendJson(res, 422, { ok: false, error: `El campo ${field} es obligatorio` });
      }
      const connection = await db.connect();
      try {
        await connection.query('BEGIN');
        const result = await connection.query(
          `INSERT INTO equipos (codigo, tipo, marca, modelo, serial, numero_interno, dependencia, responsable, ubicacion, estado, procesador, ram, disco, sistema_operativo, office, programas, observaciones)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
          [input.codigo, input.tipo, input.marca, input.modelo, input.serial, input.numero_interno, input.dependencia, input.responsable, input.ubicacion,
            input.estado || 'Operativo', input.procesador || null, input.ram || null, input.disco || null, input.sistema_operativo || null,
            input.office || null, input.programas || null, input.observaciones || null]
        );
        await connection.query(
          'INSERT INTO historial_equipos (equipo_codigo, accion, descripcion, usuario_id) VALUES ($1, $2, $3, $4)',
          [input.codigo, 'Registro creado', 'Equipo incorporado al inventario institucional', user.id]
        );
        await connection.query('COMMIT');
        return sendJson(res, 201, { ok: true, id: result.rows[0].id });
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      } finally {
        connection.release();
      }
    }

    if (action === 'historial') {
      if (!requireMethod(req, res, ['GET'])) return;
      const codigo = (url.searchParams.get('equipo') || '').trim();
      if (!codigo) return sendJson(res, 422, { ok: false, error: 'Equipo requerido' });
      const { rows } = await db.query(
        "SELECT h.id, h.accion, h.descripcion, h.created_at, COALESCE(u.nombre_completo, 'Sistema') AS usuario FROM historial_equipos h LEFT JOIN usuarios u ON u.id = h.usuario_id WHERE h.equipo_codigo = $1 ORDER BY h.created_at DESC, h.id DESC",
        [codigo]
      );
      return sendJson(res, 200, { ok: true, data: rows });
    }

    if (action === 'documentos') {
      const codigo = (url.searchParams.get('equipo') || '').trim();
      if (!codigo) return sendJson(res, 422, { ok: false, error: 'Equipo requerido' });
      if (req.method === 'GET') {
        const { rows } = await db.query(
          "SELECT d.id, d.nombre_archivo, d.tipo, d.tamano, d.created_at, COALESCE(u.nombre_completo, 'Sistema') AS usuario FROM documentos_equipos d LEFT JOIN usuarios u ON u.id = d.usuario_id WHERE d.equipo_codigo = $1 ORDER BY d.created_at DESC",
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
        const result = table === 'usuarios'
          ? await db.query('SELECT id, username, nombre_completo, rol, activo, created_at FROM usuarios')
          : await db.query(`SELECT * FROM ${table}`);
        backup[table] = result.rows;
      }
      res.setHeader('Content-Disposition', `attachment; filename="mantenti-backup-${new Date().toISOString().slice(0, 10)}.json"`);
      return sendJson(res, 200, backup);
    }

    if (action === 'ordenes') {
      if (req.method === 'GET') {
        const { rows } = await db.query('SELECT * FROM ordenes_trabajo ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      if (req.method === 'DELETE') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        const input = await readBody(req);
        const codigo = String(input.codigo || '').trim();
        if (!codigo) return sendJson(res, 422, { ok: false, error: 'El c\u00f3digo de la orden es obligatorio' });
        const { rows } = await db.query('DELETE FROM ordenes_trabajo WHERE codigo = $1 RETURNING codigo', [codigo]);
        if (!rows.length) return sendJson(res, 404, { ok: false, error: 'Orden no encontrada' });
        return sendJson(res, 200, { ok: true });
      }
      const input = await readBody(req);
      if (req.method === 'POST') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        const fields = ['codigo', 'equipo_codigo', 'tipo', 'prioridad', 'solicitante', 'dependencia_solicitante', 'tecnico', 'falla', 'fecha_solicitud', 'fecha_programada'];
        if (fields.some(field => !String(input[field] || '').trim())) return sendJson(res, 422, { ok: false, error: 'Faltan campos obligatorios de la orden' });
        if (!await isActiveTechnician(db, input.tecnico)) {
          return sendJson(res, 422, { ok: false, error: 'El técnico asignado no está habilitado' });
        }
          const result = await db.query(
          `INSERT INTO ordenes_trabajo (codigo, equipo_codigo, tipo, prioridad, solicitante, dependencia_solicitante, tecnico, falla, diagnostico_inicial, fecha_solicitud, fecha_programada, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Programado') RETURNING id`,
          [input.codigo, input.equipo_codigo, input.tipo, input.prioridad, input.solicitante, input.dependencia_solicitante,
            input.tecnico, input.falla, input.diagnostico_inicial || '', input.fecha_solicitud, input.fecha_programada]
        );
        return sendJson(res, 201, { ok: true, id: result.rows[0].id });
      }
      if (req.method === 'PUT') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor', 'tecnico'])) return;
        const codigo = String(input.codigo || '').trim();
        const estado = String(input.estado || '').trim();
        if (!codigo || !estado) return sendJson(res, 422, { ok: false, error: 'Orden y estado son obligatorios' });
        const connection = await db.connect();
        try {
          await connection.query('BEGIN');
          const { rows } = await connection.query('SELECT equipo_codigo FROM ordenes_trabajo WHERE codigo = $1 LIMIT 1', [codigo]);
          if (!rows.length) {
            await connection.query('ROLLBACK');
            return sendJson(res, 404, { ok: false, error: 'Orden no encontrada' });
          }
          await connection.query(
            `UPDATE ordenes_trabajo SET estado = $1, fecha_cierre = $2, actividades = $3, repuestos = $4, horas = $5, diagnostico_final = $6, estado_equipo_cierre = $7, observaciones = $8 WHERE codigo = $9`,
            [estado, input.fecha_cierre || null, input.actividades || '', input.repuestos || '', Number(input.horas || 0),
              input.diagnostico_final || '', input.estado_equipo_cierre || null, input.observaciones || '', codigo]
          );
          await connection.query(
            'INSERT INTO historial_equipos (equipo_codigo, accion, descripcion, usuario_id) VALUES ($1, $2, $3, $4)',
            [rows[0].equipo_codigo, 'Orden actualizada', `La orden ${codigo} cambió a ${estado}`, user.id]
          );
          if (estado === 'Cerrado' && input.estado_equipo_cierre) {
            await connection.query('UPDATE equipos SET estado = $1 WHERE codigo = $2', [input.estado_equipo_cierre, rows[0].equipo_codigo]);
          }
          await connection.query('COMMIT');
          return sendJson(res, 200, { ok: true });
        } catch (error) {
          await connection.query('ROLLBACK');
          throw error;
        } finally {
          connection.release();
        }
      }
      return requireMethod(req, res, ['GET', 'POST', 'PUT']);
    }

    if (action === 'preventivos') {
      if (req.method === 'GET') {
        const { rows } = await db.query('SELECT * FROM preventivos ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      const input = await readBody(req);
      if (req.method === 'POST') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        const planes = Array.isArray(input.planes) ? input.planes : [input];
        const fields = ['frecuencia', 'proximo_mantenimiento', 'actividades'];
        if (!planes.length || planes.length > 1000 || fields.some(field => !String(input[field] || '').trim()) ||
            planes.some(plan => ['codigo', 'equipo_codigo', 'dependencia'].some(field => !String(plan[field] || '').trim()) || !String(plan.tecnico || input.tecnico || '').trim())) {
          return sendJson(res, 422, { ok: false, error: 'Faltan datos obligatorios del plan preventivo' });
        }
        const codigos = planes.map(plan => String(plan.codigo).trim());
        if (new Set(codigos).size !== codigos.length) return sendJson(res, 422, { ok: false, error: 'Los codigos de los planes deben ser unicos' });
        const tecnicos = new Set(planes.map(plan => String(plan.tecnico || input.tecnico || '').trim()));
        for (const tecnico of tecnicos) {
          if (!await isActiveTechnician(db, tecnico)) {
            return sendJson(res, 422, { ok: false, error: 'El tecnico asignado no esta habilitado' });
          }
        }
        const grupoCodigo = String(input.grupo_codigo || '').trim();
        const connection = await db.connect();
        try {
          await connection.query('BEGIN');
          if (grupoCodigo) await connection.query('ALTER TABLE preventivos ADD COLUMN IF NOT EXISTS grupo_codigo VARCHAR(50)');
          if (grupoCodigo) {
            await connection.query(
              `UPDATE preventivos p SET grupo_codigo = 'PG-' || md5(p.created_at::text)
                WHERE p.grupo_codigo IS NULL
                  AND p.codigo NOT IN ('PR-001', 'PR-002', 'PR-003')
                  AND p.created_at IN (SELECT created_at FROM preventivos WHERE codigo NOT IN ('PR-001', 'PR-002', 'PR-003') GROUP BY created_at HAVING COUNT(*) > 1)`
            );
          }
          for (const plan of planes) {
            const insertFields = grupoCodigo
              ? 'codigo, equipo_codigo, dependencia, frecuencia, ultimo_mantenimiento, proximo_mantenimiento, tecnico, actividades, estado, grupo_codigo'
              : 'codigo, equipo_codigo, dependencia, frecuencia, ultimo_mantenimiento, proximo_mantenimiento, tecnico, actividades, estado';
            const values = grupoCodigo
              ? [String(plan.codigo).trim(), String(plan.equipo_codigo).trim(), String(plan.dependencia).trim(), input.frecuencia,
                  input.ultimo_mantenimiento || null, input.proximo_mantenimiento, String(plan.tecnico || input.tecnico).trim(), input.actividades, grupoCodigo]
              : [String(plan.codigo).trim(), String(plan.equipo_codigo).trim(), String(plan.dependencia).trim(), input.frecuencia,
                  input.ultimo_mantenimiento || null, input.proximo_mantenimiento, String(plan.tecnico || input.tecnico).trim(), input.actividades];
            const placeholders = grupoCodigo
              ? "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Programado', $9)"
              : "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Programado')";
            await connection.query('INSERT INTO preventivos (' + insertFields + ') ' + placeholders, values);
          }
          await connection.query('COMMIT');
        } catch (error) {
          await connection.query('ROLLBACK');
          throw error;
        } finally {
          connection.release();
        }
        return sendJson(res, 201, { ok: true, cantidad: planes.length });
      }
      if (req.method === 'PUT') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor', 'tecnico'])) return;
        if (input.operacion === 'editar') {
          if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
          const fields = ['codigo', 'equipo_codigo', 'dependencia', 'frecuencia', 'proximo_mantenimiento', 'tecnico', 'actividades'];
          if (fields.some(field => !String(input[field] || '').trim())) return sendJson(res, 422, { ok: false, error: 'Faltan campos obligatorios del preventivo' });
          if (!await isActiveTechnician(db, input.tecnico)) return sendJson(res, 422, { ok: false, error: 'El técnico asignado no está habilitado' });
          const result = await db.query(
            `UPDATE preventivos SET equipo_codigo = $1, dependencia = $2, frecuencia = $3,
              ultimo_mantenimiento = $4, proximo_mantenimiento = $5, tecnico = $6, actividades = $7
             WHERE codigo = $8 RETURNING codigo`,
            [input.equipo_codigo, input.dependencia, input.frecuencia, input.ultimo_mantenimiento || null,
              input.proximo_mantenimiento, input.tecnico, input.actividades, input.codigo]
          );
          if (!result.rowCount) return sendJson(res, 404, { ok: false, error: 'Plan no encontrado' });
          return sendJson(res, 200, { ok: true });
        }
        if (Object.hasOwn(input, 'firma')) {
          const firma = String(input.firma).trim();
          const codigo = String(input.codigo || '').trim();
          if (!codigo || !['Sí', 'No'].includes(firma)) {
            return sendJson(res, 422, { ok: false, error: 'Código y firma válida (Sí o No) son obligatorios' });
          }
          const result = await db.query('UPDATE preventivos SET firma = $1 WHERE codigo = $2', [firma, codigo]);
          if (!result.rowCount) return sendJson(res, 404, { ok: false, error: 'Plan no encontrado' });
          return sendJson(res, 200, { ok: true });
        }
        const fields = ['codigo', 'estado', 'proximo_mantenimiento'];
        if (fields.some(field => !String(input[field] || '').trim())) return sendJson(res, 422, { ok: false, error: 'Código, estado y próxima fecha son obligatorios' });
        const connection = await db.connect();
        try {
          await connection.query('BEGIN');
          const result = await connection.query(
            'UPDATE preventivos SET estado = $1, ultimo_mantenimiento = $2, proximo_mantenimiento = $3 WHERE codigo = $4',
            [input.estado, input.ultimo_mantenimiento || null, input.proximo_mantenimiento, input.codigo]
          );
          if (!result.rowCount) {
            await connection.query('ROLLBACK');
            return sendJson(res, 404, { ok: false, error: 'Plan no encontrado' });
          }
          await connection.query(
            'INSERT INTO historial_equipos (equipo_codigo, accion, descripcion, usuario_id) SELECT equipo_codigo, $1, $2, $3 FROM preventivos WHERE codigo = $4',
            ['Preventivo actualizado', `El plan ${input.codigo} cambió a ${input.estado}`, user.id, input.codigo]
          );
          await connection.query('COMMIT');
          return sendJson(res, 200, { ok: true });
        } catch (error) {
          await connection.query('ROLLBACK');
          throw error;
        } finally {
          connection.release();
        }
      }
      if (req.method === 'DELETE') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        if (Array.isArray(input.codigos)) {
          const codigos = [...new Set(input.codigos.map(codigo => String(codigo || '').trim()).filter(Boolean))];
          if (!codigos.length || codigos.length > 1000) return sendJson(res, 422, { ok: false, error: 'Selecciona entre 1 y 1000 planes para eliminar' });
          const result = await db.query('DELETE FROM preventivos WHERE codigo = ANY($1::varchar[]) RETURNING codigo', [codigos]);
          return sendJson(res, 200, { ok: true, cantidad: result.rowCount });
        }
        const grupoCodigo = String(input.grupo_codigo || '').trim();
        if (grupoCodigo) {
          const result = await db.query('DELETE FROM preventivos WHERE grupo_codigo = $1 RETURNING codigo', [grupoCodigo]);
          if (!result.rowCount) return sendJson(res, 404, { ok: false, error: 'Grupo de planes no encontrado' });
          return sendJson(res, 200, { ok: true, cantidad: result.rowCount });
        }
        const codigo = String(input.codigo || '').trim();
        if (!codigo) return sendJson(res, 422, { ok: false, error: 'Código del plan obligatorio' });
        const result = await db.query('DELETE FROM preventivos WHERE codigo = $1 RETURNING codigo', [codigo]);
        if (!result.rowCount) return sendJson(res, 404, { ok: false, error: 'Plan no encontrado' });
        return sendJson(res, 200, { ok: true });
      }
      return requireMethod(req, res, ['GET', 'POST', 'PUT', 'DELETE']);
    }

    if (action === 'tecnicos') {
      if (req.method === 'GET') {
        if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
        const { rows } = await db.query('SELECT * FROM tecnicos ORDER BY id DESC');
        return sendJson(res, 200, { ok: true, data: rows });
      }
      if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return requireMethod(req, res, ['GET', 'POST', 'PUT', 'DELETE']);
      if (!requireRole(res, user, ['administrador', 'director', 'supervisor'])) return;
      const input = await readBody(req);
      if (req.method === 'DELETE') {
        const id = Number(input.id);
        if (!Number.isSafeInteger(id) || id < 1) return sendJson(res, 422, { ok: false, error: 'Identificador de técnico no válido' });
        const { rows } = await db.query('DELETE FROM tecnicos WHERE id = $1 RETURNING id', [id]);
        if (!rows.length) return sendJson(res, 404, { ok: false, error: 'Técnico no encontrado' });
        return sendJson(res, 200, { ok: true });
      }
      const activoValue = String(input.activo ?? '').trim().toLowerCase();
      if (req.method === 'PUT') {
        const id = String(input.id || '').trim();
        if (!/^\d+$/.test(id) || !['true', 'false', '1', '0'].includes(activoValue)) {
          return sendJson(res, 422, { ok: false, error: 'Identificador y estado válido son obligatorios' });
        }
        const { rows } = await db.query(
          `UPDATE tecnicos SET activo = $1
            WHERE id = $2
            RETURNING id, nombre, cargo, correo, telefono, activo`,
          [['true', '1'].includes(activoValue) ? 1 : 0, Number(id)]
        );
        if (!rows.length) return sendJson(res, 404, { ok: false, error: 'Técnico no encontrado' });
        return sendJson(res, 200, { ok: true, data: rows[0] });
      }
      const fields = ['nombre', 'cargo', 'correo', 'telefono'];
      if (fields.some(field => !String(input[field] || '').trim())) {
        return sendJson(res, 422, { ok: false, error: 'Nombre, cargo, correo y teléfono son obligatorios' });
      }
      const nuevoEstado = String(input.activo ?? 'true').trim().toLowerCase();
      if (!['true', 'false', '1', '0'].includes(nuevoEstado)) {
        return sendJson(res, 422, { ok: false, error: 'El estado del técnico no es válido' });
      }
      const nombre = String(input.nombre).trim();
      const { rows: duplicates } = await db.query(
        'SELECT 1 FROM tecnicos WHERE LOWER(BTRIM(nombre)) = LOWER(BTRIM($1)) LIMIT 1',
        [nombre]
      );
      if (duplicates.length) return sendJson(res, 409, { ok: false, error: 'Ya existe un técnico con ese nombre' });
      const { rows } = await db.query(
        `INSERT INTO tecnicos (nombre, cargo, correo, telefono, activo)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, nombre, cargo, correo, telefono, activo`,
        [nombre, String(input.cargo).trim(), String(input.correo).trim(), String(input.telefono).trim(),
          ['true', '1'].includes(nuevoEstado) ? 1 : 0]
      );
      return sendJson(res, 201, { ok: true, data: rows[0] });
    }

    if (action === 'catalogos') {
      if (!requireMethod(req, res, ['GET'])) return;
      const [{ rows: dependencias }, { rows: tecnicos }, { rows: repuestos }] = await Promise.all([
        db.query('SELECT * FROM dependencias ORDER BY id DESC'),
        db.query('SELECT * FROM tecnicos WHERE activo = 1 ORDER BY id DESC'),
        db.query('SELECT * FROM repuestos ORDER BY id DESC')
      ]);
      return sendJson(res, 200, { ok: true, data: { dependencias, tecnicos, repuestos } });
    }

    return notFound(res);
  } catch (error) {
    console.error('API error:', error);
    return sendJson(res, 500, { ok: false, error: 'Error en la API' });
  }
}
