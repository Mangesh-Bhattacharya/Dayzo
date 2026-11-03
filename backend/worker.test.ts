import { handle, verifyStripe, Env } from './worker';
let fails = 0;
const eq = (n: string, g: unknown, w: unknown) => { const ok = JSON.stringify(g) === JSON.stringify(w); if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${n}${ok ? '' : ` got=${JSON.stringify(g)} want=${JSON.stringify(w)}`}`); };
const store = new Map<string, string>();
const env: Env = { STRIPE_WEBHOOK_SECRET: 'whsec_test', PAID: { get: async (k) => store.get(k) ?? null, put: async (k, v) => void store.set(k, v), delete: async (k) => void store.delete(k) } };
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
async function sign(body: string, t: number, secret = 'whsec_test') {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return `t=${t},v1=${hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${t}.${body}`)))}`;
}
const ID = 'abcdefghij0123456789abcd';
const evt = (o: object) => JSON.stringify({ type: 'checkout.session.completed', data: { object: { payment_status: 'paid', client_reference_id: ID, ...o } } });
const post = async (body: string, sig: string | null) => handle(new Request('https://x/webhook', { method: 'POST', body, headers: sig ? { 'stripe-signature': sig } : {} }), env);
const get = async (id: string) => handle(new Request(`https://x/entitlement?id=${id}`), env);
(async () => {
  const now = Math.floor(Date.now() / 1000);
  eq('unpaid before', await (await get(ID)).json(), { plus: false });
  eq('rejects missing sig', (await post(evt({}), null)).status, 400);
  eq('rejects wrong secret', (await post(evt({}), await sign(evt({}), now, 'other'))).status, 400);
  eq('rejects old timestamp', (await post(evt({}), await sign(evt({}), now - 4000))).status, 400);
  eq('tampered body rejected', (await post(evt({}) + ' ', await sign(evt({}), now))).status, 400);
  eq('still unpaid after rejects', await (await get(ID)).json(), { plus: false });
  eq('unpaid session ignored', (await post(evt({ payment_status: 'unpaid' }), await sign(evt({ payment_status: 'unpaid' }), now))).status, 200);
  eq('still unpaid after unpaid evt', await (await get(ID)).json(), { plus: false });
  eq('bad id not stored', (await post(evt({ client_reference_id: '../x' }), await sign(evt({ client_reference_id: '../x' }), now))).status, 200);
  eq('valid payment accepted', (await post(evt({}), await sign(evt({}), now))).status, 200);
  eq('paid after webhook', await (await get(ID)).json(), { plus: true });
  eq('other id still unpaid', await (await get('zzzzzzzzzz0123456789zzzz')).json(), { plus: false });
  eq('bad id 400', (await get('short')).status, 400);
  eq('verifyStripe empty secret', await verifyStripe('x', 't=1,v1=a', ''), false);
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
})();
