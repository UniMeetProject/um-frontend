import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoData } from '@/lib/demo-state';

export default function MeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useDemoData();
  const meeting = state.meetings.find((item) => item.id === id);

  if (!meeting) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content}>
          <ThemedText type="subtitle">Termin nicht gefunden</ThemedText>
          <PrimaryButton label="Zurück zu Gruppen" onPress={() => router.replace('/')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const group = state.groups.find((item) => item.id === meeting.groupId);
  const attendees = state.students.filter((student) => group?.memberIds.includes(student.id));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText type="subtitle">Lerntreffen</ThemedText>
          <StatusChip status={meeting.status} />
        </View>

        <ThemedText themeColor="textSecondary">{group?.name ?? 'Lerngruppe'}</ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold">Zeit</ThemedText>
          <ThemedText>
            {new Intl.DateTimeFormat('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }).format(new Date(`${meeting.date}T00:00:00`))}
          </ThemedText>
          <ThemedText>{meeting.start}–{meeting.end} Uhr</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Ort</ThemedText>
          <ThemedText>{meeting.location}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Teilnehmer</ThemedText>
          {attendees.map((attendee) => (
            <ThemedText key={attendee.id}>{attendee.name}</ThemedText>
          ))}
        </View>

        <PrimaryButton
          label="Annehmen"
          disabled={meeting.status === 'confirmed'}
          onPress={() => dispatch({ type: 'meeting/setStatus', meetingId: meeting.id, status: 'confirmed' })}
        />
        <PrimaryButton
          label="Verschieben"
          onPress={() => router.push(`/group/${meeting.groupId}/compare?date=${meeting.date}`)}
        />
        <PrimaryButton
          label="Absagen"
          disabled={meeting.status === 'cancelled'}
          onPress={() => dispatch({ type: 'meeting/setStatus', meetingId: meeting.id, status: 'cancelled' })}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { gap: Spacing.two },
});
