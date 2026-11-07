import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RankedSlot } from '@/lib/matching';

export function SlotList({
  slots,
  groupSize,
  onSelect,
}: {
  slots: RankedSlot[];
  groupSize: number;
  onSelect: (slot: RankedSlot) => void;
}) {
  const theme = useTheme();

  if (slots.length === 0) return null;

  return (
    <View style={styles.list}>
      {slots.map((slot) => (
        <Pressable key={`${slot.start}-${slot.end}`} onPress={() => onSelect(slot)}>
          <ThemedView type="backgroundElement" style={styles.slot}>
            <View style={styles.row}>
              <ThemedText type="smallBold">
                {slot.start}–{slot.end}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.primary }}>
                {slot.memberCount}/{groupSize} Personen
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" type="small">
              {slot.durationMin} Minuten verfügbar
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  slot: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
