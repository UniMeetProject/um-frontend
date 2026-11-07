import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Student } from '@/lib/types';

export function StudentChip({
  student,
  selected,
  onToggle,
}: {
  student: Student;
  selected: boolean;
  onToggle: (student: Student) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => onToggle(student)}>
      <ThemedView
        type={selected ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.chip, selected && { borderColor: theme.primary }]}>
        <ThemedText type="smallBold">{student.initials}</ThemedText>
        <ThemedText type="small" numberOfLines={1}>
          {student.name}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 104,
    padding: Spacing.two,
    gap: Spacing.one,
  },
});
