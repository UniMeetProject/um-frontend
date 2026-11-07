import { ScrollView, StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import type { ISODate } from '@/lib/types';

export function DateSelector({
  dates,
  value,
  onChange,
}: {
  dates: ISODate[];
  value: ISODate;
  onChange: (date: ISODate) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
      {dates.map((date) => (
        <PrimaryButton
          key={date}
          label={new Intl.DateTimeFormat('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          }).format(new Date(`${date}T00:00:00`))}
          disabled={date === value}
          onPress={() => onChange(date)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dates: { gap: 8 },
});
