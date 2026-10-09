# MantTI Arjona - Producción

Frontend estático y API serverless Node preparados para Vercel. La API usa PostgreSQL mediante `pg`, conserva las rutas que consume `app.js` y mantiene la sesión firmada en cookie `HttpOnly`.

## Requisitos

- Una instancia PostgreSQL accesible desde Internet con la base migrada.
- Importar `../proyecto_db/mantti_arjona_postgres.sql` en una base PostgreSQL vacía.
- Configurar en Vercel `DATABASE_URL` y `AUTH_SECRET`. `DB_SSL_CA` solo se usa si el proveedor requiere una CA personalizada.
- `AUTH_SECRET` debe ser una cadena aleatoria de al menos 32 bytes; no reutilices contraseñas de la base.

## Despliegue

1. Importar esta carpeta como proyecto en Vercel.
2. Configurar las variables para Production, Preview y Development según corresponda.
3. Confirmar que el proveedor PostgreSQL permite conexiones desde Vercel y que la URL exige TLS si aplica.
4. Desplegar y probar inicio/cierre de sesión, lecturas y operaciones de escritura.

Vercel no ejecuta PHP ni aloja la base de datos; se necesita PostgreSQL remoto. `DATABASE_URL` debe copiarse del proveedor y cargarse como secreto en Vercel, nunca publicarse. Para una CA personalizada, configurar `DB_SSL_CA` con el certificado PEM.

La autenticación usa una cookie firmada con vencimiento de 30 minutos, protección CSRF y validación del usuario activo y su rol. La copia de seguridad excluye los hashes de contraseñas.

La carga y descarga de documentos no está activada: las funciones serverless no ofrecen almacenamiento persistente. Se debe integrar almacenamiento de objetos antes de habilitarla. `admin.php` (importación directa de base de datos) tampoco forma parte del despliegue web.
