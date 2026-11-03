import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState as RNAppState, Platform, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './src/theme';
import { AppState, Category, initialState, uid } from './src/logic';
import { loadState, saveState } from './src/storage';
import { ensurePermission, syncNotifications } from './src/notify';
import Onboarding from './src/Onboarding';
import Home from './src/Home';
import History from './src/History';
import Settings from './src/Settings';
import AddSheet from './src/AddSheet';
import { Press, success } from './src/ui';

type Tab = 'today' | 'history' | 'settings';

function Shell() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState<Tab>('today');
  const [adding, setAdding] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    loadState().then((s) => {
      hydrated.current = true;
      setState(s);
    });
  }, []);

  // persist + refresh notifications on every change
  useEffect(() => {
    if (!state || !hydrated.current) return;
    saveState(state);
    syncNotifications(state);
  }, [state]);

  // re-render at midnight / when the app returns to the foreground so "today" rolls over
  const [, force] = useState(0);
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (st) => {
      if (st === 'active') force((n) => n + 1);
    });
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => {
      sub.remove();
      clearInterval(t);
    };
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => (s ? fn(s) : s)), []);

  if (!state) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  if (state.income == null) {
    return (
      <Onboarding
        onDone={async (income) => {
          await ensurePermission();
          update((s) => ({ ...s, income, startedAt: Date.now() }));
        }}
      />
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'history', label: 'History' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {tab === 'today' && (
        <Home state={state} onDelete={(id) => update((s) => ({ ...s, spends: s.spends.filter((x) => x.id !== id) }))} />
      )}
      {tab === 'history' && <History state={state} />}
      {tab === 'settings' && (
        <Settings
          state={state}
          onIncome={(income) => update((s) => ({ ...s, income }))}
          onToggle={async (k, v) => {
            if (v) await ensurePermission();
            update((s) => ({ ...s, [k]: v }));
          }}
          onPatch={(p) => update((s) => ({ ...s, ...p }))}
          onReset={() => setState({ ...initialState(), income: null })}
        />
      )}

      {/* bottom bar */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: insets.bottom + 10, alignItems: 'center' }}
      >
        <Press
          testID="fab"
          onPress={() => setAdding(true)}
          style={{
            backgroundColor: C.lime,
            borderRadius: 30,
            paddingVertical: 16,
            paddingHorizontal: 30,
            marginBottom: 12,
            shadowColor: C.lime,
            shadowOpacity: 0.6,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 10,
          }}
        >
          <Text style={{ color: C.black, fontWeight: '900', fontSize: 16, letterSpacing: 0.3 }}>+  Add spend</Text>
        </Press>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(18,20,28,0.96)',
            borderRadius: 26,
            padding: 6,
            borderWidth: 1,
            borderColor: C.line,
            width: '88%',
            maxWidth: 400,
          }}
        >
          {tabs.map((t) => {
            const on = tab === t.key;
            return (
              <Press
                key={t.key}
                wrap={{ flex: 1 }}
                onPress={() => setTab(t.key)}
                style={{
                  paddingVertical: 11,
                  borderRadius: 20,
                  alignItems: 'center',
                  backgroundColor: on ? C.card2 : 'transparent',
                }}
              >
                <Text style={{ color: on ? C.lime : C.dim, fontWeight: '900', fontSize: 13 }}>{t.label}</Text>
              </Press>
            );
          })}
        </View>
      </View>

      <AddSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(amount, label, category: Category) => {
          update((s) => ({ ...s, spends: [...s.spends, { id: uid(), amount, label, category, ts: Date.now() }] }));
          setAdding(false);
          setTab('today');
          success();
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 480 : undefined, backgroundColor: C.bg }}>
          <Shell />
        </View>
      </View>
    </SafeAreaProvider>
  );
}
