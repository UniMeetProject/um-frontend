import { toHHMM, DAY_START_MIN, BLOCK_MINUTES, intervalToBlocks } from '@/lib/time';
import type { AvailabilityInterval, HHMM, ISODate } from '@/lib/types';

export type RankedSlot = {
  start: HHMM;
  end: HHMM;
  durationMin: number;
  memberCount: number;
  memberIds: string[];
};

export function countMembersPerBlock(
  intervals: AvailabilityInterval[]
): Map<number, Set<string>> {
  const coverage = new Map<number, Set<string>>();

  for (const interval of intervals) {
    for (const block of intervalToBlocks(interval.start, interval.end)) {
      const members = coverage.get(block) ?? new Set<string>();
      members.add(interval.userId);
      coverage.set(block, members);
    }
  }

  return coverage;
}

export function slotsFromCoverage(
  coverage: Map<number, Set<string>>,
  minMembers: number
): RankedSlot[] {
  const qualifying = [...coverage.entries()]
    .filter(([, members]) => members.size >= minMembers)
    .sort(([a], [b]) => a - b);

  const slots: RankedSlot[] = [];
  let run: [number, Set<string>][] = [];

  const flushRun = () => {
    if (run.length === 0) return;
    const runEndBlock = run[run.length - 1][0];

    slots.push(buildSlot(run[0][0], runEndBlock, unionMembers(run)));

    for (let i = 1; i < run.length; i++) {
      const [block, members] = run[i];
      const previousMembers = run[i - 1][1];
      if (isProperSubset(members, previousMembers)) {
        slots.push(buildSlot(block, runEndBlock, unionMembers(run.slice(i))));
      }
    }

    run = [];
  };

  for (const [block, members] of qualifying) {
    const lastBlock = run[run.length - 1]?.[0];
    if (lastBlock !== undefined && block !== lastBlock + 1) flushRun();
    run.push([block, members]);
  }
  flushRun();

  // A common slot only exists when at least two members overlap, even when the
  // caller asks for minMembers = 1.
  return slots
    .filter((slot) => slot.memberCount >= 2)
    .sort(
      (a, b) =>
        b.memberCount - a.memberCount ||
        b.durationMin - a.durationMin ||
        a.start.localeCompare(b.start)
    );
}

export function findCommonSlots(
  availability: AvailabilityInterval[],
  memberIds: string[],
  date: ISODate,
  minMembers: number
): RankedSlot[] {
  const memberSet = new Set(memberIds);
  const relevant = availability.filter(
    (interval) => interval.date === date && memberSet.has(interval.userId)
  );
  return slotsFromCoverage(countMembersPerBlock(relevant), minMembers);
}

function unionMembers(run: [number, Set<string>][]): string[] {
  const union = new Set<string>();
  for (const [, members] of run) {
    for (const userId of members) union.add(userId);
  }
  return [...union].sort();
}

function buildSlot(
  startBlock: number,
  endBlock: number,
  memberIds: string[]
): RankedSlot {
  return {
    start: toHHMM(startBlock * BLOCK_MINUTES + DAY_START_MIN),
    end: toHHMM((endBlock + 1) * BLOCK_MINUTES + DAY_START_MIN),
    durationMin: (endBlock - startBlock + 1) * BLOCK_MINUTES,
    memberCount: memberIds.length,
    memberIds,
  };
}

function isProperSubset(a: Set<string>, b: Set<string>): boolean {
  if (a.size >= b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}
