import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSelector } from '@/components/date-selector';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SlotList } from '@/components/slot-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { availabilityForGroup, useDemoData } from '@/lib/demo-state';
import { upcomingDates, todayLocal } from '@/lib/demo-dates';
import { findCommonSlots, countMembersPerBlock, type RankedSlot } from '@/lib/matching';
import { useTheme } from '@/hooks/use-theme';

export default function CompareScreen() {
  const { id, date: initialDate } = useLocalSearchParams<{ id: string; date?: string }>();
  const { state, dispatch } = useDemoData();
  const theme = useTheme();
  const group = state.groups.find((item) => item.id === id);
  const baseDates = useMemo(() => upcomingDates(todayLocal(), 3), []);
  const [date, setDate] = useState(initialDate ?? baseDates[0]);
  const [minMembers, setMinMembers] = useState(1);

  const availability = useMemo(
    () => (group ? availabilityForGroup(state.availability, group, date) : []),
    [date, group, state.availability]
  );
  const slots = useMemo(
    () => (group ? findCommonSlots(state.availability, group.memberIds, date, minMembers) : []),
    [date, group, minMembers, state.availability]
  );
  const coverage = useMemo(() => countMembersPerBlock(availability), [availability]);

  if (!group) return null;

  const coverageColors = [
    theme.coverage0,
    theme.coverage1,
    theme.coverage2,
    theme.coverage3,
    theme.coverage4,
  ];

  function selectSlot(slot: RankedSlot) {
    if (!group) return;
    const meetingId = `m-${Date.now()}`;
    dispatch({
      type: 'meeting/create',
      meeting: {
        id: meetingId,
        groupId: group.id,
        date,
        start: slot.start,
        end: slot.end,
        location: 'Campus Bibliothek',
        status: 'proposed',
      },
    });
    router.push(`/meeting/${meetingId}`);
  }

  if (availability.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyWrapper}>
            <DateSelector dates={baseDates} value={date} onChange={setDate} />
            <View style={styles.emptyContent}>
              <EmptyState
                title="Keine Verfügbarkeit eingetragen"
                message="Trage zuerst deine Zeiten ein, bevor du die Gruppe vergleichst."
                actionLabel="Verfügbarkeit eintragen"
                onAction={() => router.push(`/group/${group.id}/availability`)}
              />
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Verfügbarkeiten vergleichen</ThemedText>
          <DateSelector dates={baseDates} value={date} onChange={setDate} />

          <View style={styles.threshold}>
            <ThemedText type="smallBold">Mindestens {minMembers} Personen</ThemedText>
            <View style={styles.thresholdButtons}>
              <PrimaryButton label="−" onPress={() => setMinMembers((value) => Math.max(1, value - 1))} />
              <PrimaryButton
                label="+"
                onPress={() => setMinMembers((value) => Math.min(group.memberIds.length, value + 1))}
              />
            </View>
          </View>

          <ThemedView type="backgroundElement" style={styles.coverage}>
            {Array.from({ length: 48 }, (_, block) => {
              const count = coverage.get(block)?.size ?? 0;
              const level = Math.min(4, count);
              return (
                <View
                  key={block}
                  style={[
                    styles.coverageCell,
                    { backgroundColor: coverageColors[level] },
                  ]}
                />
              );
            })}
            <ThemedText type="small" themeColor="textSecondary">
              08:00 – 20:00
            </ThemedText>
          </ThemedView>

          {slots.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              Für dieses Datum gibt es keinen gemeinsamen Zeitraum. Erweitere das Datum oder senke den Personenschwellenwert.
            </ThemedText>
          ) : (
            <>
              <ThemedText type="smallBold">Empfohlene Zeitfenster</ThemedText>
              <SlotList slots={slots} groupSize={group.memberIds.length} onSelect={selectSlot} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  emptyWrapper: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  emptyContent: { flex: 1 },
  threshold: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thresholdButtons: { flexDirection: 'row', gap: Spacing.two },
  coverage: { borderRadius: 18, padding: Spacing.two, gap: Spacing.one },
  coverageCell: { minHeight: 22, borderRadius: 6 },
});
