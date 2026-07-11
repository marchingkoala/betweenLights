# Database setup (Step 2 — deploy)

These files recreate a production-ready Postgres database for Between Lights:
schema, catalog seed data, and a demo admin user.

**Not included on purpose:** local test users, orders, checkout sessions, or inventory history.

## Files

| File | Purpose |
|------|---------|
| `migrations/001_schema.sql` | Extensions, enums, and all tables |
| `seeds/001_products.sql` | 37 products + 48 product images (stock reset to 50) |
| `seeds/002_admin.sql` | Demo admin (`admin@admin.com` / `Admin123!`) |

## Create a managed Postgres instance

Pick one (same as the deploy plan):

1. **Render** → New → PostgreSQL → create → copy the **External Database URL**
2. **Neon** → New project → copy the connection string

You’ll need that URL as `DATABASE_URL` below, and later as separate `DB_*` env vars for the Express app (plus `DB_SSL=true`).

## Load order

From the repo root (or any machine with `psql` installed):

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require'

psql "$DATABASE_URL" -f backend/db/migrations/001_schema.sql
psql "$DATABASE_URL" -f backend/db/seeds/001_products.sql
psql "$DATABASE_URL" -f backend/db/seeds/002_admin.sql
```

Quick sanity check:

```bash
psql "$DATABASE_URL" -c "SELECT count(*) AS products FROM products;"
psql "$DATABASE_URL" -c "SELECT email, role FROM users;"
```

Expect ~37 products and one `admin@admin.com` admin row.

## Map URL → backend env vars

When you deploy the API (Step 3), set:

```env
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_SSL=true
```

(or parse them from your provider’s connection string).

## Product images note

Catalog image paths in the DB look like `/eyeglasses/...png` and `/sunglasses/...png`.
Those files live under `backend/public/` and are served by Express static hosting.
They ship with the backend deploy — no extra CDN step required for the portfolio.
