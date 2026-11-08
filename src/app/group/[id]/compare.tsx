import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Copy, Icon, Intro, Page, Panel, Row, ink, line, muted } from '@/components/campus';
import { DateSelector } from '@/components/date-selector';
import { planningDates } from '@/lib/demo-dates';
import { availabilityForGroup, useDemoData } from '@/lib/demo-state';
import { countMembersPerBlock, continuousSlots, type RankedSlot } from '@/lib/matching';
import { BLOCK_MINUTES, DAY_END_MIN, DAY_START_MIN, toHHMM } from '@/lib/time';

const levels = ['#F0EEE8', '#DCE7D8', '#ABC9A8', '#6D9D72', '#2F593D'];
const hours = (DAY_END_MIN - DAY_START_MIN) / 60;
const quarters = 60 / BLOCK_MINUTES;

export default function CompareScreen() {
  const { id, date: requestedDate, meetingId } = useLocalSearchParams<{ id: string; date?: string; meetingId?: string }>();
  const { state, dispatch } = useDemoData();
  const group = state.groups.find((item) => item.id === id);
  const moving = state.meetings.find((item) => item.id === meetingId && item.groupId === id && item.status !== 'cancelled');
  const [dates] = useState(() => planningDates(requestedDate));
  const [date, setDate] = useState(requestedDate && dates.includes(requestedDate) ? requestedDate : dates[0]);
  const [minimum, setMinimum] = useState(2);
  const [selected, setSelected] = useState<RankedSlot>();
  const [location, setLocation] = useState(moving?.location ?? '');
  const coverage = useMemo(() => countMembersPerBlock(group ? availabilityForGroup(state.availability, group, date) : []),
    [state.availability, group, date]);
  const slots = useMemo(() => continuousSlots(coverage, minimum), [coverage, minimum]);

  if (!group) return <Page back="/"><Intro kicker="GRUPPEN" title="Gruppe nicht gefunden" /></Page>;
  const groupId = group.id;
  const groupSize = group.memberIds.length;

  function save() {
    if (!selected) return;
    const details = { date, start: selected.start, end: selected.end, attendeeIds: selected.memberIds };
    if (moving) {
      dispatch({ type: 'meeting/reschedule', meetingId: moving.id, ...details });
      router.dismissTo(`/meeting/${moving.id}`);
      return;
    }
    const newId = `m-${Date.now()}`;
    dispatch({ type: 'meeting/create', meeting: {
      ...details, id: newId, groupId, location: location.trim() || 'Ort noch offen', status: 'proposed',
    } });
    router.replace(`/meeting/${newId}`);
  }

  return (
    <Page back={moving ? `/meeting/${moving.id}` : `/group/${groupId}`}
      footer={selected && <Button label={moving ? 'Termin verschieben' : 'Termin vorschlagen'} icon="check" onPress={save} />}>
      <Intro kicker={group.name.toLocaleUpperCase('de-DE')} title={moving ? 'Termin verschieben' : 'Gemeinsame Zeiten'}
        description="Finde Zeitfenster, in denen dieselben Personen durchgehend verfügbar sind." />
      <DateSelector dates={dates} value={date} onChange={(day) => { setDate(day); setSelected(undefined); }} />
      <View style={styles.threshold}>
        <View style={{ flex: 1 }}>
          <Copy tone="eyebrow">TEILNAHME</Copy>
          <Copy tone="label">Mindestens {minimum} von {groupSize} Personen</Copy>
        </View>
        <Button label="−" variant="quiet" disabled={minimum <= 2} onPress={() => { setMinimum(minimum - 1); setSelected(undefined); }} />
        <Button label="+" variant="quiet" disabled={minimum >= groupSize} onPress={() => { setMinimum(minimum + 1); setSelected(undefined); }} />
      </View>

      <View style={{ gap: 8 }}>
        <Copy tone="heading">Vorschläge</Copy>
        {!slots.length && <>
          <Copy>{coverage.size ? 'Für diese Auswahl gibt es keinen gemeinsamen Zeitraum. Wähle einen anderen Tag oder ändere die Mindestanzahl.' : 'Für diesen Tag hat noch niemand freie Zeiten eingetragen.'}</Copy>
          <Button label="Meine Zeiten bearbeiten" variant="quiet" style={{ alignSelf: 'flex-start' }}
            onPress={() => router.push(`/group/${groupId}/availability?date=${date}${moving ? `&meetingId=${moving.id}` : ''}`)} />
        </>}
        {slots.map((slot, index) => <Pressable key={`${slot.start}-${slot.end}`} accessibilityRole="radio"
          accessibilityState={{ checked: selected === slot }} onPress={() => setSelected(slot)}>
          <Panel style={selected === slot ? { backgroundColor: '#F3F6EC', borderColor: '#6D9D72' } : undefined}>
            <View style={styles.threshold}>
              <Icon name={selected === slot ? 'check' : 'clock'} />
              <View style={{ flex: 1 }}>
                {index === 0 && <Copy tone="eyebrow">BESTE ÜBEREINSTIMMUNG</Copy>}
                <Copy tone="label">{slot.start}–{slot.end} Uhr</Copy>
                <Copy tone="small">{slot.memberCount} von {groupSize} Personen · {slot.durationMin} Min.</Copy>
              </View>
            </View>
            {selected === slot && <Copy tone="small">{state.students.filter((student) =>
              slot.memberIds.includes(student.id)).map((student) => student.name).join(', ')}</Copy>}
          </Panel>
        </Pressable>)}
        {selected && !moving && <View style={{ gap: 5, marginTop: 6 }}>
          <Copy tone="eyebrow">TREFFPUNKT (OPTIONAL)</Copy>
          <TextInput accessibilityLabel="Treffpunkt" placeholder="z. B. Campusbibliothek" placeholderTextColor={muted}
            value={location} onChangeText={setLocation} maxLength={100} style={styles.input} />
        </View>}
      </View>

      {coverage.size > 0 && <Panel>
        <Copy tone="heading">Verfügbarkeit am Tag</Copy>
        <Copy tone="small">Jeder Balken steht für 15 Minuten. Dunkler bedeutet mehr verfügbare Personen.</Copy>
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: hours }, (_, hour) => <View key={hour} style={{ flex: 1, gap: 3, alignItems: 'stretch' }}>
            <View style={{ flexDirection: 'row', gap: 1 }}>
              {Array.from({ length: quarters }, (_, quarter) => {
                const block = hour * quarters + quarter;
                const count = coverage.get(block)?.size ?? 0;
                return <View key={quarter} accessible accessibilityLabel={`${toHHMM(DAY_START_MIN + block * BLOCK_MINUTES)} Uhr, ${count} verfügbar`}
                  style={{ flex: 1, height: 18, borderRadius: 2, backgroundColor: levels[Math.ceil(count / groupSize * 4)] }} />;
              })}
            </View>
          </View>)}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Copy tone="small">08:00</Copy><Copy tone="small">12:00</Copy><Copy tone="small">16:00</Copy><Copy tone="small">20:00</Copy>
        </View>
        <Row onPress={() => router.push(`/group/${groupId}/availability?date=${date}${moving ? `&meetingId=${moving.id}` : ''}`)}>
          <Copy tone="label" style={{ flex: 1 }}>Meine Zeiten bearbeiten</Copy>
        </Row>
      </Panel>}
    </Page>
  );
}

const styles = StyleSheet.create({
  threshold: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { color: ink, borderBottomWidth: 1, borderColor: line, minHeight: 46, fontSize: 16 },
});
