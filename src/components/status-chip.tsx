import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MeetingStatus } from '@/lib/types';

const labels: Record<MeetingStatus, string> = {
  proposed: 'Vorgeschlagen',
  confirmed: 'Bestätigt',
  changed: 'Verschoben',
  cancelled: 'Abgesagt',
};

export function StatusChip({ status }: { status: MeetingStatus }) {
  const theme = useTheme();
  const warning = status === 'changed';
  const danger = status === 'cancelled';
  const backgroundColor = danger
    ? theme.dangerBackground
    : warning
      ? theme.warningBackground
      : theme.backgroundSelected;
  const color = danger ? theme.danger : warning ? theme.warning : theme.primary;

  return (
    <ThemedView style={[styles.chip, { backgroundColor }]}>
      <ThemedText type="smallBold" style={{ color }}>
        {labels[status]}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
