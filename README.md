# OpenHouse AI — Milestone 2

A private, database-backed property information system extending the existing Next.js realtor dashboard. Authentication, drafts, structured information, rooms, amenities, real photo uploads, document references, completeness, and verification metadata now use the server and PostgreSQL. The dashboard's search, status/type filters, sorting, cards, and visual design are retained.

## Quick start (this workspace)

Node.js 20.9+ and PostgreSQL are required. PostgreSQL 16 is installed on this machine.

```sh
npm ci
npm run db:local
npm run db:migrate
npm run dev
```

Open http://localhost:3000/login and create your own realtor account. There is no shared demo login or seeded authentication bypass. Empty accounts start with an empty property dashboard.

`db:local` initializes a development-only cluster under `.data/postgres`, bound to **127.0.0.1:55432**, and creates the `openhouse` database. It generates a random database password, writes a git-ignored `.env.local` with mode 0600, and does not print the password. The PostgreSQL data and private uploads survive application restarts. It reuses an existing local cluster. If `.env.local` already exists but the local cluster does not, it stops rather than overwriting your configuration.

The helper defaults to `/opt/homebrew/opt/postgresql@16/bin`. Set `PG_BIN` for a different local PostgreSQL installation. Its local Unix socket uses trust authentication for development; production should use a managed/hardened PostgreSQL service and a dedicated application role.

## Starting and stopping locally

From the project directory, start the local database with `npm run db:local`, then start the app with `npm run dev`. Open http://localhost:3000. Run `npm run db:migrate` after pulling changes that add database migrations.

To stop the app, press **Ctrl+C** in the terminal running `npm run dev` (or `npm start`). This releases port 3000. PostgreSQL runs separately and remains running; stopping the app does not delete saved properties or photos.

To also stop this workspace's local PostgreSQL cluster:

```sh
/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D .data/postgres -m fast stop
```

If you used a different PostgreSQL installation, replace the executable path with your `PG_BIN` directory. Start it again with `npm run db:local`. Do not delete `.data` to stop services: it contains your database and uploaded photos.

## Configure an existing PostgreSQL service

Copy `.env.example` to `.env.local` and set:

| Variable                | Meaning                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection URI with application credentials. Use the provider's TLS connection parameters for a hosted database.                 |
| `APP_ORIGIN`            | Exact browser origin, including port; for example `http://localhost:3000`. Required for mutation Origin/CSRF checks. Do not use a wildcard. |
| `SESSION_COOKIE_SECURE` | Set `false` for local HTTP only. Set `true` for HTTPS deployment. Defaults to secure when unset.                                            |
| `UPLOAD_DIR`            | Private **persistent** storage directory, outside `public/`. Default `.data/uploads`. Use an absolute persistent-volume path in deployment. |

Then run `npm run db:migrate` before starting the app. Do not commit `.env.local`, `.data`, database backups, or uploaded images. No OpenAI, Supabase, SMTP, or OAuth credentials are needed for this implementation.

```sh
npm run build
npm start
```

The build uses Next.js's bundled webpack because Turbopack's worker previously conflicted with the host sandbox. Development retains Next's default bundler. `next/font` fetches Inter during the build and self-hosts it thereafter. Run typecheck after a build, not concurrently with one, since Next regenerates route types.

## Database and server architecture

The app uses `pg` with parameterized SQL, a small shared pool, and transactions. No ORM or separate server was added. SQL migrations are transactional, versioned, and guarded by a PostgreSQL advisory lock. Applied migrations are recorded in `schema_migrations`; rerunning the migration command is safe.

