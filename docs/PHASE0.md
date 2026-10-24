# Trato — Phase 0 : cadrage

Statut : **proposition, en attente de validation**. Aucun code applicatif n'a été écrit.

---

## 1. Arborescence du projet

```
trato/
├─ .env.example
├─ README.md
├─ package.json / tsconfig.json (strict) / next.config.ts / tailwind.config.ts
├─ eslint.config.mjs / .prettierrc / playwright.config.ts / vitest.config.ts
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/                      # icônes PWA
│  └─ offline.html
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/                 # voir §4
│  └─ seed/                       # états, catalogue, démo (phase 6)
├─ src/
│  ├─ config/
│  │  ├─ brand.ts                 # nom, slogan, logo, couleurs, contact (point unique)
│  │  └─ site.ts                  # limites métier (5 annonces, 60 jours, seuils…)
│  ├─ i18n/
│  │  ├─ index.ts                 # t() minimal, locale es-MX
│  │  └─ messages/es-MX.json
│  ├─ app/
│  │  ├─ layout.tsx, page.tsx (accueil), globals.css
│  │  ├─ (auth)/acceder/          # connexion / inscription
│  │  ├─ auth/callback/route.ts   # magic link
│  │  ├─ autos/[[...filtros]]/    # listes SEO : /autos/nuevo-leon/monterrey, /autos/nissan/versa
│  │  ├─ motos/[[...filtros]]/
│  │  ├─ anuncio/[slug]/          # fiche (slug se terminant par l'id)
│  │  ├─ vendedor/[id]/           # profil public
│  │  ├─ publicar/                # formulaire en étapes
│  │  ├─ mis-anuncios/
│  │  ├─ favoritos/
│  │  ├─ admin/                   # reportes, anuncios, usuarios, estadísticas
│  │  ├─ consejos/ como-vender/ terminos/ privacidad/ contacto/
│  │  ├─ api/
│  │  │  ├─ contacto/[id]/route.ts   # renvoie le tél. aux connectés seulement
│  │  │  └─ views/[id]/route.ts      # incrément des vues
│  │  ├─ sitemap.ts, robots.ts, manifest (si dynamique)
│  │  └─ not-found.tsx, error.tsx, offline/
│  ├─ components/
│  │  ├─ ui/                      # shadcn/ui
│  │  ├─ layout/                  # Header, BottomNav, Footer
│  │  ├─ listings/                # ListingCard, Gallery, FilterPanel, SpecGrid, PriceHint…
│  │  ├─ publish/                 # Stepper, PhotoUploader (dnd), steps 1-7
│  │  ├─ trust/                   # ScamTips, VerifiedBadge, ReportDialog
│  │  └─ admin/
│  ├─ lib/
│  │  ├─ supabase/                # client.ts, server.ts, middleware.ts, admin.ts (service role, serveur only)
│  │  ├─ validation/              # schémas Zod (listing, profile, report, filters)
│  │  ├─ listings/                # queries.ts, filters-url.ts, slug.ts, title.ts, median.ts
│  │  ├─ trust/                   # suspicious.ts (règles anti-arnaque), rate-limit.ts
│  │  ├─ images/                  # compress.ts (canvas → WebP, strip EXIF)
│  │  ├─ seo/                     # metadata.ts, jsonld.ts
│  │  └─ format.ts                # MXN, km, dates (America/Mexico_City)
│  ├─ actions/                    # Server Actions : listings, favorites, reports, admin, profile
│  ├─ types/database.ts           # types générés (supabase gen types)
│  └─ middleware.ts               # refresh session, protection /publicar, /admin
├─ tests/
│  ├─ unit/                       # validation, suspicious, median, filters-url
│  └─ e2e/                        # publier ; chercher → contacter
└─ docs/PHASE0.md
```

Choix de simplicité : pas de couche API séparée ; lectures dans des Server Components, écritures dans des Server Actions (Zod côté serveur), deux Route Handlers seulement.

---

## 2. Schéma de base de données

### Décision : annonces en **une seule table, colonnes nullable**

