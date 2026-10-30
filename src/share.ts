import { Platform, Share } from 'react-native';

/** Set this to your landing page / store link once you have one. It is appended to every shared message. */
export const APP_URL = '';

/** Returns true when the text was copied to the clipboard instead of opening a share sheet. */
export async function shareText(text: string): Promise<boolean> {
  const message = APP_URL ? `${text}\n${APP_URL}` : text;
  try {
    if (Platform.OS === 'web') {
      const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
      if (nav?.share) {
        await nav.share({ text: message });
        return false;
      }
      await nav?.clipboard?.writeText(message);
      return true;
    }
    await Share.share({ message });
  } catch {
    // user cancelled or sharing unavailable
  }
  return false;
}
