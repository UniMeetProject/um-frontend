import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Avatar, Button, Copy, Icon, Intro, Page, forest, ink, line, muted } from '@/components/campus';
import { todayLocal } from '@/lib/demo-dates';
import { useDemoData } from '@/lib/demo-state';

export default function CreateGroupScreen() {
  const { state, dispatch } = useDemoData();
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [contextId, setContextId] = useState(state.contexts[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const people = state.students.filter((student) => student.id !== state.currentUserId);
  const query = search.trim().toLocaleLowerCase('de-DE');
  const results = people.filter((student) =>
    `${student.name} ${student.studyProgram}`.toLocaleLowerCase('de-DE').includes(query));
  const ready = Boolean(name.trim() && selected.length);

  function createGroup() {
    if (!ready) return;
    const id = `g-${Date.now()}`;
    dispatch({
      type: 'group/create',
      group: { id, name: name.trim(), contextId, memberIds: [state.currentUserId, ...selected], createdAt: todayLocal() },
      seededAvailability: [],
    });
    router.replace(`/group/${id}`);
  }

  function toggle(id: string) {
    setSelected((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  }

  return (
    <Page back="/" footer={<Button label="Gruppe erstellen" icon="plus" onPress={createGroup} disabled={!ready} />}>
      <Intro kicker="NEUE LERNGRUPPE" title="Gruppe erstellen" description="Gib deiner Gruppe einen Namen und wähle mindestens eine Person aus." />
      <View style={styles.section}>
        <Copy tone="eyebrow">GRUPPENNAME</Copy>
        <TextInput accessibilityLabel="Gruppenname" value={name} onChangeText={setName} maxLength={80}
          placeholder="z. B. Analysis Lerngruppe" placeholderTextColor={muted} style={styles.input} />
      </View>
      <View style={styles.section}>
        <Copy tone="eyebrow">FACHBEREICH</Copy>
        <View style={styles.tags}>
          {state.contexts.map((context) => <Button key={context.id} label={context.label} variant="quiet"
            selected={contextId === context.id} onPress={() => setContextId(context.id)} />)}
        </View>
      </View>
      <View style={styles.section}>
        <Copy tone="heading">Personen einladen</Copy>
        <TextInput accessibilityLabel="Personen suchen" value={search} onChangeText={setSearch}
          placeholder="Name oder Studiengang" placeholderTextColor={muted} style={styles.input} />
        {!!selected.length && <View style={styles.tags}>
          {people.filter((student) => selected.includes(student.id)).map((student) =>
            <Button key={student.id} label={`${student.name} ×`} variant="quiet" onPress={() => toggle(student.id)} />)}
        </View>}
        {results.map((student) => {
          const checked = selected.includes(student.id);
          return <Pressable key={student.id} accessibilityRole="checkbox" accessibilityState={{ checked }}
            onPress={() => toggle(student.id)} style={({ pressed }) => [styles.person, pressed && { opacity: 0.6 }]}>
            <Avatar student={student} />
            <View style={{ flex: 1 }}><Copy tone="label">{student.name}</Copy><Copy tone="small">{student.studyProgram}</Copy></View>
            <View style={[styles.circle, checked && { backgroundColor: forest, borderColor: forest }]}>
              {checked && <Icon name="check" color="#FFFFFF" size={15} />}
            </View>
          </Pressable>;
        })}
        {!results.length && <Copy>Keine Personen gefunden.</Copy>}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  input: { color: ink, borderBottomWidth: 1, borderColor: line, paddingVertical: 12, fontSize: 16, minHeight: 46 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: line, paddingVertical: 10 },
  circle: { width: 25, height: 25, borderRadius: 13, borderWidth: 1, borderColor: '#BEB6A7', alignItems: 'center', justifyContent: 'center' },
});