Auto et moto partagent ~90 % des champs ; seuls 5 champs diffèrent. Une table d'attributs (EAV) compliquerait les filtres, les index et les types pour un gain nul. On garantit la cohérence par des `CHECK` (ex. `vehicle_type = 'auto'` ⇒ `body_type` non nul et `moto_type`/`engine_cc` nuls). Si un 3ᵉ type de véhicule arrive un jour, on ajoutera des colonnes.

### Types enum (Postgres `enum`)

`vehicle_type`, `listing_status` (`active|paused|sold|expired|removed`), `transmission_type`, `fuel_type`, `invoice_type`, `body_type`, `traction_type`, `moto_type`, `report_reason`, `report_status`, `user_role`.
Valeurs conservées telles que dans ton cahier des charges (`automatica`, `hibrido`, `sin_factura`…).

### Tables

**`mx_states`** — `id smallint pk`, `code`, `name`, `slug unique` (32 lignes).

**`profiles`** — `id uuid pk → auth.users`, `display_name`, `phone` (E.164, **jamais exposé publiquement**), `phone_verified bool`, `state_id → mx_states`, `city`, `avatar_url`, `role user_role default 'user'`, `is_blocked bool default false`, `is_pro bool default false` (limite 5 annonces levée, sans UI en MVP), `created_at`.
Créé automatiquement par un trigger sur `auth.users`.
Vue publique **`public_profiles`** : id, display_name, city, state, avatar_url, phone_verified, created_at, `active_listings_count` — sans téléphone.

