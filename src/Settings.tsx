import React, { useState } from 'react';
import { Platform, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';
import { AppState, Bill, dailyBudget, digits, inr, spendable, spendsToCsv, uid } from './logic';
import { PLUS_PRICE_LABEL, canDevUnlock, paymentConfigured, startPurchase } from './plus';
import { shareText } from './share';
import { Label, Press } from './ui';

export default function Settings({
  state,
  onIncome,
  onToggle,
  onReset,
  onPatch,
}: {
  state: AppState;
  onIncome: (n: number) => void;
  onToggle: (k: 'morning' | 'night', v: boolean) => void;
  onReset: () => void;
  onPatch: (p: Partial<AppState>) => void;
}) {
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState(String(state.income ?? ''));
  const [confirm, setConfirm] = useState(false);
  const [billLabel, setBillLabel] = useState('');
  const [billAmt, setBillAmt] = useState('');
  const [saveRaw, setSaveRaw] = useState(String(state.savings || ''));
  const [note, setNote] = useState('');
  const addBill = () => {
    const amount = digits(billAmt);
    if (!amount) return;
    const b: Bill = { id: uid(), label: billLabel.trim() || 'Bill', amount };
    onPatch({ bills: [...state.bills, b] });
    setBillLabel('');
    setBillAmt('');
  };
  const inputStyle = {
    color: C.text,
    fontSize: 16,
    fontWeight: '800' as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: C.card2,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  };
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
        <Label color={C.lime}>Dayzo Plus</Label>
      </View>
      {!state.plus ? (
        <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: C.line }}>
          <Text style={{ color: C.text, fontWeight: '900', fontSize: 17 }}>Make the number smarter</Text>
          <Text style={{ color: C.dim, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
            Subtract rent and EMIs, set money aside for savings first, and export your spends as CSV. Your daily number then reflects what is really free to spend. {PLUS_PRICE_LABEL}, no subscription.
          </Text>
          <Press
            disabled={!paymentConfigured()}
            onPress={async () => setNote((await startPurchase()) ? 'After paying, reopen the app to unlock.' : 'Could not open the payment page.')}
            style={{ backgroundColor: C.lime, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 14 }}
          >
            <Text style={{ color: C.black, fontWeight: '900' }}>
              {paymentConfigured() ? `Unlock Plus  ·  ${PLUS_PRICE_LABEL}` : 'Payments not set up yet'}
            </Text>
          </Press>
          {canDevUnlock() && (
            <Press onPress={() => onPatch({ plus: true })} style={{ paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: C.dim, fontSize: 12 }}>Dev build only: unlock Plus for testing</Text>
            </Press>
          )}
          {!!note && <Text style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{note}</Text>}
        </View>
      ) : (
        <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: C.line }}>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 15 }}>Monthly bills</Text>
          {state.bills.map((b) => (
            <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ flex: 1, color: C.text }}>{b.label}</Text>
              <Text style={{ color: C.dim, marginRight: 14 }}>{inr(b.amount)}</Text>
              <Press onPress={() => onPatch({ bills: state.bills.filter((x) => x.id !== b.id) })}>
                <Text style={{ color: C.red, fontWeight: '900' }}>Remove</Text>
              </Press>
            </View>
          ))}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TextInput value={billLabel} onChangeText={setBillLabel} placeholder="Rent" placeholderTextColor={C.dim} style={{ ...inputStyle, flex: 1, marginRight: 8, minWidth: 0, width: 0 }} />
            <TextInput value={billAmt} onChangeText={(t) => setBillAmt(t.replace(/[^0-9]/g, '').slice(0, 9))} placeholder="Amount" placeholderTextColor={C.dim} keyboardType="number-pad" style={{ ...inputStyle, width: 100, marginRight: 8 }} />
            <Press onPress={addBill} style={{ backgroundColor: C.lime, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' }}>
              <Text style={{ color: C.black, fontWeight: '900' }}>Add</Text>
            </Press>
          </View>

          <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, marginTop: 18 }}>Save each month</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TextInput value={saveRaw} onChangeText={(t) => setSaveRaw(t.replace(/[^0-9]/g, '').slice(0, 9))} placeholder="0" placeholderTextColor={C.dim} keyboardType="number-pad" style={{ ...inputStyle, flex: 1, marginRight: 8, minWidth: 0, width: 0 }} />
            <Press onPress={() => onPatch({ savings: digits(saveRaw) })} style={{ backgroundColor: C.lime, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' }}>
              <Text style={{ color: C.black, fontWeight: '900' }}>Save</Text>
            </Press>
          </View>

          <Text style={{ color: C.lime, fontWeight: '900', marginTop: 14 }}>
            Free to spend: {inr(spendable(state))} a month, {inr(dailyBudget(spendable(state), new Date()))} a day
          </Text>

          <Press
            onPress={async () => setNote((await shareText(spendsToCsv(state.spends))) ? 'CSV copied to clipboard.' : '')}
            style={{ borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: C.lime, marginTop: 16 }}
          >
            <Text style={{ color: C.lime, fontWeight: '900' }}>Export spends as CSV</Text>
          </Press>
          {!!note && <Text style={{ color: C.dim, fontSize: 12, marginTop: 8 }}>{note}</Text>}
        </View>
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
