import { Level } from './theme';

export type Category =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'fun'
  | 'other';

export const CATEGORIES: { key: Category; label: string; color: string; glyph: string }[] = [
  { key: 'food', label: 'Food & drink', color: '#FF9F4D', glyph: 'F' },
  { key: 'groceries', label: 'Groceries', color: '#B8FF2C', glyph: 'G' },
  { key: 'transport', label: 'Transport', color: '#4DA3FF', glyph: 'T' },
  { key: 'shopping', label: 'Shopping', color: '#FF5DAA', glyph: 'S' },
  { key: 'bills', label: 'Bills', color: '#FFC83D', glyph: 'B' },
  { key: 'fun', label: 'Fun', color: '#8B5CFF', glyph: 'N' },
  { key: 'other', label: 'Other', color: '#8A90A2', glyph: 'O' },
];

export const catOf = (k: Category) => CATEGORIES.find((c) => c.key === k) ?? CATEGORIES[6];

export type Spend = {
  id: string;
  amount: number;
  label: string;
  category: Category;
  ts: number;
};

export type AppState = {
  income: number | null;
  startedAt: number;
  spends: Spend[];
  morning: boolean;
  night: boolean;
};

export const initialState = (): AppState => ({
  income: null,
  startedAt: Date.now(),
  spends: [],
  morning: true,
  night: true,
});

export const QUICK_ADDS: { label: string; amount: number; category: Category }[] = [
  { label: 'Coffee', amount: 250, category: 'food' },
  { label: 'Lunch', amount: 300, category: 'food' },
  { label: 'Groceries', amount: 600, category: 'groceries' },
  { label: 'Auto ride', amount: 120, category: 'transport' },
  { label: 'Snacks', amount: 150, category: 'food' },
];

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
export const dailyBudget = (income: number, d: Date) => Math.floor(income / daysInMonth(d));

/** Indian digit grouping: 1,00,000 */
export function inr(n: number): string {
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString();
  let out: string;
  if (s.length <= 3) out = s;
  else {
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    out = `${rest},${last3}`;
  }
  return `${neg ? '-' : ''}₹${out}`;
}

export const spendsOn = (spends: Spend[], d: Date) => {
  const k = dayKey(d);
  return spends.filter((s) => dayKey(new Date(s.ts)) === k);
};

export const sum = (spends: Spend[]) => spends.reduce((a, s) => a + s.amount, 0);

export function levelFor(spent: number, budget: number): Level {
  if (budget <= 0) return 'bad';
  const r = spent / budget;
  if (r < 0.65) return 'good';
  if (r <= 1) return 'warn';
  return 'bad';
}

export function headline(level: Level, remaining: number, spent: number): string {
  if (spent === 0) return 'No spends yet. Easy.';
  if (level === 'good') return 'Life is good.';
  if (level === 'warn') return remaining === 0 ? 'Right on the line.' : 'Easy there. Watch it.';
  return 'Over budget. Ouch.';
}

/** Allowance earned so far this month minus what was spent this month. */
export function monthPulse(state: AppState, now: Date) {
  if (state.income == null) return 0;
  let allowance = 0;
  // only count days since the user started, not the whole month
  const started = new Date(state.startedAt);
  const firstDay =
    started.getFullYear() === now.getFullYear() && started.getMonth() === now.getMonth()
      ? started.getDate()
      : 1;
  for (let day = firstDay; day <= now.getDate(); day++) {
    allowance += dailyBudget(state.income, new Date(now.getFullYear(), now.getMonth(), day));
  }
  const spent = sum(
    state.spends.filter((s) => {
      const d = new Date(s.ts);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }),
  );
  return allowance - spent;
}

/** Consecutive days under budget, counting back from today (if still under) or yesterday. */
export function streak(state: AppState, now: Date): number {
  if (state.income == null) return 0;
  const start = new Date(state.startedAt);
  start.setHours(0, 0, 0, 0);
  let count = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  // today counts only if currently under budget
  const todayOk = sum(spendsOn(state.spends, cursor)) <= dailyBudget(state.income, cursor);
  if (todayOk) count++;
  cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 365 && cursor >= start; i++) {
    const ok = sum(spendsOn(state.spends, cursor)) <= dailyBudget(state.income, cursor);
    if (!ok) break;
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const digits = (s: string) => parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
