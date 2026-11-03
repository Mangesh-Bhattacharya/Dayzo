# Dayzo entitlement backend

A ~100-line Cloudflare Worker that lets a plain Stripe Payment Link unlock Dayzo Plus.
Cloudflare Workers + KV have a free tier; Stripe has no monthly fee (per-sale fees apply, check current rates).

## How it works
1. App opens `PAYMENT_LINK?client_reference_id=<random install id>`.
2. Stripe sends `checkout.session.completed` to `POST /webhook`. The Worker verifies the signature, and stores `paid:<install id>`.
3. App calls `GET /entitlement?id=<install id>` and sets `plus` when it returns `{"plus":true}`.

Only the random install id is stored. Refunds are not revoked automatically (handle in the Stripe dashboard, or add `charge.refunded` later).

## Deploy (about 10 minutes, needs your accounts)
1. Stripe dashboard: create a Product at your price, then a Payment Link for it.
2. `cd backend && npx wrangler login`
3. `npx wrangler kv namespace create PAID` and paste the printed id into `wrangler.toml`.
4. `npx wrangler deploy` (note the `*.workers.dev` URL).
5. Stripe dashboard > Developers > Webhooks > add endpoint `<worker url>/webhook`, event `checkout.session.completed` (and `checkout.session.async_payment_succeeded`). Copy the signing secret.
6. `npx wrangler secret put STRIPE_WEBHOOK_SECRET` and paste it.
7. In `src/plus.ts` set `PAYMENT_LINK` and `ENTITLEMENT_URL`, then rebuild the app.
8. Test with Stripe test mode first (test Payment Link + test webhook secret) before going live.

## Tests
`npx tsx backend/worker.test.ts`
