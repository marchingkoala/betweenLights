# Render — backend deploy (Step 3)

## Before you create the Web Service

1. Commit and push the latest `main` to GitHub (`betweenLights`), including:
   - `npm start` / `engines`
   - DB SSL + CORS fixes
   - `backend/db/` schema + seeds
2. Confirm Postgres (`eyewear_store`) is already created and seeded (Step 2).

## Create the Web Service

In Render → your project → **New** → **Web Service**:

| Setting | Value |
|---------|--------|
| Repository | `marchingkoala/betweenLights` |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance type | Free (fine for portfolio) |

Health check path (optional): `/`

## Environment variables

Set these in the Web Service → Environment:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render often injects `PORT` automatically — you can omit this)* |
| `JWT_SECRET` | a long random string (do **not** reuse a weak local secret) |
| `DB_USER` | `eyewear_store_user` |
| `DB_PASSWORD` | *(from Render Postgres)* |
| `DB_HOST` | Internal host if API + DB are in the same Render region (Connect → Internal), otherwise External host |
| `DB_PORT` | `5432` |
| `DB_NAME` | `eyewear_store` |
| `DB_SSL` | `true` |
| `STRIPE_SECRET_KEY` | `sk_test_...` (test mode is fine for portfolio) |
| `STRIPE_WEBHOOK_SECRET` | temporary placeholder OK — **replace after** you register the live webhook (Step 4) |
| `FRONTEND_URL` | your Vercel URL once frontend is live (e.g. `https://….vercel.app`) — no trailing slash |
| `AIRTABLE_TOKEN` | your PAT |
| `AIRTABLE_BASE_ID` | `appZNOiF4rsQDRklv` |

### Prefer Internal DB host when possible

On the Postgres service page, copy **Internal Database URL** / host while the API is also on Render. Faster and stays on Render’s private network. Use External host only if Internal connection fails.

## After first deploy

1. Open `https://<your-service>.onrender.com/` — should show `API is running`.
2. Open `https://<your-service>.onrender.com/test-db` — should return a JSON timestamp.
3. Open `https://<your-service>.onrender.com/api/products?category=eyeglasses` — should return product rows.
4. Note the public URL — you’ll need it for:
   - Vercel `VITE_API_BASE_URL` (Step 5)
   - Stripe webhook endpoint: `https://<your-service>.onrender.com/api/stripe/webhook` (Step 4)

## Free-tier note

Render free web services **spin down** after idle time. The first request after a pause can take ~30–60s. That’s expected for a portfolio demo; mention it in your README if reviewers hit a cold start.
