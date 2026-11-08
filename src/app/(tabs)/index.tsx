import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Avatar, Button, Copy, Icon, Page, accent, dateLabel, line } from '@/components/campus';
import { MeetingBadge } from '@/components/meeting-badge';
import { useDemoData } from '@/lib/demo-state';
import { todayLocal } from '@/lib/demo-dates';

const filters = ['Alle', 'Termin geplant', 'Abstimmung offen'] as const;
const subjects = [
  { bg: '#E7EED4', icon: 'book' },
  { bg: '#F9E4CB', icon: 'grid' },
  { bg: '#E6E2F4', icon: 'code' },
] as const;

export default function GroupsScreen() {
  const { state } = useDemoData();
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(Platform.OS !== 'web');
  useEffect(() => setMounted(true), []);
  const wide = mounted && width >= 800;
  const [filter, setFilter] = useState<(typeof filters)[number]>('Alle');
  const user = state.students.find((student) => student.id === state.currentUserId);
  const today = todayLocal();
  const scheduled = state.meetings
    .filter((meeting) => meeting.status !== 'cancelled' && meeting.date >= today)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const next = scheduled.find((meeting) => meeting.status === 'confirmed');
  const nextGroup = state.groups.find((group) => group.id === next?.groupId);
  const groups = state.groups.map((group) => ({
    group,
    meeting: scheduled.find((meeting) => meeting.groupId === group.id && meeting.status === 'confirmed')
      ?? scheduled.find((meeting) => meeting.groupId === group.id),
  })).filter(({ meeting }) => filter === 'Alle' || (filter === 'Termin geplant') === (meeting?.status === 'confirmed'));

  return (
    <Page wide tab>
      <View style={styles.top}>
        <View style={styles.brand}>
          <View style={styles.logo}><Icon name="calendar" size={22} /></View>
          <Copy tone="heading">UniMeet</Copy>
        </View>
        {user && <Pressable accessibilityRole="button" accessibilityLabel="Profil öffnen" onPress={() => router.navigate('/profil')}>
          <Avatar student={user} size={44} />
        </Pressable>}
      </View>

      <View style={{ gap: 5 }}>
        <Copy accessibilityRole="header" tone="title" style={!wide && { fontSize: 32, lineHeight: 38 }}>Dein Campusplaner</Copy>
        <Copy>{dateLabel(today, { weekday: 'long', day: 'numeric', month: 'long' })}</Copy>
      </View>

      <View style={[styles.hero, wide && styles.heroWide]}>
        <View style={[styles.artFrame, wide && styles.artFrameWide]}>
          <Image accessible={false} source={require('../../../assets/images/campus-planner.svg')}
            contentFit="contain" style={styles.art} />
        </View>
        <View style={[styles.heroCopy, wide && { flex: 1 }]}>
          <Copy tone="eyebrow">{next ? 'NÄCHSTES TREFFEN' : 'GEMEINSAM LERNEN'}</Copy>
          <Copy tone="heading" style={{ fontSize: 30 }}>{nextGroup?.name ?? 'Plane dein nächstes Lerntreffen'}</Copy>
          <Copy>{next ? `${dateLabel(next.date)} · ${next.start} Uhr · ${next.location}` : 'Finde mit deiner Lerngruppe eine Zeit, die für euch passt.'}</Copy>
          {next && <Button label="Treffen ansehen" icon="arrow" onPress={() => router.push(`/meeting/${next.id}`)}
            style={wide ? { alignSelf: 'flex-start', marginTop: 6 } : { marginTop: 6 }} />}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <View style={styles.top}>
          <Copy tone="heading" accessibilityRole="header" style={{ flexShrink: 1, fontSize: 23 }}>Meine Gruppen</Copy>
          <Button label="Neue Gruppe" icon="plus" style={{ paddingHorizontal: 12 }} variant={next ? 'quiet' : 'primary'} onPress={() => router.push('/group/create')} />
        </View>
        <View style={styles.filters}>
          {filters.map((item) => <Button key={item} label={item} variant="quiet" style={{ paddingHorizontal: 10 }} selected={filter === item} onPress={() => setFilter(item)} />)}
        </View>
      </View>

      <View style={styles.cards}>
        {groups.map(({ group, meeting }) => {
          const index = state.contexts.findIndex((context) => context.id === group.contextId);
          const subject = subjects[Math.max(0, index) % subjects.length];
          const members = state.students.filter((student) => group.memberIds.includes(student.id));
          return (
            <Pressable key={group.id} accessibilityRole="button" onPress={() => router.push(`/group/${group.id}`)}
              style={({ pressed, hovered }) => [styles.card, (hovered || pressed) && { backgroundColor: '#F9F5ED' }]}>
              <View style={[styles.tile, { backgroundColor: subject.bg }]}><Icon name={subject.icon} /></View>
              <View style={{ gap: 4, flex: 1 }}>
                <Copy tone="label">{group.name}</Copy>
                <Copy tone="small">{members.length} Personen{meeting ? ` · ${dateLabel(meeting.date)} · ${meeting.start} Uhr` : ''}</Copy>
                {!wide && <MeetingBadge status={meeting?.status} />}
              </View>
              {wide && <MeetingBadge status={meeting?.status} />}
              <Icon name="arrow" color={accent} size={17} />
            </Pressable>
          );
        })}
        {groups.length === 0 && <Copy>Für diesen Filter gibt es keine Gruppen.</Copy>}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4EFE5', alignItems: 'center', justifyContent: 'center' },
  hero: { gap: 17 },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: 36 },
  heroCopy: { gap: 8 },
  artFrame: { height: 178, backgroundColor: '#EFE6D7', borderRadius: 16, overflow: 'hidden' },
  artFrameWide: { flex: 1.15, height: 226 },
  art: { width: '100%', height: '100%' },
  tile: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  cards: { borderTopWidth: 1, borderColor: line },
  card: { paddingVertical: 13, gap: 13, alignItems: 'center', flexDirection: 'row', borderColor: line, borderBottomWidth: 1 },
});
