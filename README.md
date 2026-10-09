# MantTI Arjona - Producción

Frontend estático y API serverless Node preparados para Vercel. Las funciones conservan las rutas que consume `app.js` y usan una sesión firmada en cookie `HttpOnly`.

## Requisitos

- Una instancia MySQL accesible desde Internet con la base `mantti_arjona` importada.
- Configurar en Vercel las variables requeridas de `.env.example`: `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` y `AUTH_SECRET`. `DB_PORT` y `DB_SSL_CA` son opcionales.
- `AUTH_SECRET` debe ser una cadena aleatoria de al menos 32 bytes; no reutilices contraseñas de la base.

## Despliegue

1. Importar esta carpeta como proyecto en Vercel.
2. Configurar las variables para Production, Preview y Development según corresponda.
3. Confirmar que el proveedor MySQL permite conexiones desde Vercel y exige TLS si aplica.
4. Desplegar y probar inicio/cierre de sesión, lecturas y operaciones de escritura.

Vercel no ejecuta PHP. `127.0.0.1` apuntaría al contenedor de Vercel, no al equipo local; se necesita MySQL remoto. No se incluyen las credenciales locales del proyecto. Para conexiones TLS que requieran una CA personalizada, configurar `DB_SSL_CA` con el certificado PEM.

La autenticación usa una cookie firmada con vencimiento de 30 minutos, protección CSRF y validación del usuario activo y su rol. La copia de seguridad excluye los hashes de contraseñas.

La carga y descarga de documentos no está activada: las funciones serverless no ofrecen almacenamiento persistente. Se debe integrar almacenamiento de objetos antes de habilitarla. `admin.php` (importación directa de base de datos) tampoco forma parte del despliegue web.
