import { formatLocalDate } from '@/lib/demo-dates';
import type { AvailabilityInterval, DemoData, ISODate } from '@/lib/types';

export function createFixtures(baseDate: ISODate): DemoData {
  const day0 = baseDate;
  const day1 = shiftDate(baseDate, 1);
  const day2 = shiftDate(baseDate, 2);

  return {
    currentUserId: 'u-you',
    students: [
      { id: 'u-you', name: 'Du', initials: 'DU', studyProgram: 'Informatik' },
      { id: 'u-lena', name: 'Lena Hoffmann', initials: 'LH', studyProgram: 'Informatik' },
      { id: 'u-taro', name: 'Taro Janal', initials: 'TJ', studyProgram: 'Wirtschaftsinformatik' },
      { id: 'u-hania', name: 'Hania Sayyed', initials: 'HS', studyProgram: 'Maschinenbau' },
      { id: 'u-yanik', name: 'Yanik Hofmann', initials: 'YH', studyProgram: 'BWL' },
      { id: 'u-canan', name: 'Canan Balikci', initials: 'CB', studyProgram: 'Medieninformatik' },
    ],
    contexts: [
      { id: 'ctx-analysis', label: 'Analysis', color: '#0F766E' },
      { id: 'ctx-projekt', label: 'Projektmanagement', color: '#7C3AED' },
      { id: 'ctx-programmierung', label: 'Programmierung', color: '#B45309' },
    ],
    groups: [
      {
        id: 'g-analysis',
        name: 'Analysis Lerngruppe',
        contextId: 'ctx-analysis',
        memberIds: ['u-you', 'u-lena', 'u-taro'],
        createdAt: day0,
      },
      {
        id: 'g-projekt',
        name: 'Präsentation Projektmanagement',
        contextId: 'ctx-projekt',
        memberIds: ['u-you', 'u-hania', 'u-yanik', 'u-canan'],
        createdAt: day0,
      },
      {
        id: 'g-programmierung',
        name: 'Programmierung Übungsgruppe',
        contextId: 'ctx-programmierung',
        memberIds: ['u-you', 'u-lena', 'u-canan'],
        createdAt: day0,
      },
    ],
    meetings: [
      {
        id: 'm-analysis-confirmed',
        groupId: 'g-analysis',
        date: day0,
        start: '14:00',
        end: '16:00',
        location: 'Campus Bibliothek',
        status: 'confirmed',
      },
      {
        id: 'm-projekt-proposed',
        groupId: 'g-projekt',
        date: day1,
        start: '10:00',
        end: '11:30',
        location: 'Campus Bibliothek',
        status: 'proposed',
      },
      {
        id: 'm-programming-changed',
        groupId: 'g-programmierung',
        date: day2,
        start: '18:00',
        end: '19:30',
        location: 'Online',
        status: 'changed',
      },
    ],
    availability: [
      // Full overlap: everyone is free 14:00–16:00 on day 0.
      availability('a1', 'u-you', day0, '14:00', '16:00'),
      availability('a2', 'u-lena', day0, '13:30', '16:30'),
      availability('a3', 'u-taro', day0, '14:00', '16:00'),

      // Partial overlap on day 1.
      availability('a4', 'u-you', day1, '10:00', '12:00'),
      availability('a5', 'u-lena', day1, '11:00', '13:00'),
      availability('a6', 'u-taro', day1, '10:30', '11:30'),

      // No overlap on day 2.
      availability('a7', 'u-you', day2, '08:00', '09:30'),
      availability('a8', 'u-lena', day2, '12:00', '13:00'),
      availability('a9', 'u-taro', day2, '17:00', '18:30'),

      // Project-group partial matches.
      availability('a10', 'u-you', day0, '09:00', '11:00'),
      availability('a11', 'u-hania', day0, '09:30', '12:00'),
      availability('a12', 'u-yanik', day0, '10:00', '10:45'),
      availability('a13', 'u-canan', day0, '10:00', '12:00'),
    ],
  };
}

export function createId(prefix: string, existingCount: number): string {
  return `${prefix}-${existingCount + 1}`;
}

function availability(
  id: string,
  userId: string,
  date: ISODate,
  start: string,
  end: string
): AvailabilityInterval {
  return { id, userId, date, start, end };
}

function shiftDate(date: ISODate, days: number): ISODate {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return formatLocalDate(value);
}
