import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, initialState } from './logic';

const KEY = 'dayzo.state.v1';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

export async function saveState(s: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // storage failures should never crash the app
  }
}
