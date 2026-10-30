import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';
import { CATEGORIES, Category, QUICK_ADDS, digits, inr } from './logic';
import { Label, Press, PrimaryButton } from './ui';

export default function AddSheet({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (amount: number, label: string, category: Category) => void;
}) {
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState('');
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState<Category>('food');

  useEffect(() => {
    if (visible) {
      setRaw('');
      setLabel('');
      setCat('food');
    }
  }, [visible]);

  const amount = digits(raw);
  const canAdd = amount > 0;

  const submit = () => {
    if (!canAdd) return;
    onAdd(amount, label.trim() || CATEGORIES.find((c) => c.key === cat)!.label, cat);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose} />
        <View
          style={{
            backgroundColor: C.card,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: insets.bottom + 18,
            borderTopWidth: 1,
            borderColor: C.line,
            maxHeight: '88%',
          }}
        >
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, marginBottom: 16 }} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Label>New spend</Label>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: C.lime, fontSize: 46, fontWeight: '900' }}>{'₹'}</Text>
              <TextInput
                testID="amount-input"
                autoFocus
                value={raw}
                onChangeText={(t) => setRaw(t.replace(/[^0-9]/g, '').slice(0, 7))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#3A3F52"
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: 0,
                  color: C.text,
                  fontSize: 46,
                  fontWeight: '900',
                  letterSpacing: -1.5,
                  paddingVertical: 4,
                  paddingLeft: 6,
                  ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
                }}
              />
            </View>

            <Text style={{ color: C.dim, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 8 }}>QUICK ADD</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {QUICK_ADDS.map((q) => (
                <Press
                  key={q.label}
                  onPress={() => {
                    setRaw(String(q.amount));
                    setLabel(q.label);
                    setCat(q.category);
                  }}
                  style={{
                    backgroundColor: C.card2,
                    borderRadius: 14,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: C.line,
                  }}
                >
                  <Text style={{ color: C.text, fontWeight: '800' }}>
                    {q.label} <Text style={{ color: C.dim }}>{inr(q.amount)}</Text>
                  </Text>
                </Press>
              ))}
            </View>

            <TextInput
              testID="label-input"
              value={label}
              onChangeText={setLabel}
              placeholder="What was it?"
              placeholderTextColor="#4A5068"
              maxLength={40}
              style={{
                color: C.text,
                backgroundColor: C.card2,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                fontWeight: '600',
                marginTop: 16,
                borderWidth: 1,
                borderColor: C.line,
                ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
              }}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 20 }}>
              {CATEGORIES.map((c) => {
                const on = c.key === cat;
                return (
                  <Press
                    key={c.key}
                    onPress={() => setCat(c.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      backgroundColor: on ? c.color : C.card2,
                      borderWidth: 1,
                      borderColor: on ? c.color : C.line,
                    }}
                  >
                    <Text style={{ color: on ? C.black : c.color, fontWeight: '900', marginRight: 6 }}>{c.glyph}</Text>
                    <Text style={{ color: on ? C.black : C.text, fontWeight: '700', fontSize: 13 }}>{c.label}</Text>
                  </Press>
                );
              })}
            </View>

            <PrimaryButton title={canAdd ? `Add ${inr(amount)}` : 'Enter an amount'} disabled={!canAdd} onPress={submit} testID="add-btn" />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
