# Seguridad

Resumen de lo que protege la app, lo que **tú** debes configurar y los riesgos que quedan.

## Ya aplicado en el código

| Área             | Medida                                                                                                                                                                                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cabeceras HTTP   | CSP (solo scripts, estilos, imágenes y conexiones de este sitio y Supabase), HSTS, `X-Frame-Options: DENY` + `frame-ancestors 'none'` (anti-clickjacking), `nosniff`, `Referrer-Policy`, `Permissions-Policy` (sin cámara, micrófono ni ubicación), COOP. Sin `X-Powered-By`.                   |
| Datos personales | El teléfono y el Facebook del vendedor nunca van en el HTML público: se revelan por `/api/contacto/[id]` solo con sesión, con límite de 60 contactos/día por persona. La vista pública `public_profiles` no incluye contacto.                                                                   |
| Base de datos    | RLS activo en todas las tablas; triggers (`listings_guard`, `profiles_guard`) protegen campos sensibles (rol, bloqueo, verificación, estado, caducidad, contadores) **incluso con llamadas directas a la API**. Límites de 5 anuncios activos, 10 publicaciones/día y 12 fotos a nivel de base. |
| Fotos            | Bucket con tope de 1 MB y solo WebP/JPEG/PNG; solo se escribe en la carpeta propia (`{user_id}/…`); el servidor rechaza rutas ajenas o con `..`. Se quita el EXIF (ubicación) antes de subir.                                                                                                   |
| Redirecciones    | `safeNext` solo admite rutas internas (bloquea `//host`, `/\host`, saltos de línea).                                                                                                                                                                                                            |
| Entradas         | Zod en servidor para anuncios, perfil y reportes; IDs validados como UUID en las APIs; consultas parametrizadas (sin SQL armado a mano).                                                                                                                                                        |
| XSS              | React escapa todo; los JSON-LD escapan `<`; no hay HTML de usuarios renderizado.                                                                                                                                                                                                                |
| Abuso            | Límites de contacto, reportes (1 por persona y anuncio, 3 pausan el anuncio) y conteo de visitas con cookie. Detección de anuncios sospechosos.                                                                                                                                                 |
| Secretos         | `SUPABASE_SERVICE_ROLE_KEY` solo en servidor (`server-only`); no se versiona ningún `.env`. `/api/salud` no muestra mensajes internos.                                                                                                                                                          |
| Dependencias     | `npm audit --omit=dev`: 0 vulnerabilidades al momento de esta revisión.                                                                                                                                                                                                                         |

## Lo que debes hacer tú (panel de Supabase / Vercel)

1. **Quita la cuenta demo antes de abrir al público:** borra `NEXT_PUBLIC_DEMO_PASSWORD` en Vercel y no cargues `supabase/demo.sql` en producción (o borra el usuario `demo@trato.mx`).
2. **Antibots en el acceso:** en Supabase → Authentication → _Attack Protection_, activa CAPTCHA (Cloudflare Turnstile o hCaptcha). Sin eso, alguien puede disparar miles de SMS (“SMS pumping”) y generar una factura.
3. **Límites de Auth:** Authentication → _Rate Limits_: baja los envíos de SMS y correos por hora al mínimo razonable.
4. **Correos y contraseñas:** si algún día activas contraseñas, activa _Leaked password protection_ y exige 10+ caracteres.
5. **Tu cuenta de administrador:** activa la verificación en dos pasos en Supabase, GitHub y Vercel. El rol `admin` de la app se asigna solo por SQL: no lo des a nadie más.
6. **Rota la clave secreta** (`service_role` / `sb_secret_…`) si alguna vez se pega en un chat, captura o repositorio.
7. **Copias de seguridad:** el plan gratuito no incluye backups diarios descargables; exporta tu base de forma periódica o pasa a un plan de pago cuando haya datos reales.
8. **Redirect URLs:** en Authentication → URL Configuration deja solo tu dominio (y `localhost` mientras desarrollas).

## Riesgos conocidos (aceptados por ahora)

- La CSP permite `'unsafe-inline'` en scripts porque Next.js lo necesita para arrancar; pasar a nonces es posible más adelante y endurecería la política.
- Los contadores de visitas son aproximados (se pueden alterar borrando cookies).
- Cualquier persona con sesión puede ver el contacto de hasta 60 anuncios por día: es un compromiso entre comodidad y protección contra raspado.
- La búsqueda y la vista previa de filtros son públicas; el límite de tráfico depende de Vercel/Supabase (considera activar el firewall de Vercel si ves abuso).

## Reportar un problema

Escribe a la dirección de contacto de la web con el asunto “Seguridad”.