| Table                | Purpose                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`              | Realtor ID, name, unique normalized email, authentication identity, salted scrypt password hash, timestamps.                                                                                      |
| `sessions`           | Hashed opaque session token, user relationship, expiry and creation time.                                                                                                                         |
| `auth_attempts`      | Persistent, bounded-window authentication attempt counters.                                                                                                                                       |
| `properties`         | Owner, Draft/Ready/Published/Archived state, typed listing/address/price/description columns, revision, timestamps.                                                                               |
| `property_details`   | Typed numeric, boolean, and text Core/Essential details, including separate full/half bathrooms, finances, interior, exterior, systems, parking, restrictions, and conditional lot applicability. |
| `property_facts`     | Per-field verification, source, update time; optional Enrichment values use mutually exclusive text/number/boolean columns. No giant JSON property blob.                                          |
| `property_rooms`     | Dimensions/unit, room identity/type/level, features array, light/orientation/windows/closets, description, verification and source.                                                               |
| `property_amenities` | Repeatable amenity name, description, verification, source, and timestamp.                                                                                                                        |
| `property_media`     | Private storage key, validated image metadata, display order, cover designation, room association, timestamp. A partial unique index enforces one cover.                                          |
| `property_documents` | Private metadata, type, storage reference, and Private/Realtor-approved permissions.                                                                                                              |
| `storage_deletions`  | Durable cleanup queue populated by media deletion triggers, including cascades.                                                                                                                   |

Foreign keys cascade property relationships and enforce that a photo's room belongs to the same property. The API ignores no client-supplied owners: owner IDs are rejected by validation and always obtained from the authenticated session. Reads and writes are scoped through an ownership check; unauthorized owners receive 404. Missing sessions receive 401. There are no public property, image, or document delivery routes.

Authentication uses native Node scrypt (`N=32768`, random salt), constant-time comparison, a random 256-bit session token, and database-backed sessions. Cookies are HttpOnly, SameSite=Lax, host-only, expiring in seven days, and Secure according to the HTTPS configuration. Login rotates the current browser session; logout revokes it in PostgreSQL. Server-side Origin checks cover mutations, including login/logout and multipart uploads. Body-size limits are enforced while streaming requests. API errors avoid returning database internals.

## Editor workflow

1. **Create Property** opens the dedicated editor. Save an entirely empty draft, or add any valid subset of facts and save. Missing requirements do not block saving.
2. **Core / Essential / Enrichment** tabs group the definitions in `src/lib/managed/fields.ts`. Each value can be Unknown, Realtor-provided, Verified, or (where appropriate) Not applicable. Typing a new value resets it to Realtor-provided and clears its old verification source. Verified requires a source reference. Core requirements cannot be bypassed by marking a required fact not applicable.
3. **Save Draft** saves property fields explicitly and displays saving, saved, failed, and last-saved states. Revision checks reject stale field updates with 409 and offer a reload rather than silently overwriting another session.
4. **Rooms** has explicit Add/Save/Remove actions, dimensions, ceiling height, windows, orientation, light, closets, repeatable features, and room verification. **Enrichment** also has repeatable property amenities with their own saves.
5. **Photos** works after the draft exists. Select multiple files, inspect previews, upload, describe photos, assign them to rooms, select a cover, reorder using accessible arrows, or delete. Room deletion detaches its photos rather than deleting them.
6. **Documents** stores, edits, and removes private metadata/references for later document delivery. No document upload/download or public link is implied. Realtor-approved references remain owner-only at this milestone.
7. **View property** shows saved information, verification/source labels, rooms, real photos, and private document references. Properties can be archived/restored in the editor or permanently removed from the private detail view after confirmation.

Browser unload, internal-link navigation, resource-tab changes, and sign-out have unsaved-change guards. Room/photo/document/amenity forms have their own explicit saves; saving property fields does not implicitly upload selected files or save an unfinished resource form. No autosave is claimed.

## Completeness and readiness

`FIELDS` and `COLLECTION_REQUIREMENTS` define the denominators and requirements used on both server and client. Completion is recomputed from saved values after every successful property/resource mutation. The editor also previews completeness while entering field values.

- Core requires title, structured address, country, property type, positive price, description, bedrooms, full/half bathrooms, interior area, year built, and at least one usable persisted photo.
- Lot size is mandatory for detached houses and duplexes. Other property types can opt in using the applicable-lot control; otherwise lot size does not block readiness.
- Zero bedrooms, zero half bathrooms, false booleans, and zero optional fees remain distinct from unknown values.
- Unknown and Not-applicable facts do not supply required values. Optional Not-applicable facts are excluded from informational completion denominators.
- Essential and Enrichment completion never block Core readiness. Room/amenity collections provide informational Enrichment context.
- A successful save can move Draft → Ready. It **never publishes** the property. Published is a persisted state reserved for a later controlled publishing workflow, not a client-settable save value. Removing required data or the last photo moves a Ready record back to Draft. Archived stays archived until explicitly restored.

## Photo storage

Images are stored as files, not database blobs. The server accepts JPEG, PNG, WebP, and AVIF; validates MIME/size, decodes with `sharp`, rejects invalid content and images above 40 megapixels, autorotates, resizes to at most 2560px, strips metadata, and re-encodes as WebP. Limits: 10 MB/file, 30 MB multipart batch, ten files/batch, and 100 photos/property.

All file names are server-generated UUID keys. The image route authenticates and checks property ownership before serving bytes with private/no-store headers and `nosniff`. The private storage path is never returned to browsers. Failed uploads roll back metadata and remove files written in that failed transaction. Media deletion queues physical cleanup durably and processes that queue after normal deletion requests.

```sh
npm run storage:cleanup
```

Run cleanup periodically using the same database and upload directory as the application. It retries queued deletions and removes expired sessions/old login-attempt records. Back up PostgreSQL and the upload volume together. A process crash between writing a file and committing its database row may leave an unreferenced file; periodic orphan auditing is not implemented.

**Deployment:** this disk-backed adapter requires a Node host with a persistent volume. It is not suitable for ephemeral Vercel/serverless filesystems as-is. A later object-storage adapter can keep the same private media routes and database contract. Do not expose `UPLOAD_DIR` as a static web directory.

## Tests

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:integration
```

