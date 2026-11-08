import { toHHMM, DAY_START_MIN, BLOCK_MINUTES, intervalToBlocks } from '@/lib/time';
import type { AvailabilityInterval, HHMM, ISODate } from '@/lib/types';

export type RankedSlot = {
  start: HHMM;
  end: HHMM;
  durationMin: number;
  /**
   * Union of all members available somewhere in the slot — an upper bound,
   * since not every member is present in every block.
   */
  memberCount: number;
  /**
   * Smallest per-block member count across the slot: at least this many
   * members are available at every moment of the slot.
   */
  minMemberCount: number;
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

/**
 * Builds ranked common slots from per-block member coverage.
 *
 * Only *common* slots are returned: a slot always requires at least two
 * distinct members, regardless of the supplied `minMembers`. `minMembers`
 * raises that floor when it is greater than two — blocks covered by fewer
 * than `minMembers` members never start or extend a slot. Passing
 * `minMembers = 1` therefore does *not* yield single-member slots; it merely
 * admits every block into run formation.
 *
 * Truthful run semantics: a run is only extended by an adjacent block when
 * at least one member is available in *every* block of the extended run.
 * When no member bridges the current run and the next block, the run closes
 * before that block and a new run starts. Within a run, a member dropping
 * out can still yield a shorter remainder slot, but only when someone stays
 * available through every remaining block.
 *
 * Result is ranked by member count descending, then duration descending,
 * then earlier start. Slots are half-open: `end` is exclusive.
 */
export function slotsFromCoverage(
  coverage: Map<number, Set<string>>,
  minMembers: number
): RankedSlot[] {
  const effectiveMin = Math.max(2, minMembers);
  const qualifying = [...coverage.entries()]
    .filter(([, members]) => members.size >= minMembers)
    .sort(([a], [b]) => a - b);

  const slots: RankedSlot[] = [];
  let run: [number, Set<string>][] = [];
  let runIntersection = new Set<string>();

  const flushRun = () => {
    if (run.length === 0) return;
    const runEndBlock = run[run.length - 1][0];

    slots.push(buildSlot(run[0][0], runEndBlock, run));

    for (let i = 1; i < run.length; i++) {
      const [block, members] = run[i];
      const previousMembers = run[i - 1][1];
      if (!isProperSubset(members, previousMembers)) continue;
      const suffix = run.slice(i);
      // The remainder is only truthful if someone stays available through
      // every block of the suffix.
      if (intersectMembers(suffix).size === 0) continue;
      slots.push(buildSlot(block, runEndBlock, suffix));
    }

    run = [];
    runIntersection = new Set();
  };

  for (const [block, members] of qualifying) {
    const lastBlock = run[run.length - 1]?.[0];
    if (lastBlock !== undefined && block !== lastBlock + 1) flushRun();
    if (run.length > 0 && intersectSets(runIntersection, members).size === 0) {
      // No member bridges the two adjacent blocks: close the run before
      // this block and start a new one.
      flushRun();
    }
    runIntersection =
      run.length === 0 ? new Set(members) : intersectSets(runIntersection, members);
    run.push([block, members]);
  }
  flushRun();

  // A common slot only exists when at least two members overlap, even when
  // the caller asks for minMembers = 1.
  return slots
    .filter((slot) => slot.memberCount >= effectiveMin)
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

// The planner needs the same attendees to remain free throughout a selectable slot.
export function continuousSlots(coverage: Map<number, Set<string>>, minimum: number): RankedSlot[] {
  const floor = Math.max(2, minimum);
  const candidates: { first: number; last: number; memberIds: string[] }[] = [];
  for (const [first, members] of coverage) {
    let available = members;
    let last = first;
    while (available.size >= floor) {
      const next = intersectSets(available, coverage.get(last + 1) ?? new Set<string>());
      if (next.size < available.size) {
        candidates.push({ first, last, memberIds: [...available].sort() });
      }
      available = next;
      last++;
    }
  }

  return candidates
    .filter((slot) => !candidates.some((other) =>
      other !== slot && other.first <= slot.first && other.last >= slot.last &&
      other.memberIds.length >= slot.memberIds.length))
    .map(({ first, last, memberIds }) => ({
      start: toHHMM(first * BLOCK_MINUTES + DAY_START_MIN),
      end: toHHMM((last + 1) * BLOCK_MINUTES + DAY_START_MIN),
      durationMin: (last - first + 1) * BLOCK_MINUTES,
      memberCount: memberIds.length,
      minMemberCount: memberIds.length,
      memberIds,
    }))
    .sort((a, b) => b.memberCount - a.memberCount || b.durationMin - a.durationMin || a.start.localeCompare(b.start));
}

function intersectSets(a: Set<string>, b: Set<string>): Set<string> {
  const result = new Set<string>();
  for (const value of a) {
    if (b.has(value)) result.add(value);
  }
  return result;
}

function intersectMembers(run: [number, Set<string>][]): Set<string> {
  const [first, ...rest] = run;
  let intersection = new Set(first[1]);
  for (const [, members] of rest) {
    intersection = intersectSets(intersection, members);
  }
  return intersection;
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
  blocks: [number, Set<string>][]
): RankedSlot {
  const memberIds = unionMembers(blocks);
  return {
    start: toHHMM(startBlock * BLOCK_MINUTES + DAY_START_MIN),
    end: toHHMM((endBlock + 1) * BLOCK_MINUTES + DAY_START_MIN),
    durationMin: (endBlock - startBlock + 1) * BLOCK_MINUTES,
    memberCount: memberIds.length,
    minMemberCount: Math.min(...blocks.map(([, members]) => members.size)),
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
