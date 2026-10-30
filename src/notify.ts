import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AppState, dailyBudget, inr, spendsOn, sum } from './logic';

const MORNING_HOUR = 8;
const NIGHT_HOUR = 21;
const NIGHT_MIN = 30;
const CHANNEL = 'daily';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (Platform.OS === 'android') {
      // Android 13+ needs a channel before the permission prompt appears.
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Daily budget',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return asked.granted;
  } catch {
    return false;
  }
}

function at(base: Date, offsetDays: number, hour: number, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/**
 * Rebuilds the next 7 days of notifications from current data. Called on app open
 * and after every change, so the night summary always carries fresh numbers.
 */
export async function syncNotifications(state: AppState): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (state.income == null || (!state.morning && !state.night)) return;
    const granted = (await Notifications.getPermissionsAsync()).granted;
    if (!granted) return;

    const now = new Date();
    const DATE = Notifications.SchedulableTriggerInputTypes.DATE;

    for (let i = 0; i < 7; i++) {
      const day = at(now, i, 0);
      const budget = dailyBudget(state.income, day);

      if (state.morning) {
        const when = at(now, i, MORNING_HOUR);
        if (when.getTime() > Date.now()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Good morning. Your daily budget is ${inr(budget)}`,
              body: 'Spend it like you mean it.',
            },
            trigger: { type: DATE, date: when, channelId: CHANNEL },
          });
        }
      }

      if (state.night) {
        const when = at(now, i, NIGHT_HOUR, NIGHT_MIN);
        if (when.getTime() > Date.now()) {
          let title = 'How did today go?';
          let body = 'Log your last spends and see where you landed.';
          if (i === 0) {
            const spent = sum(spendsOn(state.spends, now));
            const left = budget - spent;
            title = left >= 0 ? `${inr(left)} left of ${inr(budget)} today` : `Over by ${inr(-left)} today`;
            body =
              spent === 0
                ? 'Nothing logged yet. Add today’s spends before bed.'
                : `You spent ${inr(spent)}. Add anything you missed.`;
          }
          await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: { type: DATE, date: when, channelId: CHANNEL },
          });
        }
      }
    }
  } catch {
    // notifications are best-effort
  }
}
