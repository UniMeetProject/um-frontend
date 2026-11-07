import { router, useLocalSearchParams, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { meetingsForGroup, useDemoData } from '@/lib/demo-state';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useDemoData();
  const group = state.groups.find((item) => item.id === id);

  if (!group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content}>
          <ThemedText type="subtitle">Gruppe nicht gefunden</ThemedText>
          <PrimaryButton label="Zurück zu Gruppen" onPress={() => router.replace('/')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const context = state.contexts.find((item) => item.id === group.contextId);
  const members = state.students.filter((student) => group.memberIds.includes(student.id));
  const meetings = meetingsForGroup(state.meetings, group.id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="subtitle">{group.name}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {context?.label ?? 'Lerngruppe'} · {members.length} Personen
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold">Mitglieder</ThemedText>
          {members.map((member) => (
            <ThemedText key={member.id} type="small">
              {member.name}
            </ThemedText>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Termine</ThemedText>
          {meetings.length === 0 ? (
            <ThemedText themeColor="textSecondary">Noch kein Termin geplant.</ThemedText>
          ) : (
            meetings.map((meeting) => (
              <View key={meeting.id} style={styles.meetingRow}>
                <ThemedText type="small">
                  {meeting.date} · {meeting.start}–{meeting.end}
                </ThemedText>
                <StatusChip status={meeting.status} />
              </View>
            ))
          )}
        </View>

        <PrimaryButton
          label="Verfügbarkeit eintragen"
          onPress={() => router.push(`/group/${group.id}/availability` as Href)}
        />
        <PrimaryButton
          label="Verfügbarkeiten vergleichen"
          onPress={() => router.push(`/group/${group.id}/compare` as Href)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  section: { gap: Spacing.two },
  meetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
