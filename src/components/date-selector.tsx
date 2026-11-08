import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Copy, accent, dateLabel, forest, line } from '@/components/campus';

export function DateSelector({ dates, value, onChange }: {
  dates: string[]; value: string; onChange: (date: string) => void;
}) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
    {dates.map((date) => <Pressable key={date} accessibilityRole="button"
      accessibilityLabel={dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}
      accessibilityState={{ selected: value === date }} onPress={() => onChange(date)}
      style={[styles.day, value === date && { borderColor: accent, backgroundColor: '#FBF2EB' }]}>
      <Copy tone="small">{dateLabel(date, { weekday: 'short' })}</Copy>
      <Copy tone="label" style={{ color: forest }}>{dateLabel(date, { day: '2-digit', month: '2-digit' })}</Copy>
    </Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  strip: { gap: 6 },
  day: { borderBottomWidth: 2, borderColor: line, minWidth: 58, padding: 8, alignItems: 'center', gap: 2 },
});
