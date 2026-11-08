import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Copy, Icon, Intro, Page, Panel, Row, dateLabel } from '@/components/campus';
import { MeetingBadge } from '@/components/meeting-badge';
import { useDemoData } from '@/lib/demo-state';

export default function MeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useDemoData();
  const [cancelling, setCancelling] = useState(false);
  const meeting = state.meetings.find((item) => item.id === id);
  if (!meeting) return <Page back="/kalender"><Intro kicker="KALENDER" title="Termin nicht gefunden" /></Page>;

  const group = state.groups.find((item) => item.id === meeting.groupId);
  const attendeeIds = meeting.attendeeIds ?? group?.memberIds ?? [];
  const attendees = state.students.filter((student) => attendeeIds.includes(student.id));

  return (
    <Page back={group ? `/group/${group.id}` : '/kalender'}>
      <Intro kicker="LERNTREFFEN" title={group?.name ?? 'Termin'} />
      <Panel>
        <MeetingBadge status={meeting.status} />
        <Row><Icon name="calendar" /><View style={{ flex: 1 }}>
          <Copy tone="label">{dateLabel(meeting.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Copy>
          <Copy>{meeting.start}–{meeting.end} Uhr</Copy>
        </View></Row>
        <Row><Icon name="pin" /><Copy tone="label" style={{ flex: 1 }}>{meeting.location}</Copy></Row>
      </Panel>
      <View style={{ gap: 8 }}>
        <Copy tone="heading">Teilnehmende</Copy>
        {attendees.map((student) => <Row key={student.id}>
          <Avatar student={student} /><Copy tone="label">{student.name}</Copy>
        </Row>)}
      </View>
      {meeting.status !== 'cancelled' && <View style={{ gap: 8 }}>
        {meeting.status !== 'confirmed' && <Button label="Termin bestätigen" icon="check"
          onPress={() => dispatch({ type: 'meeting/setStatus', meetingId: id, status: 'confirmed' })} />}
        {group && <Button label="Verschieben" variant="quiet"
          onPress={() => router.push(`/group/${group.id}/compare?date=${meeting.date}&meetingId=${id}`)} />}
        {cancelling ? <Panel>
          <Copy tone="label">Diesen Termin absagen?</Copy>
          <Copy>Der Termin verschwindet aus der Kalenderübersicht.</Copy>
          <Button label="Absage bestätigen" variant="danger" onPress={() => {
            dispatch({ type: 'meeting/setStatus', meetingId: id, status: 'cancelled' });
            setCancelling(false);
          }} />
          <Button label="Termin behalten" variant="quiet" onPress={() => setCancelling(false)} />
        </Panel> : <Button label="Termin absagen" variant="danger" onPress={() => setCancelling(true)} />}
      </View>}
    </Page>
  );
}
