import type { ISODate } from '@/lib/types';

export function formatLocalDate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayLocal(): ISODate {
  return formatLocalDate(new Date());
}

export function addDays(date: ISODate, days: number): ISODate {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return formatLocalDate(parsed);
}

export function upcomingDates(base: ISODate, count: number): ISODate[] {
  return Array.from({ length: count }, (_, index) => addDays(base, index));
}
