import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { GroupCard } from '@/components/group-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoData } from '@/lib/demo-state';

export default function GroupsScreen() {
  const { state } = useDemoData();

  const groups = state.groups.map((group) => {
    const meetings = state.meetings
      .filter((meeting) => meeting.groupId === group.id)
      .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
    return {
      group,
      context: state.contexts.find((context) => context.id === group.contextId),
      meeting: meetings[0],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Willkommen zurück
            </ThemedText>
            <ThemedText type="subtitle">Meine Gruppen</ThemedText>
          </View>
          <ThemedText type="smallBold">UniMeet</ThemedText>
        </View>

        {groups.length === 0 ? (
          <EmptyState
            title="Noch keine Gruppen"
            message="Erstelle eine Lerngruppe und lade Mitglieder ein."
            actionLabel="Gruppe erstellen"
            onAction={() => router.push('/group/create')}
          />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.group.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) =>
              item.context ? (
                <GroupCard
                  group={item.group}
                  context={item.context}
                  memberCount={item.group.memberIds.length}
                  meeting={item.meeting}
                  onPress={() => router.push(`/group/${item.group.id}`)}
                />
              ) : null
            }
          />
        )}

        <View style={styles.fab}>
          <PrimaryButton
            label="+ Gruppe erstellen"
            onPress={() => router.push('/group/create')}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  list: { gap: Spacing.three, paddingBottom: 96 },
  fab: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.four,
  },
});
