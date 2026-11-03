import { Linking, Platform } from 'react-native';

/**
 * Dayzo Plus: one-time unlock.
 *
 * Real payments need an account that only the app owner can create, so none is hard-coded here.
 * Fill in ONE of these before shipping:
 *  - PAYMENT_LINK: a Stripe Payment Link / Gumroad / Lemon Squeezy URL (web + sideloaded APK).
 *  - Native stores: add RevenueCat (react-native-purchases) in a dev build and set `plus` from its entitlement.
 * Until then the Upgrade button is disabled and nothing is ever marked as purchased.
 */
export const PAYMENT_LINK = '';
export const PLUS_PRICE_LABEL = '₹199 one-time';

export const paymentConfigured = () => PAYMENT_LINK.length > 0;

export async function startPurchase(): Promise<boolean> {
  if (!paymentConfigured()) return false;
  try {
    await Linking.openURL(PAYMENT_LINK);
    return true;
  } catch {
    return false;
  }
}

/** Test-only unlock: available in dev builds, never in a production bundle. */
export const canDevUnlock = () => typeof __DEV__ !== 'undefined' && __DEV__ && Platform.OS !== undefined;
