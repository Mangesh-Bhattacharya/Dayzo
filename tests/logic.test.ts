import { spendable, spendsToCsv, inr, dailyBudget, daysInMonth, levelFor, monthPulse, streak, spendsOn, sum, digits, initialState, AppState, Spend } from '../src/logic';
let fails = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
eq('inr 0', inr(0), '₹0');
eq('inr 999', inr(999), '₹999');
eq('inr 1000', inr(1000), '₹1,000');
eq('inr 100000', inr(100000), '₹1,00,000');
eq('inr 12345678', inr(12345678), '₹1,23,45,678');
eq('inr negative', inr(-225), '-₹225');
eq('inr rounds', inr(3225.6), '₹3,226');
eq('days feb 2028 (leap)', daysInMonth(new Date(2028, 1, 10)), 29);
eq('days feb 2027', daysInMonth(new Date(2027, 1, 10)), 28);
eq('budget 100000 / 31', dailyBudget(100000, new Date(2026, 9, 30)), 3225);
eq('budget 100000 / 30', dailyBudget(100000, new Date(2026, 10, 5)), 3333);
eq('digits', digits('1,00,000'), 100000);
eq('digits empty', digits(''), 0);
eq('level good', levelFor(0, 3000), 'good');
eq('level warn', levelFor(2500, 3000), 'warn');
eq('level exactly budget', levelFor(3000, 3000), 'warn');
eq('level bad', levelFor(3001, 3000), 'bad');
eq('level zero budget', levelFor(0, 0), 'bad');

const mk = (d: Date, amount: number): Spend => ({ id: Math.random().toString(), amount, label: 'x', category: 'food', ts: d.getTime() });
const now = new Date(2026, 9, 30, 15, 0, 0); // Oct 30
const st = (over: Partial<AppState>): AppState => ({ ...initialState(), income: 93000, startedAt: new Date(2026, 9, 1).getTime(), ...over });

// 93000/31 = 3000 per day
eq('spendsOn only that day', sum(spendsOn([mk(now, 100), mk(new Date(2026, 9, 29, 23, 59), 50)], now)), 100);
eq('spendsOn midnight boundary', sum(spendsOn([mk(new Date(2026, 9, 30, 0, 0, 0), 70)], now)), 70);

// month pulse: 30 days allowance (day 1..30) = 90000
eq('pulse no spend', monthPulse(st({}), now), 90000);
eq('pulse with spend', monthPulse(st({ spends: [mk(now, 1000)] }), now), 89000);
eq('pulse started today only', monthPulse(st({ startedAt: now.getTime() }), now), 3000);
eq('pulse ignores last-month spends', monthPulse(st({ spends: [mk(new Date(2026, 8, 20), 5000)] }), now), 90000);
eq('pulse null income', monthPulse(st({ income: null }), now), 0);

// streak
eq('streak all clean 30d', streak(st({}), now), 30);
eq('streak over today', streak(st({ spends: [mk(now, 3500)] }), now), 29);
eq('streak broken 3 days ago', streak(st({ spends: [mk(new Date(2026, 9, 27, 12), 4000)] }), now), 2 + 1);
eq('streak new user day 1', streak(st({ startedAt: now.getTime() }), now), 1);
eq('streak null income', streak(st({ income: null }), now), 0);
// across month boundary
const nov2 = new Date(2026, 10, 2, 10);
eq('streak across month', streak(st({}), nov2) >= 30, true);
// Plus: bills + savings
const plusSt = st({ plus: true, bills: [{ id: 'a', label: 'Rent', amount: 20000 }], savings: 10000 });
eq('spendable plus', spendable(plusSt), 63000);
eq('spendable free ignores bills', spendable({ ...plusSt, plus: false }), 93000);
eq('spendable floors at 0', spendable({ ...plusSt, savings: 999999 }), 0);
eq('pulse uses spendable', monthPulse(plusSt, now), 63000 / 31 > 0 ? Math.floor(63000 / 31) * 30 : 0);
eq('csv escapes', spendsToCsv([{ id: '1', amount: 5, label: 'a "b", c', category: 'food', ts: new Date(2026, 9, 2, 12).getTime() }]), 'date,amount,label,category\n2026-10-02,5,"a ""b"", c",food');
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
