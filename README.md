# Trato

Compra y vende autos y motos usados en México, sin estafas. Web app mobile-first (PWA) hecha con **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase**.

- Interfaz en español de México (`es-MX`), pesos MXN, kilómetros, zona horaria `America/Mexico_City`.
- Sin pagos ni mensajería interna: comprador y vendedor se contactan por WhatsApp o llamada.
- El nombre, eslogan y colores viven en un solo archivo: [`src/config/brand.ts`](src/config/brand.ts). Los límites de negocio (5 anuncios, 60 días, 12 fotos…) en [`src/config/site.ts`](src/config/site.ts).

## Requisitos

- Node.js 20+ (probado con 22) y npm
- Un proyecto de [Supabase](https://supabase.com) (plan gratuito sirve para empezar)
- Opcional: [Supabase CLI](https://supabase.com/docs/guides/cli) para desarrollo local

## Instalación local

```bash
npm install
cp .env.example .env.local   # completa las variables
npm run dev                  # http://localhost:3000
```

La app **arranca sin Supabase configurado** (páginas públicas vacías), útil para ver el diseño.

### Variables de entorno

| Variable                        | Dónde se usa             | Notas                                                                                                                 |
| ------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | cliente y servidor       | Project Settings → API                                                                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor       | clave `anon` (pública)                                                                                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | **solo servidor**        | Revela teléfonos a usuarios con sesión, marca anuncios sospechosos y corre el seed. Nunca con prefijo `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL`          | SEO, sitemap, Open Graph | `https://tu-dominio.mx` en producción                                                                                 |
| `E2E_EMAIL`, `E2E_PASSWORD`     | pruebas E2E              | opcional                                                                                                              |

## Base de datos (Supabase)

Las migraciones están en [`supabase/migrations`](supabase/migrations) y el seed (32 estados + catálogo de marcas y modelos) en [`supabase/seed.sql`](supabase/seed.sql).

**Opción A — Supabase CLI (recomendada):**

```bash
supabase link --project-ref <tu-ref>
supabase db push                       # aplica las migraciones
psql "$DATABASE_URL" -f supabase/seed.sql   # o pega seed.sql en el SQL editor
```

Local con Docker: `supabase start && supabase db reset` (aplica migraciones y seed).

**Opción B — Dashboard:** abre el SQL Editor y ejecuta, en orden, cada archivo de `supabase/migrations` y luego `supabase/seed.sql`.

El catálogo (≈80 marcas y ≈1,000 modelos de autos y motos del mercado mexicano) y los 32 estados viven en `src/lib/catalog.ts` y `src/lib/constants.ts`; `npm run catalog:seed` regenera `supabase/seed.sql` desde ahí. La app lee el catálogo directo del código (no depende de la base) y el formulario siempre permite escribir una marca o modelo que no esté en la lista. Las migraciones, el seed y `demo.sql` se probaron sobre PostgreSQL 16 (con `auth` y `storage` simulados).

Los logos de marca (monocromos, `public/logos/*.svg`) salen de [Simple Icons](https://simpleicons.org) (datos CC0; las marcas son de sus dueños y se usan solo para identificarlas). Cubren ~40 marcas; el resto muestra un monograma. Se regeneran con `npm run catalog:logos`.

Las siluetas de los 32 estados (`public/estados/*.svg`) se generan desde GeoJSON abierto ([angelnmara/geojson](https://github.com/angelnmara/geojson)), simplificado, con `npm run catalog:states`.

Los iconos de la interfaz son de [Hugeicons](https://hugeicons.com) (versión gratuita, trazo redondeado), envueltos en `src/components/ui/icons.tsx`.

Qué incluyen las migraciones: enums, `profiles` (trigger al registrarse), `listings` (columnas nullable + `CHECK` por tipo, búsqueda de texto completo en español), fotos, favoritos, reportes (3 reportes ⇒ pausa automática), límites y rate limiting en SQL, mediana de precios, **RLS en todas las tablas**, bucket de fotos y expiración diaria con `pg_cron`.

### Autenticación

Dashboard → Authentication:

1. **URL Configuration**: `Site URL` = tu dominio; añade `https://tu-dominio.mx/auth/callback` (y `http://localhost:3000/auth/callback`) a _Redirect URLs_.
2. **Email**: habilitado por defecto (magic link). Para producción configura un SMTP propio (p. ej. Resend, plan gratuito) porque el envío por defecto de Supabase tiene límites muy bajos.
3. **Phone**: habilita _Phone_ y conecta un proveedor SMS (**Twilio**, MessageBird, Vonage o Textlocal). Es **el único costo obligatorio**: del orden de 0.05–0.10 USD por SMS a México (confirma tarifas vigentes con tu proveedor). Mientras no tengas proveedor, en local usa `[auth.sms.test_otp]` de `supabase/config.toml`, o prueba solo con correo.

El distintivo **“Teléfono verificado”** lo otorga únicamente el OTP por SMS (trigger sobre `auth.users`). Quienes entran por correo guardan su WhatsApp en _Mi perfil_ y aparecen sin verificar.

### Crear un administrador

Regístrate normalmente y luego, en el SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<tu-user-id>';
```

El panel está en `/admin` (resumen, reportes, anuncios en revisión, usuarios).

### Datos de demo

**Sin claves (recomendado):** pega `supabase/demo.sql` en Supabase → SQL Editor → Run. Crea el usuario `demo@trato.mx` y 30 autos + 15 motos con fotos de relleno, para ver todas las páginas. Se regenera con `npm run demo:sql`.

**Con API:**

```bash
npm run seed:demo   # 30 autos + 15 motos para el usuario demo@trato.mx
```

Las fotos son imágenes de relleno de `picsum.photos`; no corresponden a los vehículos. Vuelve a ejecutarlo para reiniciar los anuncios demo.

## Scripts

| Comando                           | Qué hace                                                       |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run dev` / `build` / `start` | desarrollo / compilación / producción                          |
| `npm run lint`                    | ESLint                                                         |
| `npm run format`                  | Prettier                                                       |
| `npm run typecheck`               | `tsc --noEmit`                                                 |
| `npm test`                        | Vitest (validación, reglas anti-estafa, filtros/URLs, formato) |
| `npm run test:e2e`                | Playwright: publicar y buscar→contactar (ver abajo)            |

### Pruebas E2E

1. `npm run seed:demo` y configura `.env.local`.
2. Crea en Supabase un usuario con correo + contraseña (dashboard → Authentication → Add user, _auto confirm_), y guárdale un WhatsApp en `profiles.phone`.
3. `E2E_EMAIL=... E2E_PASSWORD=... npx playwright test` (la primera vez, `npx playwright install chromium`).

Sin variables, las pruebas que las necesitan se omiten.

## Despliegue (Vercel + Supabase)

1. Sube el repositorio a GitHub e impórtalo en [Vercel](https://vercel.com/new).
2. Define las variables de entorno de la tabla anterior (`SUPABASE_SERVICE_ROLE_KEY` sin exponer al cliente).
3. Deploy. Después añade el dominio y actualiza `NEXT_PUBLIC_SITE_URL` y las _Redirect URLs_ de Supabase.
4. Comprueba `/sitemap.xml`, `/robots.txt` y `/manifest.webmanifest`.

> Vercel Hobby es solo para uso no comercial; si monetizas, pasa a Pro.

## Estructura

```
src/
  app/            rutas (App Router): /, /autos, /motos, /anuncio/[slug], /publicar, /mis-anuncios,
                  /favoritos, /vendedor/[id], /cuenta, /admin, páginas estáticas, sitemap, manifest, API
  actions/        Server Actions (listings, favorites, reports, account, admin) — validan con Zod
  components/     ui/, layout/, listings/, publish/ (formulario en 7 pasos), trust/, admin/, account/
  lib/            supabase/, validation/ (Zod), listings/ (consultas, filtros↔URL, slug), trust/ (reglas anti-estafa),
                  images/ (compresión WebP en el navegador), seo/
  config/         brand.ts, site.ts
  i18n/           mensajes es-MX
supabase/         migraciones y seed
scripts/          seed-demo.ts
tests/            unit/ y e2e/
```

## Seguridad y confianza (resumen)

- **RLS**: lectura pública solo de anuncios `active` y vigentes; cada usuario solo escribe lo suyo; los admins moderan todo. Triggers de base de datos aplican los límites (5 activos, 10 publicaciones/día, 12 fotos) incluso si alguien llama a la API directamente.
- **Teléfono**: nunca va en el HTML público. `GET /api/contacto/[id]` exige sesión, tiene rate limit y responde `no-store`.
- **Fotos**: se redimensionan (máx. 1600 px) y se recodifican a WebP en el navegador, lo que elimina el EXIF/GPS. El bucket solo acepta escritura en la carpeta propia.
- **Señales sospechosas** (`src/lib/trust/suspicious.ts`): precio >40 % bajo la mediana de similares, anticipos/apartados, teléfonos y enlaces en la descripción ⇒ el anuncio se publica con `needs_review` y el vendedor ve el aviso.
- **Reportes**: 3 reportes distintos pausan el anuncio automáticamente.

## Decisiones y desviaciones respecto al plan

- Los componentes de UI son propios y ligeros (inspirados en shadcn/ui) en lugar de generados con su CLI, para no depender de Radix; cuando quieras, puedes añadir shadcn encima.
- `listings.state` guarda el **slug** del estado (FK a `mx_states.slug`) en vez de un `state_id` numérico: simplifica URLs y filtros.
- El proxy de sesión es `src/proxy.ts` (nombre de `middleware` en Next 16).
- Anuncios no disponibles (vendidos, vencidos, retirados) muestran “Este anuncio ya no está disponible” con anuncios recientes. Por el streaming de Next la respuesta HTTP es 200 con `noindex`; están excluidos del sitemap.
- La marcación de `needs_review` se hace en servidor con la service role; un usuario que escriba directo a la API de Supabase se salta esa detección (pero no los límites ni las RLS). Para endurecerlo, mueve la creación a una función RPC.
- Pendiente a propósito (fuera del MVP): renovación por correo, pagos, mensajería, verificación INE.

## Checklist de lanzamiento

- [ ] Reemplazar nombre, logo (`logoMark`) y correo en `src/config/brand.ts`
- [ ] Completar **Términos** y **Aviso de privacidad** (son gabaritos: revisión legal) y los datos del responsable
- [ ] Proveedor SMS configurado y probado con un número real; SMTP propio para correos
- [ ] Migraciones y seed aplicados en producción; al menos un usuario `admin`
- [ ] Variables de entorno en Vercel; `NEXT_PUBLIC_SITE_URL` = dominio final
- [ ] _Redirect URLs_ de Supabase actualizadas
- [ ] Verificar en producción: registro por SMS, publicar con fotos, contactar por WhatsApp, reportar, panel `/admin`
- [ ] Verificar que el teléfono del vendedor no aparece en el HTML (`curl` de una ficha)
- [ ] Lighthouse móvil ≥ 90 en rendimiento y accesibilidad (home, resultados, ficha)
- [ ] Revisar límites del plan Supabase (1 GB de Storage ≈ 300 anuncios con 12 fotos) y plan de actualización
- [ ] Dar de alta el sitio en Google Search Console y enviar `sitemap.xml`
