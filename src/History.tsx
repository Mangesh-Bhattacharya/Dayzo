import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';
import { AppState, CATEGORIES, dailyBudget, inr, spendsOn, streak, sum, spendable } from './logic';
import { Label } from './ui';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const BAR_H = 130;

export default function History({ state }: { state: AppState }) {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const income = spendable(state);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (13 - i));
    const spent = sum(spendsOn(state.spends, d));
    return { d, spent, budget: dailyBudget(income, d) };
  });
  const maxV = Math.max(...days.map((x) => Math.max(x.spent, x.budget)), 1);

  // category split for the current month
  const monthSpends = state.spends.filter((s) => {
    const d = new Date(s.ts);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = sum(monthSpends);
  const split = CATEGORIES.map((c) => ({
    ...c,
    total: sum(monthSpends.filter((s) => s.category === c.key)),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const underDays = days.filter((x) => x.spent <= x.budget).length;

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 14, paddingBottom: 130 }}>
      <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>History</Text>
      <Text style={{ color: C.dim, marginTop: 4 }}>Last 14 days. Bars above the line mean over budget.</Text>

      <View style={{ backgroundColor: C.card, borderRadius: 28, padding: 18, marginTop: 18, borderWidth: 1, borderColor: C.line }}>
        <View style={{ height: BAR_H + 6, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {/* budget line */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: (days[days.length - 1].budget / maxV) * BAR_H,
              borderTopWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#4A5068',
            }}
          />
          {days.map((x, i) => {
            const h = Math.max((x.spent / maxV) * BAR_H, x.spent > 0 ? 6 : 3);
            const over = x.spent > x.budget;
            const isToday = i === days.length - 1;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: 14,
                    height: h,
                    borderRadius: 7,
                    backgroundColor: x.spent === 0 ? C.line : over ? C.red : C.lime,
                    opacity: isToday ? 1 : 0.85,
                  }}
                />
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {days.map((x, i) => (
            <Text
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                color: i === days.length - 1 ? C.lime : C.dim,
                fontSize: 10,
                fontWeight: '800',
              }}
            >
              {DOW[x.d.getDay()]}
            </Text>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: C.line }}>
          <Label>Days under</Label>
          <Text style={{ color: C.lime, fontSize: 26, fontWeight: '900', marginTop: 6 }}>
            {underDays}
            <Text style={{ color: C.dim, fontSize: 14 }}> / 14</Text>
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: C.line }}>
          <Label>Best streak now</Label>
          <Text style={{ color: C.text, fontSize: 26, fontWeight: '900', marginTop: 6 }}>{streak(state, now)}</Text>
        </View>
      </View>

      <View style={{ marginTop: 26, marginBottom: 12 }}>
        <Label>This month by category</Label>
      </View>
      {split.length === 0 ? (
        <Text style={{ color: C.dim }}>Log a spend and it shows up here.</Text>
      ) : (
        split.map((c) => (
          <View key={c.key} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: C.text, fontWeight: '800' }}>{c.label}</Text>
              <Text style={{ color: C.dim, fontWeight: '700' }}>{inr(c.total)}</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: C.card2, overflow: 'hidden' }}>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: c.color, width: `${(c.total / monthTotal) * 100}%` }} />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
