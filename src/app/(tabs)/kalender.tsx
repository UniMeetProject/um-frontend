import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Copy, Intro, Page, Row, dateLabel, line } from '@/components/campus';
import { MeetingBadge } from '@/components/meeting-badge';
import { useDemoData } from '@/lib/demo-state';
import { todayLocal } from '@/lib/demo-dates';

export default function CalendarScreen() {
  const { state } = useDemoData();
  const [onlyConfirmed, setOnlyConfirmed] = useState(false);
  const today = todayLocal();
  const meetings = state.meetings.filter((meeting) => meeting.date >= today && meeting.status !== 'cancelled' &&
    (!onlyConfirmed || meeting.status === 'confirmed'))
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const dates = [...new Set(meetings.map((meeting) => meeting.date))];

  return (
    <Page tab>
      <Intro kicker="DEIN ZEITPLAN" title="Kalender" description="Kommende Lerntreffen aus allen deinen Gruppen." />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Alle Termine" variant="quiet" selected={!onlyConfirmed} onPress={() => setOnlyConfirmed(false)} />
        <Button label="Bestätigt" variant="quiet" selected={onlyConfirmed} onPress={() => setOnlyConfirmed(true)} />
      </View>
      {!dates.length && <Copy>Hier sind gerade keine Termine geplant.</Copy>}
      {dates.map((date) => <View key={date} style={{ gap: 10 }}>
        <Copy tone="eyebrow">{dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' }).toLocaleUpperCase('de-DE')}</Copy>
        {meetings.filter((meeting) => meeting.date === date).map((meeting) => <View key={meeting.id} style={{ borderBottomWidth: 1, borderColor: line, paddingBottom: 11 }}>
          <Row onPress={() => router.push(`/meeting/${meeting.id}`)}>
            <View style={{ flex: 1, gap: 4 }}>
              <Copy tone="label">{state.groups.find((group) => group.id === meeting.groupId)?.name ?? 'Lerntreffen'}</Copy>
              <Copy tone="small">{meeting.start}–{meeting.end} Uhr · {meeting.location}</Copy>
            </View>
            <MeetingBadge status={meeting.status} />
          </Row>
        </View>)}
      </View>)}
    </Page>
  );
}
