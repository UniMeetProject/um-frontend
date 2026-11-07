import { Pressable, StyleSheet } from 'react-native';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Group, Meeting, StudyContext } from '@/lib/types';

export function GroupCard({
  group,
  context,
  memberCount,
  meeting,
  onPress,
}: {
  group: Group;
  context: StudyContext;
  memberCount: number;
  meeting?: Meeting;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">{group.name}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {context.label} · {memberCount} Personen
        </ThemedText>
        {meeting ? (
          <ThemedText type="small">
            {formatDate(meeting.date)} · {meeting.start}–{meeting.end}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary" type="small">
            Kein Termin geplant
          </ThemedText>
        )}
        {meeting ? <StatusChip status={meeting.status} /> : null}
        <ThemedText type="linkPrimary" style={{ color: theme.primary }}>
          Details ansehen
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`));
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    gap: Spacing.two,
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.75,
  },
});
