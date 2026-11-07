import {
  availabilityForGroup,
  createFixtures,
  demoReducer,
  meetingsForGroup,
} from '@/lib/demo-state';
import type { Group } from '@/lib/types';

describe('demo state', () => {
  it('starts with groups, members, meetings, and availability', () => {
    const fixtures = createFixtures('2026-11-09');
    expect(fixtures.groups.length).toBeGreaterThanOrEqual(3);
    expect(fixtures.meetings.length).toBeGreaterThanOrEqual(3);
    expect(fixtures.availability.length).toBeGreaterThan(0);
  });

  it('creates a group and seeds availability', () => {
    const initial = createFixtures('2026-11-09');
    const group: Group = {
      id: 'g-new',
      name: 'Testgruppe',
      contextId: 'ctx-analysis',
      memberIds: ['u-you', 'u-lena'],
      createdAt: '2026-11-09',
    };

    const next = demoReducer(initial, {
      type: 'group/create',
      group,
      seededAvailability: [
        { id: 'seed-1', userId: 'u-lena', date: '2026-11-09', start: '10:00', end: '12:00' },
      ],
    });

    expect(next.groups.some((item) => item.id === 'g-new')).toBe(true);
    expect(next.availability.some((item) => item.id === 'seed-1')).toBe(true);
  });

  it('replaces only one user and one date when saving availability', () => {
    const initial = createFixtures('2026-11-09');
    const next = demoReducer(initial, {
      type: 'availability/set',
      userId: 'u-you',
      date: '2026-11-10',
      intervals: [{ start: '14:00', end: '16:00' }],
    });

    const yours = next.availability.filter(
      (item) => item.userId === 'u-you' && item.date === '2026-11-10'
    );
    expect(yours).toEqual([
      expect.objectContaining({ userId: 'u-you', date: '2026-11-10', start: '14:00', end: '16:00' }),
    ]);
  });

  it('creates meetings and changes meeting status immutably', () => {
    const initial = createFixtures('2026-11-09');
    const created = demoReducer(initial, {
      type: 'meeting/create',
      meeting: {
        id: 'm-new',
        groupId: 'g-analysis',
        date: '2026-11-09',
        start: '10:00',
        end: '11:00',
        location: 'Campus Bibliothek',
        status: 'proposed',
      },
    });

    const changed = demoReducer(created, {
      type: 'meeting/setStatus',
      meetingId: 'm-new',
      status: 'confirmed',
    });

    expect(changed.meetings.find((item) => item.id === 'm-new')?.status).toBe('confirmed');
    expect(created.meetings.find((item) => item.id === 'm-new')?.status).toBe('proposed');
  });

  it('provides group-scoped selectors', () => {
    const fixtures = createFixtures('2026-11-09');
    const group = fixtures.groups.find((item) => item.id === 'g-analysis');
    expect(group).toBeDefined();
    if (!group) return;

    expect(availabilityForGroup(fixtures.availability, group, '2026-11-09').every(
      (item) => group.memberIds.includes(item.userId)
    )).toBe(true);
    expect(meetingsForGroup(fixtures.meetings, 'g-analysis').every(
      (item) => item.groupId === 'g-analysis'
    )).toBe(true);
  });
});
