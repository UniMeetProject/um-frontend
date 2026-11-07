import { countMembersPerBlock, findCommonSlots, slotsFromCoverage } from '@/lib/matching';
import type { AvailabilityInterval } from '@/lib/types';

const base = { date: '2026-11-09' };
const interval = (
  id: string,
  userId: string,
  start: string,
  end: string
): AvailabilityInterval => ({ id, userId, date: base.date, start, end });

describe('availability matching', () => {
  it('counts unique members per 15-minute block', () => {
    const coverage = countMembersPerBlock([
      interval('a', 'u1', '08:00', '08:30'),
      interval('b', 'u2', '08:00', '08:30'),
      interval('c', 'u2', '08:15', '09:00'),
    ]);

    expect(coverage.get(0)?.size).toBe(2);
    expect(coverage.get(1)?.size).toBe(2);
    expect(coverage.get(2)?.size).toBe(1);
  });

  it('merges adjacent qualifying blocks into a ranked slot', () => {
    const coverage = countMembersPerBlock([
      interval('a', 'u1', '08:00', '09:00'),
      interval('b', 'u2', '08:00', '09:00'),
    ]);

    expect(slotsFromCoverage(coverage, 2)).toEqual([
      {
        start: '08:00',
        end: '09:00',
        durationMin: 60,
        memberCount: 2,
        memberIds: ['u1', 'u2'],
      },
    ]);
  });

  it('ranks full coverage before partial coverage', () => {
    const slots = findCommonSlots(
      [
        interval('a', 'u1', '08:00', '09:00'),
        interval('b', 'u2', '08:00', '08:30'),
        interval('c', 'u3', '08:00', '09:00'),
      ],
      ['u1', 'u2', 'u3'],
      base.date,
      1
    );

    expect(slots[0]).toMatchObject({ start: '08:00', end: '09:00', memberCount: 3 });
    expect(slots[1]).toMatchObject({ start: '08:30', end: '09:00', memberCount: 2 });
  });

  it('applies the member threshold', () => {
    const intervals = [
      interval('a', 'u1', '08:00', '09:00'),
      interval('b', 'u2', '08:00', '08:30'),
    ];

    expect(findCommonSlots(intervals, ['u1', 'u2'], base.date, 2)).toEqual([
      expect.objectContaining({ start: '08:00', end: '08:30', memberCount: 2 }),
    ]);
    expect(findCommonSlots(intervals, ['u1', 'u2'], base.date, 3)).toEqual([]);
  });

  it('returns an empty list when no intervals overlap', () => {
    expect(
      findCommonSlots(
        [interval('a', 'u1', '08:00', '09:00'), interval('b', 'u2', '10:00', '11:00')],
        ['u1', 'u2'],
        base.date,
        1
      )
    ).toEqual([]);
  });

  it('breaks equal-coverage ties by duration and then earlier start', () => {
    const slots = findCommonSlots(
      [
        interval('a', 'u1', '10:00', '11:00'),
        interval('b', 'u1', '12:00', '12:30'),
        interval('c', 'u2', '10:30', '11:00'),
        interval('d', 'u2', '12:00', '12:30'),
      ],
      ['u1', 'u2'],
      base.date,
      1
    );

    expect(slots.map((slot) => [slot.start, slot.end])).toEqual([
      ['10:00', '11:00'],
      ['12:00', '12:30'],
    ]);
  });
});