- `npm test`: the ten existing regression tests, retained for the prototype readiness/filter/validation and legacy-data behavior.
- `test:integration`: real PostgreSQL and an isolated production Next.js server on port **3317**. Build and migrate first. The suite creates synthetic accounts/data, uses real cookies, exercises authenticated APIs and image decoding/storage, restarts the application, and cleans up its accounts/files afterward. Do not run two copies concurrently on that port.
- The integration suite covers empty/partial draft creation, updates, persistence, rooms, Core validation, conditional requirements, verification/unknown/NA values, false/zero handling, ownership on all resource paths, unauthenticated rejection, private photo delivery, invalid/oversized uploads, photo order/cover/metadata, document edits/permissions, amenities, revision conflicts, deletion, Origin/CSRF checks, session revocation, and restart persistence.
- Browser QA covers real registration, empty-account dashboard, partial/full field saves, room creation, uploaded photo rendering, reorder and cover selection. Automated browser file selection was blocked by the extension's file-URL permission; real file uploads were verified through the authenticated API instead. Ordinary manual browser uploads do not require that automation permission.

## Important files

- `db/migrations/001_property_management.sql` through `004_room_verification.sql`: relational schema and additive migrations.
- `scripts/db-local.mjs`, `scripts/migrate.mjs`, `scripts/storage-cleanup.mjs`: local setup, migrations, maintenance.
- `src/lib/server/{db,auth,http,properties,media}.ts`: PostgreSQL transactions, authentication, request limits, authorization, property/resource services and private image storage.
- `src/app/api/auth/[action]/route.ts`, `src/app/api/properties/route.ts`, `src/app/api/properties/[...segments]/route.ts`: authenticated HTTP API.
- `src/lib/managed/{fields,validation,adapter,client}.ts`: common field definitions, draft/room/document/amenity validation, completeness, dashboard mapping and API client.
- `src/components/editor/`: property editor, room/photo/document/amenity managers, sign-in/out, unsaved-state guard, private property view.
- `src/app/login`, `src/app/properties`, dashboard page, root layout and global-error boundary: protected routes and graceful failure handling.
- Existing dashboard components, `use-properties.ts`, legacy readiness wrapper, property UI, sidebar and global CSS: connected to authenticated database records while preserving the visual system.
- `.env.example`, `package.json`, lockfile: configuration, database/test scripts, direct `pg` and `sharp` dependencies, and PostgreSQL types.
- `src/lib/server/integration.test.ts`: database/API integration suite.

## Limitations and next milestone

- AI, QR/NFC, public visitor pages, open-house scheduling, payments, CRM, and analytics remain absent. No Ready record is public.
- Authentication is working email/password authentication, but email verification, password reset/recovery, MFA, and invitation management are not implemented. Use HTTPS and the Secure cookie setting for deployment; add account-lifecycle services before a wider rollout.
- Document references and permissions are implemented; actual document uploads/downloads are future work.
- Photo storage requires a persistent local volume. No cloud bucket, CDN, or orphan-file auditor is configured.
- Original localStorage prototype records are left untouched in the browser. They are not silently imported into a signed-in account. Legacy prototype modules/tests remain for reference but are no longer used by the live routes.
- Full physical-device and screen-reader testing remains manual. Browser history traversal may differ from guarded link/unload navigation; save explicitly before leaving an editor.

Milestone 3 can build on authenticated owner relationships, structured fact values and sources, private media, document permissions, persistent IDs, and a single shared readiness evaluator. Publishing and visitor access still need an explicit authorized transition and a carefully selected public data projection.

## Dashboard and My Properties

These routes now have distinct jobs. `/dashboard` is the preparation overview: portfolio metrics, properties missing Core information (excluding archived listings), Ready profiles, and recently edited work. It highlights the next scheduled open house only when one exists.

`/properties` is the management workspace: the complete property list, active/archive counts, search, status/type filters, sorting, and view/edit actions. Dashboard drill-down links open this workspace with the relevant status selected. Status selection is reflected in the URL. The dashboard does not repeat the full table and filter controls.

Page separation files: `src/components/dashboard/preparation-overview.tsx`, `src/components/dashboard/properties-workspace.tsx`, `src/components/dashboard/dashboard.tsx`, `src/app/properties/page.tsx`, shared sidebar and global styling.
