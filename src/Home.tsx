import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, levelColor } from './theme';
import { AppState, catOf, dailyBudget, dayKey, headline, inr, levelFor, monthPulse, spendsOn, streak, sum } from './logic';
import { AnimatedMoney, Label, Meter, Mood, Press } from './ui';
import { shareText } from './share';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Home({
  state,
  onDelete,
}: {
  state: AppState;
  onDelete: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const now = new Date();
  const budget = dailyBudget(state.income ?? 0, now);
  const todayKey = dayKey(now);
  // keyed on the date too, so the list refreshes when midnight passes
  const today = useMemo(
    () => spendsOn(state.spends, now).sort((a, b) => b.ts - a.ts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.spends, todayKey],
  );
  const spent = sum(today);
  const remaining = budget - spent;
  const level = levelFor(spent, budget);
  const color = levelColor(level);
  const pulse = monthPulse(state, now);
  const run = streak(state, now);
  const [shareNote, setShareNote] = useState('Share my day');
  const onShare = async () => {
    const line =
      remaining >= 0
        ? `${inr(remaining)} left of my ${inr(budget)} daily budget today`
        : `I'm ${inr(-remaining)} over my ${inr(budget)} daily budget today`;
    const copied = await shareText(`${line}${run > 0 ? `, and a ${run}-day streak under budget` : ''}. Tracking it with Dayzo.`);
    setShareNote(copied ? 'Copied to clipboard' : 'Share my day');
    if (copied) setTimeout(() => setShareNote('Share my day'), 2000);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 22, paddingTop: insets.top + 14, paddingBottom: 150 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: C.lime, fontSize: 14, fontWeight: '900', letterSpacing: 3 }}>DAYZO</Text>
        <View
          style={{
            backgroundColor: '#1E1840',
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#33297A',
          }}
        >
          <Text style={{ color: '#B7A4FF', fontWeight: '900', fontSize: 12, letterSpacing: 1 }}>
            DAY {now.getDate()} {'·'} {MONTHS[now.getMonth()].toUpperCase()}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: C.card,
          borderRadius: 30,
          padding: 22,
          borderWidth: 1,
          borderColor: C.line,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label>Today's budget</Label>
          <Text style={{ color: C.dim, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>
            SPENT{'  '}
            <Text style={{ color: spent > 0 ? C.red : C.dim }}>{spent > 0 ? `-${inr(spent)}` : inr(0)}</Text>
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <AnimatedMoney
            value={remaining}
            style={{
              color,
              fontSize: 58,
              fontWeight: '900',
              letterSpacing: -2.5,
              textShadowColor: color,
              textShadowRadius: 18,
              textShadowOffset: { width: 0, height: 0 },
            }}
          />
          <Mood level={level} size={64} />
        </View>

        <View style={{ marginTop: 14 }}>
          <Meter ratio={budget > 0 ? spent / budget : 1} level={level} />
        </View>
        <Text style={{ color: C.text, fontSize: 15, fontWeight: '800', marginTop: 14 }}>
          {headline(level, remaining, spent)}
          <Text style={{ color: C.dim, fontWeight: '600' }}>{'  '}of {inr(budget)} today</Text>
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: C.line }}>
          <Label>Month pulse</Label>
          <Text style={{ color: pulse >= 0 ? C.lime : C.red, fontSize: 24, fontWeight: '900', marginTop: 6, letterSpacing: -0.8 }}>
            {pulse >= 0 ? '+' : ''}
            {inr(pulse)}
          </Text>
          <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>{pulse >= 0 ? 'ahead of plan' : 'behind plan'}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: C.line }}>
          <Label>Streak</Label>
          <Text style={{ color: C.text, fontSize: 24, fontWeight: '900', marginTop: 6, letterSpacing: -0.8 }}>
            {run} <Text style={{ fontSize: 14, color: C.dim }}>{run === 1 ? 'day' : 'days'}</Text>
          </Text>
          <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>under budget</Text>
        </View>
      </View>

      <Press
        testID="share-btn"
        onPress={onShare}
        style={{
          marginTop: 12,
          borderRadius: 18,
          paddingVertical: 13,
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: C.line,
          backgroundColor: C.card,
        }}
      >
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 14 }}>{shareNote}</Text>
      </Press>

      <View style={{ marginTop: 26, marginBottom: 10 }}>
        <Label>Today's transactions</Label>
      </View>

      {today.length === 0 ? (
        <View
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: C.line,
            borderRadius: 22,
            padding: 26,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: C.dim, fontSize: 15, fontWeight: '600' }}>No spends yet. Easy.</Text>
        </View>
      ) : (
        today.map((s) => {
          const c = catOf(s.category);
          return (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: C.card,
                borderRadius: 20,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: C.line,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: c.color + '26',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: c.color, fontWeight: '900', fontSize: 16 }}>{c.glyph}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }} numberOfLines={1}>
                  {s.label}
                </Text>
                <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>{c.label}</Text>
              </View>
              <Text style={{ color: C.red, fontSize: 17, fontWeight: '900' }}>-{inr(s.amount)}</Text>
              <Press
                onPress={() => onDelete(s.id)}
                style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: C.dim, fontWeight: '900', fontSize: 14 }}>{'×'}</Text>
              </Press>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
