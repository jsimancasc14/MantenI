# MantTI Arjona

Frontend estático y API Node preparados para Vercel y ejecución local. La API usa PostgreSQL mediante `pg`, conserva las rutas que consume `app.js` y mantiene la sesión firmada en cookie `HttpOnly`.

## Ejecutar en este equipo

Necesitas Node.js LTS (incluye `npm`) y PostgreSQL instalados y en ejecución.

1. Comprueba en pgAdmin que la base de datos existe y que importaste `mantti_arjona_postgres.sql` en ella. El nombre de la base de datos del ejemplo es `mantti_arjona`; si usaste otro, indícalo en la URL.
2. Copia `.env.example` a `.env.local` y edita este último. Configura `DATABASE_URL` con el usuario, la contraseña, el puerto y el nombre de tu base local. Por ejemplo: `postgresql://postgres:TU_CLAVE@localhost:5432/mantti_arjona`. Si la contraseña contiene caracteres especiales, codifícala para URL.
3. Genera un secreto de sesión local con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` y pega el resultado como valor de `AUTH_SECRET` en `.env.local`.
4. En una terminal, desde esta carpeta, ejecuta `npm run dev`.
5. Abre `http://localhost:3000` para ver la página pública de presentación. Entra a `http://localhost:3000/sistema.html` para iniciar sesión con un usuario activo existente en la tabla `usuarios`.

`.env.local` contiene credenciales y no se debe compartir ni subir al repositorio. El servidor local incluido inicia tanto la web como la API; abrir las páginas HTML directamente o servirlas solo desde Apache/XAMPP no ejecuta las rutas de PostgreSQL.

La pantalla carga inventario, órdenes, mantenimientos preventivos y catálogos desde PostgreSQL. Si la conexión o las consultas fallan, no se muestran los registros de demostración como si fueran datos reales.
Los técnicos nuevos y su estado activo se guardan en PostgreSQL desde el catálogo; el navegador no habilita por sí solo a una persona para asignarla a una orden.

`/` es la página pública de presentación; no muestra registros institucionales. `/sistema.html` contiene la aplicación autenticada y carga datos actuales de PostgreSQL tras validar la sesión. El límite de intentos de inicio de sesión actual vive en memoria de cada instancia; para despliegues con múltiples instancias debe reemplazarse por un limitador compartido (por ejemplo, Redis o una tabla PostgreSQL) antes de usarlo como control de seguridad distribuido.

## Requisitos para desplegar

- Una instancia PostgreSQL accesible desde Internet con la base migrada.
- Configurar en Vercel `DATABASE_URL` y `AUTH_SECRET`. `DB_SSL_CA` solo se usa si el proveedor requiere una CA personalizada.
- Para activar el asistente de IA, configurar `OPENAI_API_KEY` como variable secreta en Vercel. Opcionalmente, `OPENAI_MODEL` permite seleccionar otro modelo compatible con la API de Responses. La clave solo se usa en el servidor. El asistente envía a OpenAI los conteos agregados de inventario, impresoras, órdenes abiertas y preventivos, junto con la pregunta del usuario; no envía detalles de activos ni datos personales. El uso de la API de OpenAI puede generar cargos en la cuenta asociada.
- `AUTH_SECRET` debe ser una cadena aleatoria de al menos 32 bytes; no reutilices contraseñas de la base.

Vercel no ejecuta PHP ni aloja la base de datos; se necesita PostgreSQL remoto. `DATABASE_URL` debe copiarse del proveedor y cargarse como secreto en Vercel, nunca publicarse. Para una CA personalizada, configurar `DB_SSL_CA` con el certificado PEM.

La autenticación usa una cookie firmada con vencimiento de 8 horas, protección CSRF y validación del usuario activo y su rol. Si la sesión vence, la aplicación vuelve al inicio de sesión antes de reintentar una operación. La copia de seguridad excluye los hashes de contraseñas.

## Actualizar la base de datos

`mantti_arjona_postgres.sql` es el archivo único del esquema inicial y sus cambios. Al crear una base nueva, importa el archivo completo. Para una base existente, ejecuta solamente el bloque final `Cambios idempotentes para actualizar una base existente`; agrega el campo de firma y asegura que Juan Diaz Pardo y Jairo Simancas Cogollo estén registrados sin eliminar los demás técnicos.

La carga y descarga de documentos no está activada: las funciones serverless no ofrecen almacenamiento persistente. Se debe integrar almacenamiento de objetos antes de habilitarla. `admin.php` (importación directa de base de datos) tampoco forma parte del despliegue web.
