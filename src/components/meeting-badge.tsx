import { View } from 'react-native';

import { Copy } from '@/components/campus';
import type { MeetingStatus } from '@/lib/types';

const badges = {
  confirmed: { label: 'Bestätigt', bg: '#E7F1D6', color: '#315433' },
  proposed: { label: 'Vorgeschlagen', bg: '#FAECD0', color: '#725218' },
  changed: { label: 'Verschoben', bg: '#ECE6F5', color: '#554271' },
  cancelled: { label: 'Abgesagt', bg: '#FAE8E4', color: '#9D382F' },
  open: { label: 'In Planung', bg: '#EDF0E8', color: '#43503F' },
};

export function MeetingBadge({ status = 'open' }: { status?: MeetingStatus | 'open' }) {
  const badge = badges[status];
  return <View style={{ alignSelf: 'flex-start', borderRadius: 16, backgroundColor: badge.bg, paddingVertical: 5, paddingHorizontal: 9 }}>
    <Copy tone="small" style={{ fontSize: 11, fontWeight: '800', color: badge.color }}>{badge.label}</Copy>
  </View>;
}
