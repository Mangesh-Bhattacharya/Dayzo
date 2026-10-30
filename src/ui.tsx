import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, Level, levelColor } from './theme';
import { inr } from './logic';

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};
export const success = () => {
  if (Platform.OS !== 'web')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

/** Pressable with a springy scale-down. */
export function Press({
  onPress,
  style,
  children,
  disabled,
  testID,
  wrap,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  disabled?: boolean;
  testID?: string;
  /** style for the outer Pressable (layout such as flex) */
  wrap?: StyleProp<ViewStyle>;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(s, { toValue: v, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      testID={testID}
      style={wrap}
      disabled={disabled}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      onPress={() => {
        tap();
        onPress?.();
      }}
    >
      <Animated.View style={[style, { transform: [{ scale: s }], opacity: disabled ? 0.4 : 1 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/** Number that counts toward its target value. */
export function AnimatedMoney({
  value,
  style,
  duration = 650,
}: {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
}) {
  const anim = useRef(new Animated.Value(value)).current;
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(v));
    return () => anim.removeListener(id);
  }, [anim]);
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, duration, anim]);
  return <Text style={style}>{inr(shown)}</Text>;
}

/** Progress bar that fills with spend and shifts color by level. */
export function Meter({ ratio, level }: { ratio: number; level: Level }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, {
      toValue: Math.min(Math.max(ratio, 0), 1),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [ratio, w]);
  const color = levelColor(level);
  return (
    <View
      style={{
        height: 12,
        borderRadius: 8,
        backgroundColor: C.card2,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: 12,
          borderRadius: 8,
          backgroundColor: color,
          width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          shadowColor: color,
          shadowOpacity: 0.9,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
}

/** A little face drawn with views (no emoji fonts needed). */
export function Mood({ level, size = 76 }: { level: Level; size?: number }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const color = levelColor(level);
  const u = size / 76;
  const eye = (left: number) => (
    <View
      key={left}
      style={{
        position: 'absolute',
        top: 24 * u,
        left,
        width: 9 * u,
        height: level === 'bad' ? 14 * u : 9 * u,
        borderRadius: 8 * u,
        backgroundColor: C.black,
      }}
    />
  );

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 0.7,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
        transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
      }}
    >
      {level === 'good' ? (
        <>
          {/* sunglasses */}
          <View style={{ position: 'absolute', top: 22 * u, left: 10 * u, width: 24 * u, height: 14 * u, borderRadius: 6 * u, backgroundColor: C.black }} />
          <View style={{ position: 'absolute', top: 22 * u, right: 10 * u, width: 24 * u, height: 14 * u, borderRadius: 6 * u, backgroundColor: C.black }} />
          <View style={{ position: 'absolute', top: 25 * u, left: 33 * u, width: 10 * u, height: 3 * u, backgroundColor: C.black }} />
        </>
      ) : (
        <>
          {eye(22 * u)}
          {eye(45 * u)}
        </>
      )}
      {level === 'good' && (
        <View
          style={{
            position: 'absolute',
            top: 40 * u,
            left: 20 * u,
            width: 36 * u,
            height: 18 * u,
            borderBottomLeftRadius: 18 * u,
            borderBottomRightRadius: 18 * u,
            borderBottomWidth: 4 * u,
            borderLeftWidth: 4 * u,
            borderRightWidth: 4 * u,
            borderColor: C.black,
          }}
        />
      )}
      {level === 'warn' && (
        <>
          <View style={{ position: 'absolute', top: 50 * u, left: 24 * u, width: 28 * u, height: 4 * u, borderRadius: 3 * u, backgroundColor: C.black }} />
          {/* sweat drop */}
          <View
            style={{
              position: 'absolute',
              top: 8 * u,
              right: 6 * u,
              width: 10 * u,
              height: 14 * u,
              borderRadius: 8 * u,
              backgroundColor: '#8FD3FF',
            }}
          />
        </>
      )}
      {level === 'bad' && (
        <View
          style={{
            position: 'absolute',
            top: 48 * u,
            left: 22 * u,
            width: 32 * u,
            height: 16 * u,
            borderTopLeftRadius: 16 * u,
            borderTopRightRadius: 16 * u,
            borderTopWidth: 4 * u,
            borderLeftWidth: 4 * u,
            borderRightWidth: 4 * u,
            borderColor: C.black,
          }}
        />
      )}
    </Animated.View>
  );
}

export function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <Text
      style={{
        color: color ?? C.dim,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.6,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  testID,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Press
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: C.lime,
        borderRadius: 18,
        paddingVertical: 17,
        alignItems: 'center',
        shadowColor: C.lime,
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Text style={{ color: C.black, fontSize: 17, fontWeight: '900', letterSpacing: 0.3 }}>{title}</Text>
    </Press>
  );
}
