import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AvailabilityGrid, type AvailabilityDraft } from '@/components/availability-grid';
import { Button, Copy, Intro, Page } from '@/components/campus';
import { DateSelector } from '@/components/date-selector';
import { planningDates } from '@/lib/demo-dates';
import { useDemoData } from '@/lib/demo-state';

export default function AvailabilityScreen() {
  const { id, date: requestedDate, meetingId } = useLocalSearchParams<{ id: string; date?: string; meetingId?: string }>();
  const { state, dispatch } = useDemoData();
  const group = state.groups.find((item) => item.id === id);
  const [dates] = useState(() => planningDates(requestedDate));
  const [date, setDate] = useState(requestedDate && dates.includes(requestedDate) ? requestedDate : dates[0]);
  const [changes, setChanges] = useState<Record<string, AvailabilityDraft[]>>({});

  if (!group) return <Page back="/"><Intro kicker="GRUPPEN" title="Gruppe nicht gefunden" /></Page>;

  const drafts = changes[date] ?? state.availability.filter((item) =>
    item.userId === state.currentUserId && item.date === date).map(({ start, end }) => ({ start, end }));
  const compare = `/group/${id}/compare?date=${date}${meetingId ? `&meetingId=${meetingId}` : ''}` as const;

  function save() {
    for (const [editedDate, intervals] of Object.entries(changes)) {
      dispatch({ type: 'availability/set', userId: state.currentUserId, date: editedDate, intervals });
    }
    router.replace(compare);
  }

  return (
    <Page back={`/group/${id}`} footer={<Button label="Speichern und vergleichen" icon="arrow" onPress={save} />}>
      <Intro kicker={group.name.toLocaleUpperCase('de-DE')} title="Meine freien Zeiten"
        description="Wähle einen Tag und markiere die Viertelstunden, an denen du Zeit hast. Deine Eingaben bleiben beim Tageswechsel erhalten." />
      <DateSelector dates={dates} value={date} onChange={setDate} />
      <View style={{ gap: 9 }}>
        <Copy tone="eyebrow">AUSGEWÄHLTE ZEITEN</Copy>
        <Copy>{drafts.length ? drafts.map(({ start, end }) => `${start}–${end}`).join(' · ') : 'Noch keine Zeiten markiert'}</Copy>
        {!!drafts.length && <Button label="Auswahl für diesen Tag löschen" variant="quiet" style={{ alignSelf: 'flex-start' }}
          onPress={() => setChanges((previous) => ({ ...previous, [date]: [] }))} />}
      </View>
      <AvailabilityGrid value={drafts} onChange={(value) => setChanges((previous) => ({ ...previous, [date]: value }))} />
    </Page>
  );
}
