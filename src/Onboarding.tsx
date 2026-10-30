import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';
import { dailyBudget, digits, inr } from './logic';
import { Label, Press, PrimaryButton } from './ui';

const PRESETS = [30000, 50000, 100000];

export default function Onboarding({ onDone }: { onDone: (income: number) => void }) {
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState('');
  const income = digits(raw);
  const perDay = income > 0 ? dailyBudget(income, new Date()) : 0;
  const days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: C.lime, fontSize: 15, fontWeight: '900', letterSpacing: 3 }}>DAYZO</Text>
        <Text style={{ color: C.text, fontSize: 40, fontWeight: '900', letterSpacing: -1.2, marginTop: 14, lineHeight: 44 }}>
          One number.{'\n'}Every single day.
        </Text>
        <Text style={{ color: C.dim, fontSize: 16, marginTop: 12, lineHeight: 23 }}>
          Tell us what you earn in a month. We turn it into a daily budget you can actually feel.
        </Text>

        <View style={{ marginTop: 34 }}>
          <Label>Monthly income</Label>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: C.card,
              borderColor: income > 0 ? C.lime : C.line,
              borderWidth: 1.5,
              borderRadius: 20,
              paddingHorizontal: 18,
              marginTop: 10,
            }}
          >
            <Text style={{ color: C.lime, fontSize: 34, fontWeight: '900' }}>{'₹'}</Text>
            <TextInput
              testID="income-input"
              value={raw}
              onChangeText={(t) => setRaw(t.replace(/[^0-9]/g, '').slice(0, 9))}
              keyboardType="number-pad"
              placeholder="1,00,000"
              placeholderTextColor="#3A3F52"
              style={{
                flex: 1,
                minWidth: 0,
                width: 0,
                color: C.text,
                fontSize: 34,
                fontWeight: '900',
                paddingVertical: 18,
                paddingLeft: 8,
                ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            {PRESETS.map((p) => (
              <Press
                key={p}
                onPress={() => setRaw(String(p))}
                style={{
                  backgroundColor: C.card2,
                  borderRadius: 14,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: C.line,
                }}
              >
                <Text style={{ color: C.text, fontWeight: '800' }}>{inr(p)}</Text>
              </Press>
            ))}
          </View>
        </View>

        <View
          style={{
            marginTop: 28,
            backgroundColor: C.card,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <Label>Your daily budget</Label>
          <Text
            style={{
              color: perDay > 0 ? C.lime : '#2C3144',
              fontSize: 54,
              fontWeight: '900',
              letterSpacing: -2,
              marginTop: 6,
            }}
          >
            {inr(perDay)}
            <Text style={{ fontSize: 20, color: C.dim, letterSpacing: 0 }}> / day</Text>
          </Text>
          <Text style={{ color: C.dim, fontSize: 13, marginTop: 4 }}>
            {income > 0 ? `${inr(income)} ÷ ${days} days this month` : 'Enter your income to see it'}
          </Text>
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />
        <PrimaryButton title="Start my first day" disabled={income <= 0} onPress={() => onDone(income)} testID="start-btn" />
        <Text style={{ color: C.dim, fontSize: 12, textAlign: 'center', marginTop: 14 }}>
          Everything stays on your phone. No sign-up, no ads.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
