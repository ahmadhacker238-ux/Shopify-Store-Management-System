# Shoply v1.5.0 — Builder Productivity & Security

Shoply v1.5 upgrades the existing responsive visual builder without replacing the merchant database or uploaded files. This release intentionally does **not** add database backup; that feature is reserved for a later release.

## v1.5 highlights

- Enhanced Navigator with select, visibility, duplicate, delete and drag controls.
- Exact container/widget insertion indicators retained and refined.
- Keyboard workflow: undo/redo, copy, paste, duplicate and delete.
- Reusable container templates saved inside the store theme.
- Merchant Media Library with search, upload, reuse and safe deletion.
- Browser recovery copy, five-second private draft autosave and unsaved-change warning.
- Advanced container background image, gradient, overlay, border, radius, shadow, overflow, direction and minimum height controls.
- Tablet/mobile column order and responsive container direction/minimum height.
- Security hardening: signed payment-proof tokens, authenticated media management, upload signature checks, request rate limits, production-safe session secret and disabled demo-card mode in production.
- Invalid database JSON is never silently replaced with an empty database.

## Upgrade an existing v1.4 installation

1. Stop Shoply.
2. Keep your existing `data/db.json`, `.env.local` and `public/uploads` folder.
3. Extract the v1.5 patch into the Shoply v1.4 root and allow matching application files to be replaced.
4. Do not copy a database file from the patch; none is included.
5. Run `VERIFY.bat`, then `START.bat`.

Theme schema v7 is migrated automatically when old store themes are read. Existing products, customers, orders, uploads and login records remain in place.

## Production requirement

Set a strong `SESSION_SECRET` in `.env.local` before using production mode. Development keeps a local fallback for easy offline testing; production refuses to use that fallback.

## Verification

- `npm run test:v1.5` runs focused v1.5 feature/security checks.
- `npm run verify` runs the full source, migration and TypeScript checks.
- `TESTING-CHECKLIST.md` contains the manual browser test plan.

On Windows x64 with the original complete v1.4 package, existing bundled dependencies can be reused and `START.bat` does not run `npm install`.
