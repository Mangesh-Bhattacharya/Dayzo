import { Linking } from 'react-native';

/**
 * Dayzo Plus: one-time unlock, confirmed by a tiny backend (see /backend).
 *
 * Fill both in after setup (backend/README.md):
 *  - PAYMENT_LINK: your Stripe Payment Link (https://buy.stripe.com/...).
 *  - ENTITLEMENT_URL: your deployed Worker, e.g. https://dayzo-entitlement.<you>.workers.dev
 * While either is empty the Upgrade button stays disabled and nothing is ever marked as purchased.
 *
 * The only network traffic Dayzo makes is: opening the payment page, and one request carrying the
 * random install id to ENTITLEMENT_URL when the user taps "I've paid" or reopens the app after paying.
 */
export const PAYMENT_LINK = '';
export const ENTITLEMENT_URL = '';
export const PLUS_PRICE_LABEL = '₹199 one-time';

export const paymentConfigured = () => PAYMENT_LINK.length > 0 && ENTITLEMENT_URL.length > 0;

export const paymentUrl = (installId: string) =>
  `${PAYMENT_LINK}${PAYMENT_LINK.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(installId)}`;

export async function startPurchase(installId: string): Promise<boolean> {
  if (!paymentConfigured()) return false;
  try {
    await Linking.openURL(paymentUrl(installId));
    return true;
  } catch {
    return false;
  }
}

/** true = paid, false = not paid yet, null = could not check (offline / error). Never throws. */
export async function checkEntitlement(installId: string): Promise<boolean | null> {
  if (!paymentConfigured()) return null;
  try {
    const r = await fetch(`${ENTITLEMENT_URL.replace(/\/$/, '')}/entitlement?id=${encodeURIComponent(installId)}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.plus === true;
  } catch {
    return null;
  }
}

/** Test-only unlock: available in dev builds, never in a production bundle. */
export const canDevUnlock = () => typeof __DEV__ !== 'undefined' && __DEV__;
