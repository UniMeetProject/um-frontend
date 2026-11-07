import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { StudentChip } from '@/components/student-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatLocalDate, todayLocal } from '@/lib/demo-dates';
import { useDemoData } from '@/lib/demo-state';
import type { AvailabilityInterval } from '@/lib/types';

const dateOffsets = [0, 1, 2];
const seededRanges = [
  ['09:00', '11:00'],
  ['13:00', '15:00'],
  ['16:30', '18:00'],
] as const;

export default function CreateGroupScreen() {
  const theme = useTheme();
  const { state, dispatch } = useDemoData();
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([state.currentUserId]);

  const selectableStudents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return state.students.filter(
      (student) =>
        student.id !== state.currentUserId &&
        (!normalized || student.name.toLowerCase().includes(normalized))
    );
  }, [search, state.students, state.currentUserId]);

  const canCreate = name.trim().length > 0 && memberIds.length > 1;

  function toggleMember(studentId: string) {
    if (studentId === state.currentUserId) return;
    setMemberIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  function createGroup() {
    if (!canCreate) return;

    const baseDate = todayLocal();
    const groupId = `g-${Date.now()}`;
    const group = {
      id: groupId,
      name: name.trim(),
      contextId: state.contexts[0]?.id ?? 'ctx-analysis',
      memberIds,
      createdAt: baseDate,
    };

    const seededAvailability: AvailabilityInterval[] = memberIds.flatMap((userId, memberIndex) =>
      dateOffsets.map((offset, offsetIndex) => {
        const date = new Date(`${baseDate}T00:00:00`);
        date.setDate(date.getDate() + offset);
        const range = seededRanges[(memberIndex + offsetIndex) % seededRanges.length];
        return {
          id: `seed-${groupId}-${userId}-${offset}`,
          userId,
          date: formatLocalDate(date),
          start: range[0],
          end: range[1],
        };
      })
    );

    dispatch({ type: 'group/create', group, seededAvailability });
    router.replace(`/group/${groupId}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Gruppe erstellen</ThemedText>

          <View style={styles.field}>
            <ThemedText type="smallBold">Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="z. B. Analysis Lerngruppe"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
              ]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Personen einladen</ThemedText>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Suchen"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
              ]}
            />
          </View>

          <View style={styles.chips}>
            {selectableStudents.map((student) => (
              <StudentChip
                key={student.id}
                student={student}
                selected={memberIds.includes(student.id)}
                onToggle={(item) => toggleMember(item.id)}
              />
            ))}
          </View>

          <PrimaryButton label="Erstellen" disabled={!canCreate} onPress={createGroup} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
