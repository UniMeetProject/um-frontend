import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Copy, Icon, Intro, Page, Panel, Row, dateLabel, line } from '@/components/campus';
import { MeetingBadge } from '@/components/meeting-badge';
import { meetingsForGroup, useDemoData } from '@/lib/demo-state';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useDemoData();
  const group = state.groups.find((item) => item.id === id);
  if (!group) return <Page back="/"><Intro kicker="GRUPPEN" title="Gruppe nicht gefunden" /></Page>;

  const context = state.contexts.find((item) => item.id === group.contextId);
  const members = state.students.filter((student) => group.memberIds.includes(student.id));
  const meetings = meetingsForGroup(state.meetings, group.id).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  return (
    <Page back="/">
      <Intro kicker={context?.label.toLocaleUpperCase('de-DE') ?? 'LERNGRUPPE'} title={group.name}
        description={`${members.length} Personen in dieser Lerngruppe`} />
      <Panel style={{ backgroundColor: '#F4EFE5' }}>
        <Copy tone="eyebrow">TERMINABSTIMMUNG</Copy>
        <Copy tone="heading">Wann habt ihr Zeit?</Copy>
        <Copy>Markiere deine freien Zeiten und vergleiche sie mit denen deiner Gruppe.</Copy>
        <Button label="Meine Zeiten eintragen" icon="clock" onPress={() => router.push(`/group/${group.id}/availability`)} />
        <Button label="Gemeinsame Zeiten finden" icon="arrow" variant="quiet" onPress={() => router.push(`/group/${group.id}/compare`)} />
      </Panel>
      <View style={{ gap: 10 }}>
        <Copy tone="heading">Termine</Copy>
        {!meetings.length && <Copy>Für diese Gruppe ist noch kein Termin geplant.</Copy>}
        {meetings.map((meeting) => <View key={meeting.id} style={{ borderBottomWidth: 1, borderColor: line, paddingBottom: 8 }}>
          <Row onPress={() => router.push(`/meeting/${meeting.id}`)}>
            <Icon name="calendar" />
            <View style={{ flex: 1, gap: 3 }}>
              <Copy tone="label">{dateLabel(meeting.date)} · {meeting.start} Uhr</Copy>
              <Copy tone="small">{meeting.location}</Copy>
            </View>
            <MeetingBadge status={meeting.status} />
          </Row>
        </View>)}
      </View>
      <View style={{ gap: 8 }}>
        <Copy tone="heading">Mitglieder</Copy>
        {members.map((student) => <Row key={student.id}>
          <Avatar student={student} />
          <View><Copy tone="label">{student.name}</Copy><Copy tone="small">{student.studyProgram}</Copy></View>
        </Row>)}
      </View>
    </Page>
  );
}
