import type { HHMM } from '@/lib/types';

export const DAY_START_MIN = 8 * 60;
export const DAY_END_MIN = 20 * 60;
export const BLOCK_MINUTES = 15;

const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export function toMinutes(time: HHMM): number {
  const match = TIME_PATTERN.exec(time);
  if (!match) throw new Error(`Invalid HH:MM time: ${time}`);

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid HH:MM time: ${time}`);
  }
  return hours * 60 + minutes;
}

export function toHHMM(minutes: number): HHMM {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1439) {
    throw new Error(`Invalid minute value: ${minutes}`);
  }
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function isValidRange(start: HHMM, end: HHMM): boolean {
  try {
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    return (
      startMin >= DAY_START_MIN &&
      endMin <= DAY_END_MIN &&
      startMin < endMin
    );
  } catch {
    return false;
  }
}

export function intervalToBlocks(start: HHMM, end: HHMM): number[] {
  let startMin: number;
  let endMin: number;
  try {
    startMin = toMinutes(start);
    endMin = toMinutes(end);
  } catch {
    return [];
  }

  const first = Math.max(startMin, DAY_START_MIN);
  const lastExclusive = Math.min(endMin, DAY_END_MIN);
  if (first >= lastExclusive) return [];

  const blocks: number[] = [];
  for (let minute = first; minute < lastExclusive; minute += BLOCK_MINUTES) {
    const block = (minute - DAY_START_MIN) / BLOCK_MINUTES;
    if (block >= 0 && block < 48) blocks.push(block);
  }
  return blocks;
}
