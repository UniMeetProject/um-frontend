import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityGrid, draftsToBlocks, type AvailabilityDraft } from '@/components/availability-grid';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoData } from '@/lib/demo-state';
import { upcomingDates, todayLocal } from '@/lib/demo-dates';

export default function AvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useDemoData();
  const group = state.groups.find((item) => item.id === id);
  const baseDates = useMemo(() => upcomingDates(todayLocal(), 3), []);
  const [date, setDate] = useState(baseDates[0]);

  const initialDrafts = useMemo<AvailabilityDraft[]>(() => {
    if (!group) return [];
    return state.availability
      .filter(
        (item) => item.userId === state.currentUserId && item.date === date && group.memberIds.includes(item.userId)
      )
      .map(({ start, end }) => ({ start, end }));
  }, [date, group, state.availability, state.currentUserId]);

  const [drafts, setDrafts] = useState<AvailabilityDraft[]>(initialDrafts);

  if (!group) return null;

  function changeDate(nextDate: string) {
    setDate(nextDate);
    const nextDrafts = state.availability
      .filter(
        (item) => item.userId === state.currentUserId && item.date === nextDate && group?.memberIds.includes(item.userId)
      )
      .map(({ start, end }) => ({ start, end }));
    setDrafts(nextDrafts);
  }

  function save() {
    if (!group) return;
    const validDrafts = drafts.filter((item) => draftsToBlocks([item]).size > 0);
    dispatch({
      type: 'availability/set',
      userId: state.currentUserId,
      date,
      intervals: validDrafts,
    });
    router.push(`/group/${group.id}/compare?date=${date}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Verfügbarkeit eintragen</ThemedText>
          <ThemedText themeColor="textSecondary">{group.name}</ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
            {baseDates.map((item) => (
              <PrimaryButton
                key={item}
                label={item}
                disabled={item === date}
                onPress={() => changeDate(item)}
              />
            ))}
          </ScrollView>

          <AvailabilityGrid value={drafts} onChange={setDrafts} />
          <PrimaryButton label="Speichern" onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  dates: { gap: Spacing.two },
});
