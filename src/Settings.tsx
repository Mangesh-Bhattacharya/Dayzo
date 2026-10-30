import React, { useState } from 'react';
import { Platform, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';
import { AppState, dailyBudget, digits, inr } from './logic';
import { Label, Press } from './ui';

export default function Settings({
  state,
  onIncome,
  onToggle,
  onReset,
}: {
  state: AppState;
  onIncome: (n: number) => void;
  onToggle: (k: 'morning' | 'night', v: boolean) => void;
  onReset: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState(String(state.income ?? ''));
  const [confirm, setConfirm] = useState(false);
  const n = digits(raw);
  const changed = n > 0 && n !== state.income;

  const row = (title: string, sub: string, k: 'morning' | 'night') => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.line,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>{title}</Text>
        <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>{sub}</Text>
      </View>
      <Switch
        value={state[k]}
        onValueChange={(v) => onToggle(k, v)}
        trackColor={{ true: C.lime, false: C.line }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 14, paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: C.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>Settings</Text>

      <View style={{ marginTop: 22, marginBottom: 10 }}>
        <Label>Monthly income</Label>
      </View>
      <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: C.line }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: C.lime, fontSize: 26, fontWeight: '900' }}>{'₹'}</Text>
          <TextInput
            value={raw}
            onChangeText={(t) => setRaw(t.replace(/[^0-9]/g, '').slice(0, 9))}
            keyboardType="number-pad"
            style={{
              flex: 1,
              minWidth: 0,
              width: 0,
              color: C.text,
              fontSize: 26,
              fontWeight: '900',
              paddingLeft: 8,
              paddingVertical: 6,
              ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
            }}
          />
          <Press
            disabled={!changed}
            onPress={() => onIncome(n)}
            style={{ backgroundColor: C.lime, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16 }}
          >
            <Text style={{ color: C.black, fontWeight: '900' }}>Save</Text>
          </Press>
        </View>
        <Text style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>
          That is {inr(dailyBudget(n || (state.income ?? 0), new Date()))} per day this month.
        </Text>
      </View>

      <View style={{ marginTop: 26, marginBottom: 10 }}>
        <Label>Reminders</Label>
      </View>
      {row('Morning budget', 'Daily at 8:00 AM with your number', 'morning')}
      {row('Night check-in', 'Daily at 9:30 PM with today’s summary', 'night')}
      {Platform.OS === 'web' && (
        <Text style={{ color: C.dim, fontSize: 12 }}>Notifications work in the iOS and Android apps.</Text>
      )}

      <View style={{ marginTop: 26, marginBottom: 10 }}>
        <Label>Your data</Label>
      </View>
      <Text style={{ color: C.dim, fontSize: 13, lineHeight: 19, marginBottom: 12 }}>
        Dayzo stores everything on this device only. Nothing is uploaded, and there are no accounts.
      </Text>
      <Press
        onPress={() => {
          if (confirm) {
            setConfirm(false);
            onReset();
          } else setConfirm(true);
        }}
        style={{
          borderRadius: 18,
          paddingVertical: 15,
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: C.red,
          backgroundColor: confirm ? C.red : 'transparent',
        }}
      >
        <Text style={{ color: confirm ? C.black : C.red, fontWeight: '900' }}>
          {confirm ? 'Tap again to erase everything' : 'Reset all data'}
        </Text>
      </Press>
    </ScrollView>
  );
}