**`catalog_brands`** — `id`, `vehicle_type`, `name`, `slug`; unique (`vehicle_type`, `slug`).
**`catalog_models`** — `id`, `brand_id → catalog_brands`, `name`, `slug`; unique (`brand_id`, `slug`).
(« Otro » = `brand_id`/`model_id` nuls + texte libre dans `brand`/`model` de l'annonce.)

**`listings`**

| Groupe       | Colonnes                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identité     | `id uuid pk`, `user_id → profiles`, `vehicle_type`, `status default 'active'`, `slug` (généré), `title` (généré côté serveur : marque + modèle + année + version)                                                   |
| Véhicule     | `brand`, `model`, `version`, `brand_id?`, `model_id?`, `year` (1980..année+1), `color`, `transmission`, `fuel`, `mileage_km >= 0`, `owners_count`, `invoice_type`, `plates_state_id?`, `tenencia_al_corriente bool` |
| Auto         | `body_type?`, `doors?`, `engine_liters?`, `traction?`                                                                                                                                                               |
| Moto         | `moto_type?`, `engine_cc?`                                                                                                                                                                                          |
| Prix / lieu  | `price_mxn int > 0`, `negotiable`, `state_id → mx_states`, `city`                                                                                                                                                   |
| Contenu      | `description` (≤ 2000 car.)                                                                                                                                                                                         |
| Modération   | `needs_review bool default false`, `review_reasons text[]`, `reports_count int default 0`, `removed_reason?`                                                                                                        |
| Cycle de vie | `created_at`, `updated_at`, `expires_at` (+60 j), `sold_at?`, `views_count int default 0`                                                                                                                           |
| Recherche    | `search tsvector` colonne générée : `to_tsvector('spanish', unaccent(title                                                                                                                                          |     | ' ' |     | description))` |

Ajouts par rapport au cahier des charges : `slug`, `needs_review` + `review_reasons` (exigés par §7), `reports_count` (règle des 3 signalements), `is_blocked` / `is_pro` sur `profiles`, `sold_at`.

**`listing_photos`** — `id`, `listing_id → listings on delete cascade`, `storage_path`, `position smallint`, `created_at`; unique (`listing_id`, `position`). Position 0 = couverture. Limite 12 photos via trigger ; minimum 1 vérifié à la publication.

**`favorites`** — pk (`user_id`, `listing_id`), `created_at`.

**`reports`** — `id`, `listing_id`, `reporter_id`, `reason`, `comment`, `status default 'nuevo'`, `created_at`; unique (`listing_id`, `reporter_id`) pour empêcher le spam d'un même utilisateur. Trigger : incrémente `reports_count` ; à 3 signalements distincts → `listings.status = 'paused'` + `needs_review = true`.

**`rate_events`** — `id`, `user_id`, `action` (`create_listing|report`), `created_at`. Sert au rate limiting **en SQL** (pas de Redis/Upstash, donc 0 € supplémentaire). Purge périodique.

### Index

- `listings (vehicle_type, status, state_id)`, `(brand, model)`, `(price_mxn)`, `(year)`, `(created_at desc)`, `(user_id, status)`, `(expires_at) where status='active'`
- GIN sur `search`
- `listing_photos (listing_id, position)`, `reports (status, created_at)`, `favorites (listing_id)`

### Fonctions SQL

- `median_price(vehicle_type, brand, model, year ± 2)` → médiane des annonces actives similaires, `null` si < 5 (aide au prix + signal « prix > 40 % sous la médiane »).
- `is_admin()` (`security definer`) utilisée par les politiques RLS.
- `can_create_listing(uid)` : ≤ 5 actives (sauf `is_pro`) et ≤ 10 créations/24 h.

### RLS (résumé des politiques)

| Table                    | Lecture                                                                                                      | Écriture                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `listings`               | publique si `status='active'` **et** `expires_at > now()` ; propriétaire : toutes les siennes ; admin : tout | propriétaire : insert/update/delete des siennes (hors `needs_review`, `reports_count`, statut `removed`, protégés par trigger/colonnes) ; admin : tout |
| `listing_photos`         | via annonce visible                                                                                          | propriétaire de l'annonce ; admin                                                                                                                      |
| `profiles`               | propriétaire (son propre profil complet) ; admin ; **le public passe par `public_profiles`**                 | propriétaire sur ses champs (pas `role`, `is_blocked`, `phone_verified`) ; admin                                                                       |
| `favorites`              | propriétaire                                                                                                 | propriétaire                                                                                                                                           |
| `reports`                | admin ; reporter voit les siens                                                                              | utilisateur connecté non bloqué ; update statut : admin                                                                                                |
| `catalog_*`, `mx_states` | publique                                                                                                     | admin seulement                                                                                                                                        |
| `rate_events`            | aucune                                                                                                       | via fonctions `security definer` uniquement                                                                                                            |

Un utilisateur `is_blocked` ne peut ni publier ni signaler (vérifié dans les politiques d'insertion) ; ses annonces actives passent en `removed`.

### Expiration

Pas de cron obligatoire : la RLS et les requêtes filtrent `expires_at > now()`. Un job `pg_cron` quotidien (inclus dans Supabase gratuit) passe en plus les annonces échues à `expired` pour la propreté.

### Stockage photos

Bucket `listing-photos` (public en lecture, chemin `{user_id}/{listing_id}/{uuid}.webp`). Politique Storage : écriture/suppression seulement dans son propre dossier `{user_id}/`, types `image/webp|jpeg|png`, max 1 Mo. Compression + suppression EXIF faites côté client (re-encodage canvas → WebP = métadonnées éliminées).

### Numéro de téléphone

Jamais dans le HTML des pages publiques. `GET /api/contacto/[id]` exige une session, renvoie le lien `wa.me` + le numéro, avec `Cache-Control: no-store`, rate-limité. Les boutons WhatsApp/Llamar de la fiche appellent cette route au clic.

---

## 3. Dépendances

**Runtime** : `next`, `react`, `react-dom`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `next-themes` (mode sombre), `browser-image-compression` (ou canvas natif — je pars sur **canvas natif**, 0 dépendance), `@dnd-kit/core` + `@dnd-kit/sortable` (réordonner les photos), `embla-carousel-react` (galerie swipeable), `libphonenumber-js` (validation numéros MX), `sonner` (toasts).
Composants shadcn/ui : button, input, select, dialog, sheet, tabs, checkbox, badge, skeleton, form, dropdown-menu, slider, toast.

**Dev** : `typescript`, `eslint` + `eslint-config-next`, `prettier` + `prettier-plugin-tailwindcss`, `vitest`, `@playwright/test`, `supabase` (CLI), `tsx` (scripts de seed).

Aucune dépendance payante.

---

## 4. Plan des migrations (`supabase/migrations/`)

| #    | Fichier                                     | Contenu                                                                                                         |
| ---- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | `0001_extensions_enums.sql`                 | `unaccent`, `pg_trgm`, enums                                                                                    |
| 2    | `0002_geo_catalog.sql`                      | `mx_states`, `catalog_brands`, `catalog_models`                                                                 |
| 3    | `0003_profiles.sql`                         | `profiles`, trigger création depuis `auth.users`, `public_profiles`, `is_admin()`                               |
| 4    | `0004_listings.sql`                         | `listings` + CHECK + index + tsvector                                                                           |
| 5    | `0005_photos_favorites_reports.sql`         | tables + triggers (limite 12 photos, `reports_count`, auto-pause à 3)                                           |
| 6    | `0006_rate_limit_functions.sql`             | `rate_events`, `can_create_listing`, `median_price`                                                             |
| 7    | `0007_rls.sql`                              | toutes les politiques                                                                                           |
| 8    | `0008_storage.sql`                          | bucket + politiques Storage                                                                                     |
| 9    | `0009_cron_expiry.sql`                      | job `pg_cron` d'expiration                                                                                      |
| seed | `seed/01_states.sql`, `seed/02_catalog.sql` | 32 États ; ~20 marques autos + ~15 marques motos avec modèles principaux. Démo (30 autos + 15 motos) en phase 6 |

---

## 5. Authentification et coût du SMS

- **E-mail magic link** : inclus dans Supabase (gratuit ; l'envoi par défaut est limité en volume → prévoir un SMTP gratuit type Resend au lancement).
- **Téléphone OTP** : Supabase n'envoie pas les SMS lui-même ; il faut brancher **Twilio (Verify ou Messaging), MessageBird, Vonage ou Textlocal**. C'est le **seul coût incompressible**. Ordre de grandeur Twilio pour le Mexique : environ **0,05 à 0,10 USD par SMS**, soit ~**5–10 USD pour 100 inscriptions** (tarifs à vérifier avant lancement, ils changent). Le « badge téléphone vérifié » est donc payé à l'inscription.
- Atténuation : l'e-mail reste gratuit ; on peut limiter l'OTP téléphone à la **publication** (pas à la navigation) pour réduire le volume ; le compte e-mail + vérification téléphone ultérieure est possible.
- Phase 1 : je configurerai en local avec le **mode test de Supabase** (numéros/OTP fictifs) — aucun SMS réel avant que tu choisisses un fournisseur.

---

## 6. Hébergement et coûts (hors SMS)

Vercel Hobby (gratuit ; usage commercial formellement réservé au plan Pro — à surveiller si le projet est monétisé) + Supabase Free (500 Mo DB, 1 Go Storage, projet mis en pause après 7 j d'inactivité). Avec ~300 Ko/photo × 12, le Go de stockage gratuit tient ≈ 300 annonces pleines : prévoir le plan Pro Supabase (~25 USD/mois) dès que le trafic décolle.

---

## 7. Décisions que j'ai prises (à confirmer) et points ouverts

1. **Colonnes nullable + CHECK** (pas d'EAV).
2. **Rate limiting en SQL** (`rate_events`) plutôt qu'Upstash.
3. **Server Actions** pour les écritures ; 2 Route Handlers seulement.
4. **Slug d'annonce** : `nissan-versa-2019-advance-monterrey-{uuid court}` ; l'id fait foi, le slug est redirigé s'il est périmé.
5. **Routes SEO** `/autos/[[...filtros]]` : le 1ᵉʳ segment est interprété comme État, marque ou carrosserie selon une table de correspondance (slug unique par catégorie) ; le reste des filtres en query string avec `canonical` propre.
6. **Compression d'images en canvas natif** (aucune lib).
7. **Marque « Otro »** : texte libre, sans lien au catalogue.
8. **Mode sombre** via `next-themes`, couleurs en variables CSS alimentées par `brand.ts`.
9. Hors périmètre confirmé : e-mails de renouvellement (phase ultérieure).

**Questions pour toi**

- Fournisseur SMS préféré (Twilio par défaut) ? Ou on démarre e-mail seulement ?
- Nom de domaine déjà choisi ? (impacte `NEXT_PUBLIC_SITE_URL`, sitemap, OG.)
- OK pour un **nouveau dépôt monorepo simple à la racine de `/home/user/Trato`** (pas de sous-dossier `trato/`) ?
