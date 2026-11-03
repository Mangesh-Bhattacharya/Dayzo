/**
 * Dayzo entitlement backend (Cloudflare Worker + one KV namespace).
 *
 * Flow:
 *  1. The app opens the Stripe Payment Link with ?client_reference_id=<random install id>.
 *  2. Stripe calls POST /webhook after payment; we verify the signature and store paid:<installId>.
 *  3. The app calls GET /entitlement?id=<installId> and unlocks Plus when it returns {"plus":true}.
 *
 * No emails, names or card data are stored: only the random install id and a timestamp.
 */
export interface Env {
  PAID: KVNamespace;
  STRIPE_WEBHOOK_SECRET: string;
}
type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
};

const ID_RE = /^[a-z0-9]{20,64}$/;
const TOLERANCE_S = 300;
const enc = new TextEncoder();

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Verifies a Stripe-Signature header (t=...,v1=...) over the raw body. */
export async function verifyStripe(body: string, header: string | null, secret: string, nowS = Math.floor(Date.now() / 1000)): Promise<boolean> {
  if (!header || !secret) return false;
  const parts = header.split(',').map((p) => p.split('=') as [string, string]);
  const t = parts.find(([k]) => k === 't')?.[1];
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length || Math.abs(nowS - Number(t)) > TOLERANCE_S) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = hex(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${body}`)));
  return sigs.some((s) => safeEqual(s, mac));
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
  });

export async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === 'OPTIONS') return json({}, 204);

  if (req.method === 'GET' && url.pathname === '/entitlement') {
    const id = url.searchParams.get('id') ?? '';
    if (!ID_RE.test(id)) return json({ error: 'bad id' }, 400);
    return json({ plus: (await env.PAID.get(`paid:${id}`)) !== null });
  }

  if (req.method === 'POST' && url.pathname === '/webhook') {
    const raw = await req.text();
    if (!(await verifyStripe(raw, req.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET))) {
      return json({ error: 'bad signature' }, 400);
    }
    let evt: any;
    try {
      evt = JSON.parse(raw);
    } catch {
      return json({ error: 'bad json' }, 400);
    }
    const s = evt?.data?.object;
    if ((evt.type === 'checkout.session.completed' || evt.type === 'checkout.session.async_payment_succeeded') && s?.payment_status === 'paid') {
      const id = String(s.client_reference_id ?? '');
      if (ID_RE.test(id)) await env.PAID.put(`paid:${id}`, String(Date.now()));
    }
    return json({ received: true });
  }

  return json({ error: 'not found' }, 404);
}

export default { fetch: (req: Request, env: Env) => handle(req, env) };
