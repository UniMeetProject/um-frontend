import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Copy, Icon, Intro, Page, Panel, Row } from '@/components/campus';
import { useDemoData } from '@/lib/demo-state';

export default function ProfileScreen() {
  const { state } = useDemoData();
  const student = state.students.find((item) => item.id === state.currentUserId);
  if (!student) return <Page tab><Intro kicker="UNIMEET" title="Profil" /></Page>;

  const groups = state.groups.filter((group) => group.memberIds.includes(student.id));

  return (
    <Page tab>
      <Intro kicker="UNIMEET" title="Mein Profil" />
      <Panel style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar student={student} size={68} />
        <View><Copy tone="heading">{student.name}</Copy><Copy>{student.studyProgram}</Copy></View>
      </Panel>
      <View style={{ gap: 10 }}>
        <Copy tone="heading">Meine Verfügbarkeit</Copy>
        <Copy>Deine freien Zeiten gelten für alle deine Lerngruppen. Wähle eine Gruppe, um sie einzutragen.</Copy>
        {groups.map((group) => <Row key={group.id} onPress={() => router.push(`/group/${group.id}/availability`)}>
          <Icon name="clock" /><Copy tone="label" style={{ flex: 1 }}>{group.name}</Copy>
        </Row>)}
      </View>
      <Copy tone="small">Demo-Profil · Änderungen gelten für diese Sitzung.</Copy>
    </Page>
  );
}
