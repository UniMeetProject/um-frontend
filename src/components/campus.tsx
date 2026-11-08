import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Student } from '@/lib/types';

export const ink = '#29392F';
export const muted = '#6F6A5F';
export const paper = '#FFFEFC';
export const line = '#E9E4D9';
export const forest = '#2F593D';
export const accent = '#BB4723';
const displayFont = Platform.OS === 'android' ? 'serif' : 'Georgia';

const paths = {
  groups: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4 M13 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  calendar: 'M8 3v4m8-4v4M3 10h18 M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  back: 'M20 12H5m6-6-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 7v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  pin: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  book: 'M12 6c-3-3-6-3-10-2v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 2v15',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
};

type IconName = keyof typeof paths;

export function Icon({ name, color = forest, size = 20 }: { name: IconName; color?: string; size?: number }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${paths[name]}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return <Image accessible={false} source={{ uri: `data:image/svg+xml,${encodeURIComponent(svg)}` }} style={{ width: size, height: size }} />;
}

export function Copy({ tone = 'body', style, ...props }: TextProps & { tone?: keyof typeof typography }) {
  return <Text {...props} style={[typography[tone], style]} />;
}

const typography = StyleSheet.create({
  title: { color: ink, fontFamily: displayFont, fontSize: 37, fontWeight: '700', letterSpacing: -0.7, lineHeight: 43 },
  heading: { color: ink, fontFamily: displayFont, fontSize: 25, fontWeight: '700', letterSpacing: -0.3 },
  label: { color: ink, fontSize: 16, fontWeight: '700' },
  body: { color: muted, fontSize: 15, lineHeight: 22 },
  small: { color: muted, fontSize: 13, lineHeight: 18 },
  eyebrow: { color: forest, fontSize: 11, fontWeight: '800', letterSpacing: 1.6 },
});

export function Page({ children, back, wide, tab, footer }: {
  children: ReactNode; back?: Href; wide?: boolean; tab?: boolean; footer?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={tab ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.page, wide && styles.wide]}>
        {back && <Button label="Zurück" icon="back" variant="quiet" style={{ alignSelf: 'flex-start' }}
          onPress={() => router.canGoBack() ? router.back() : router.replace(back)} />}
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}><View style={styles.footerInner}>{footer}</View></View>}
    </SafeAreaView>
  );
}

export function Intro({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return <View style={{ gap: 7 }}>
    <Copy tone="eyebrow">{kicker}</Copy>
    <Copy accessibilityRole="header" tone="title">{title}</Copy>
    {description && <Copy>{description}</Copy>}
  </View>;
}

export function Panel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Button({ label, onPress, icon, variant = 'primary', disabled, selected, style }: {
  label: string; onPress: () => void; icon?: IconName; variant?: 'primary' | 'quiet' | 'danger';
  disabled?: boolean; selected?: boolean; style?: ViewStyle;
}) {
  const primary = variant === 'primary';
  const color = primary ? '#FFFFFF' : selected ? accent : variant === 'danger' ? '#A33027' : ink;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
      onPress={onPress} style={({ pressed, hovered }) => [styles.button,
        { backgroundColor: primary ? accent : selected ? '#FBF0E7' : '#FFFFFF', borderColor: selected ? accent : line, opacity: disabled ? 0.5 : pressed ? 0.65 : hovered ? 0.84 : 1 },
        style,
      ]}>
      {icon && <Icon name={icon} color={color} size={17} />}
      <Copy tone="label" style={{ color, fontSize: 14, flexShrink: 1, textAlign: 'center' }}>{label}</Copy>
    </Pressable>
  );
}

const avatarColors = ['#DFEBC6', '#F6DCBC', '#E5DBF1', '#D8E9EB', '#F4DFDF'];

export function Avatar({ student, size = 36 }: { student: Student; size?: number }) {
  const colorIndex = [...student.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
  return <View style={[styles.avatar, { width: size, height: size, backgroundColor: avatarColors[colorIndex] }]}>
    <Copy tone="label" style={{ fontSize: size > 50 ? 24 : 11 }}>{student.initials}</Copy>
  </View>;
}

export function Row({ children, onPress, label }: { children: ReactNode; onPress?: () => void; label?: string }) {
  if (!onPress) return <View style={styles.row}>{children}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed, hovered }) => [styles.row, { opacity: pressed ? 0.55 : hovered ? 0.8 : 1 }]}>
    {children}<Icon name="arrow" size={17} />
  </Pressable>;
}

export function dateLabel(date: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('de-DE', options).format(new Date(`${date}T12:00:00`));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: paper },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 22, paddingBottom: 32, gap: 22 },
  wide: { maxWidth: 1060 },
  panel: { backgroundColor: '#FFFFFF', borderColor: line, borderWidth: 1, borderRadius: 16, padding: 17, gap: 12 },
  button: { minHeight: 46, borderRadius: 24, paddingHorizontal: 17, paddingVertical: 10, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(37,61,44,0.09)' },
  avatar: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  footer: { backgroundColor: paper, borderTopWidth: 1, borderColor: line, paddingHorizontal: 22, paddingVertical: 12 },
  footerInner: { width: '100%', maxWidth: 716, alignSelf: 'center', gap: 8 },
});
