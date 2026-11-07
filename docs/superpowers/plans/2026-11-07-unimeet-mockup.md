# UniMeet Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a German-language, mobile-first, clickable UniMeet demo in Expo that covers group creation, availability entry, overlap comparison, and meeting details using local deterministic fixtures.

**Architecture:** Replace the Expo starter shell with an Expo Router `Stack` and a JavaScript `Tabs` group. Keep all product data in a small immutable in-memory reducer, with pure functions for time-block conversion and overlap matching. The backend remains untouched.

**Tech Stack:** Expo SDK 57, Expo Router 57, React Native 0.86, React 19, TypeScript strict mode, jest-expo.

## Global Constraints

- Follow `um-frontend/AGENTS.md`: consult the exact Expo SDK 57 documentation before writing implementation code.
- All visible product copy must be German.
- Frontend-only local demo: do not modify `um-backend`, do not add authentication, and do not add persistence.
- Availability uses specific `YYYY-MM-DD` dates and half-open `[start, end)` intervals.
- Editable day bounds are exactly **08:00–20:00**, normalized to 15-minute blocks.
- Refreshing/restoring the app returns to original fixture state.
- Keep `typedRoutes: true` and `reactCompiler: true`; avoid object/array mutation in reducers and render code.
- Primary verification target is Expo web at a mobile viewport; Android/iOS device verification is follow-up work.
- Run `npm run test`, `npm run lint`, and `npm run typecheck` before every task commit.

---

## File structure

### Modify

- `package.json` — add Jest tooling, `test`, and `typecheck` scripts.
- `tsconfig.json` — add Jest globals types if required by the installed Jest types.
- `.gitignore` — ignore `coverage/`.
- `app.json` — rename the app to UniMeet.
- `src/constants/theme.ts` — add UniMeet colors while preserving dark mode.
- `src/app/_layout.tsx` — replace starter tabs with root `Stack` and demo-state provider.

### Delete

Starter branding/demo files only:

- `src/app/index.tsx`
- `src/app/explore.tsx`
- `src/components/app-tabs.tsx`
- `src/components/app-tabs.web.tsx`
- `src/components/animated-icon.tsx`
- `src/components/animated-icon.web.tsx` if present
- `src/components/web-badge.tsx`
- `src/components/hint-row.tsx`
- unused starter artwork under `assets/images/`, while keeping icons/favicon files referenced by `app.json`

### Create

```text
src/
  app/
    (tabs)/
      _layout.tsx
      index.tsx
      kalender.tsx
      profil.tsx
    group/
      create.tsx
      [id].tsx
      [id]/
        availability.tsx
        compare.tsx
    meeting/
      [id].tsx
  components/
    availability-grid.tsx
    date-selector.tsx
    empty-state.tsx
    group-card.tsx
    primary-button.tsx
    slot-list.tsx
    status-chip.tsx
    student-chip.tsx
  lib/
    demo-dates.ts
    demo-state.tsx
    fixtures.ts
    matching.ts
    time.ts
    types.ts
    __tests__/
      demo-state-test.ts
      matching-test.ts
      time-test.ts
```

## Shared contracts

These names and signatures are fixed across all tasks.

```ts
// src/lib/types.ts
export type ISODate = string;
export type HHMM = string;

export type Student = {
  id: string;
  name: string;
  initials: string;
  studyProgram: string;
};

export type StudyContext = {
  id: string;
  label: string;
  color: string;
};

export type Group = {
  id: string;
  name: string;
  contextId: string;
  memberIds: string[];
  createdAt: ISODate;
};

export type MeetingStatus = 'proposed' | 'confirmed' | 'changed' | 'cancelled';

export type Meeting = {
  id: string;
  groupId: string;
  date: ISODate;
  start: HHMM;
  end: HHMM;
  location: string;
  status: MeetingStatus;
};

export type AvailabilityInterval = {
  id: string;
  userId: string;
  date: ISODate;
  start: HHMM;
  end: HHMM;
};

export type DemoData = {
  currentUserId: string;
  students: Student[];
  contexts: StudyContext[];
  groups: Group[];
  meetings: Meeting[];
  availability: AvailabilityInterval[];
};

export type DemoAction =
  | { type: 'group/create'; group: Group; seededAvailability: AvailabilityInterval[] }
  | {
      type: 'availability/set';
      userId: string;
      date: ISODate;
      intervals: Array<Pick<AvailabilityInterval, 'start' | 'end'>>;
    }
  | { type: 'meeting/create'; meeting: Meeting }
  | { type: 'meeting/setStatus'; meetingId: string; status: MeetingStatus };
```

```ts
// src/lib/time.ts
export const DAY_START_MIN = 8 * 60;
export const DAY_END_MIN = 20 * 60;
export const BLOCK_MINUTES = 15;

export function toMinutes(time: HHMM): number;
export function toHHMM(minutes: number): HHMM;
export function isValidRange(start: HHMM, end: HHMM): boolean;
export function intervalToBlocks(start: HHMM, end: HHMM): number[];
```

```ts
// src/lib/matching.ts
export type RankedSlot = {
  start: HHMM;
  end: HHMM;
  durationMin: number;
  memberCount: number;
  memberIds: string[];
};

export function countMembersPerBlock(
  intervals: AvailabilityInterval[]
): Map<number, Set<string>>;

export function slotsFromCoverage(
  coverage: Map<number, Set<string>>,
  minMembers: number
): RankedSlot[];

export function findCommonSlots(
  availability: AvailabilityInterval[],
  memberIds: string[],
  date: ISODate,
  minMembers: number
): RankedSlot[];
```

```ts
// src/lib/demo-state.tsx
export function demoReducer(state: DemoData, action: DemoAction): DemoData;
export function availabilityForGroup(
  availability: AvailabilityInterval[],
  group: Group,
  date: ISODate
): AvailabilityInterval[];
export function meetingsForGroup(meetings: Meeting[], groupId: string): Meeting[];
export function useDemoData(): {
  state: DemoData;
  dispatch: React.Dispatch<DemoAction>;
};
export function DemoDataProvider({ children }: { children: React.ReactNode }): React.JSX.Element;
```

---

### Task 0: Branch and SDK 57 documentation check

**Files:**
- Read: `https://docs.expo.dev/versions/v57.0.0/`
- Modify: none

- [ ] **Step 1: Create and switch to the feature branch**

Run in `D:\Kimi\UniMeetProjekt\um-frontend`:

```bash
git switch -c feat/unimeet-mockup
```

Expected: `Switched to a new branch 'feat/unimeet-mockup'`.

- [ ] **Step 2: Consult versioned SDK 57 documentation**

Open `https://docs.expo.dev/versions/v57.0.0/` and locate the v57 pages for Expo Router navigation/tabs and unit testing. Record these notes in the implementation work log, not in source code:

```text
SDK: 57
Router navigation import: expo-router
Tabs pattern confirmed against v57 docs: JavaScript Tabs component from expo-router
Testing package resolved through: npx expo install jest-expo jest --dev
```

Expected: implementation uses v57-documented APIs only.

- [ ] **Step 3: Commit nothing**

This task produces no source changes and no commit.

---

### Task 1: Add test tooling

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `.gitignore`
- Test: `src/lib/__tests__/time-test.ts` (temporary smoke test)

**Interfaces:**
- Consumes: npm and Expo SDK 57 package resolution.
- Produces: `npm run test`, `npm run typecheck`, Jest preset, and `@/` module mapping.

- [ ] **Step 1: Install the SDK-compatible Jest packages**

Run:

```bash
npx expo install jest-expo jest @types/jest --dev
```

Expected: packages install without peer-dependency errors. If npm reports an incompatible Jest major version, stop and resolve with Expo's SDK 57 package resolution rather than manually installing a newer Jest.

- [ ] **Step 2: Add scripts and Jest config to `package.json`**

The `scripts` section becomes:

```json
"scripts": {
  "start": "expo start",
  "reset-project": "node ./scripts/reset-project.js",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint",
  "test": "jest",
  "typecheck": "tsc --noEmit"
}
```

Add this root-level Jest config:

```json
"jest": {
  "preset": "jest-expo",
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

- [ ] **Step 3: Allow Jest globals in TypeScript**

In `tsconfig.json`, change `compilerOptions` to:

```json
"compilerOptions": {
  "strict": true,
  "types": ["jest"],
  "paths": {
    "@/*": ["./src/*"],
    "@/assets/*": ["./assets/*"]
  }
}
```

- [ ] **Step 4: Ignore coverage output**

Append to `.gitignore`:

```gitignore
# Test coverage
coverage/
```

- [ ] **Step 5: Write a temporary smoke test**

Create `src/lib/__tests__/time-test.ts`:

```ts
describe('test tooling', () => {
  it('runs Jest', () => {
    expect(8 * 60).toBe(480);
  });
});
```

- [ ] **Step 6: Run the smoke test**

Run:

```bash
npm run test -- --runInBand
```

Expected: `1 passed` and exit code 0.

- [ ] **Step 7: Run typecheck and lint**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore src/lib/__tests__/time-test.ts
git commit -m "chore: add jest test tooling"
```

---

### Task 2: Add shared types and time helpers

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/time.ts`
- Test: `src/lib/__tests__/time-test.ts`

**Interfaces:**
- Consumes: Jest tooling from Task 1.
- Produces: every type in the shared contracts and the four time helper functions later matching code uses.

- [ ] **Step 1: Replace the smoke test with failing tests**

Replace `src/lib/__tests__/time-test.ts` with:

```ts
import {
  DAY_END_MIN,
  DAY_START_MIN,
  intervalToBlocks,
  isValidRange,
  toHHMM,
  toMinutes,
} from '@/lib/time';

describe('time helpers', () => {
  it('converts HH:MM to minutes from midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('19:45')).toBe(1185);
  });

  it('round-trips HH:MM through minutes', () => {
    expect(toHHMM(0)).toBe('00:00');
    expect(toHHMM(480)).toBe('08:00');
    expect(toHHMM(1185)).toBe('19:45');
  });

  it('rejects malformed and out-of-day times', () => {
    expect(() => toMinutes('8:00')).toThrow('Invalid HH:MM time');
    expect(() => toMinutes('24:00')).toThrow('Invalid HH:MM time');
    expect(() => toMinutes('10:60')).toThrow('Invalid HH:MM time');
  });

  it('accepts only increasing ranges inside the editable day', () => {
    expect(isValidRange('08:00', '09:00')).toBe(true);
    expect(isValidRange('10:00', '10:00')).toBe(false);
    expect(isValidRange('10:00', '09:00')).toBe(false);
    expect(isValidRange('07:45', '09:00')).toBe(false);
    expect(isValidRange('08:00', '20:15')).toBe(false);
  });

  it('maps one hour to four half-open blocks', () => {
    expect(intervalToBlocks('08:00', '09:00')).toEqual([0, 1, 2, 3]);
  });

  it('clamps intervals to the editable day', () => {
    expect(intervalToBlocks('07:30', '08:30')).toEqual([0, 1]);
    expect(intervalToBlocks('19:30', '21:00')).toEqual([46, 47]);
  });

  it('uses exclusive end semantics at the day boundary', () => {
    expect(intervalToBlocks('08:00', '20:00')).toHaveLength(48);
    expect(intervalToBlocks('19:45', '20:00')).toEqual([47]);
  });

  it('defines the expected day constants', () => {
    expect(DAY_START_MIN).toBe(480);
    expect(DAY_END_MIN).toBe(1200);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
npm run test -- --runInBand src/lib/__tests__/time-test.ts
```

Expected: TypeScript/module resolution failure because `src/lib/time.ts` does not exist.

- [ ] **Step 3: Create `src/lib/types.ts`**

```ts
export type ISODate = string;
export type HHMM = string;

export type Student = {
  id: string;
  name: string;
  initials: string;
  studyProgram: string;
};

export type StudyContext = {
  id: string;
  label: string;
  color: string;
};

export type Group = {
  id: string;
  name: string;
  contextId: string;
  memberIds: string[];
  createdAt: ISODate;
};

export type MeetingStatus = 'proposed' | 'confirmed' | 'changed' | 'cancelled';

export type Meeting = {
  id: string;
  groupId: string;
  date: ISODate;
  start: HHMM;
  end: HHMM;
  location: string;
  status: MeetingStatus;
};

export type AvailabilityInterval = {
  id: string;
  userId: string;
  date: ISODate;
  start: HHMM;
  end: HHMM;
};

export type DemoData = {
  currentUserId: string;
  students: Student[];
  contexts: StudyContext[];
  groups: Group[];
  meetings: Meeting[];
  availability: AvailabilityInterval[];
};

export type DemoAction =
  | { type: 'group/create'; group: Group; seededAvailability: AvailabilityInterval[] }
  | {
      type: 'availability/set';
      userId: string;
      date: ISODate;
      intervals: Array<Pick<AvailabilityInterval, 'start' | 'end'>>;
    }
  | { type: 'meeting/create'; meeting: Meeting }
  | { type: 'meeting/setStatus'; meetingId: string; status: MeetingStatus };
```

- [ ] **Step 4: Create `src/lib/time.ts`**

```ts
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
  if (!isValidRange(start, end)) return [];

  const first = Math.max(toMinutes(start), DAY_START_MIN);
  const lastExclusive = Math.min(toMinutes(end), DAY_END_MIN);
  const blocks: number[] = [];

  for (let minute = first; minute < lastExclusive; minute += BLOCK_MINUTES) {
    const block = (minute - DAY_START_MIN) / BLOCK_MINUTES;
    if (block >= 0 && block < 48) blocks.push(block);
  }
  return blocks;
}
```

- [ ] **Step 5: Run tests and verify they pass**

```bash
npm run test -- --runInBand src/lib/__tests__/time-test.ts
npm run typecheck
```

Expected: 8 tests passed; typecheck exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/time.ts src/lib/__tests__/time-test.ts
git commit -m "feat: add shared types and time helpers"
```

---

### Task 3: Implement availability matching

**Files:**
- Create: `src/lib/matching.ts`
- Test: `src/lib/__tests__/matching-test.ts`

**Interfaces:**
- Consumes: `AvailabilityInterval`, `HHMM`, `ISODate`, `intervalToBlocks` from Tasks 2.
- Produces: `RankedSlot`, `countMembersPerBlock`, `slotsFromCoverage`, and `findCommonSlots` for the compare screen.

- [ ] **Step 1: Write failing matching tests**

Create `src/lib/__tests__/matching-test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npm run test -- --runInBand src/lib/__tests__/matching-test.ts
```

Expected: module resolution failure because `src/lib/matching.ts` does not exist.

- [ ] **Step 3: Implement `src/lib/matching.ts`**

```ts
import { intervalToBlocks, toHHMM, DAY_START_MIN, BLOCK_MINUTES } from '@/lib/time';
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

  const merged: RankedSlot[] = [];

  for (const [block, members] of qualifying) {
    const previous = merged[merged.length - 1];
    const canExtend =
      previous !== undefined &&
      block === previousStartBlock(previous) + previousBlockCount(previous) &&
      sameMembers(previous.memberIds, [...members]);

    if (canExtend && previous) {
      merged[merged.length - 1] = {
        ...previous,
        end: toHHMM((block + 1) * BLOCK_MINUTES + DAY_START_MIN),
        durationMin: previous.durationMin + BLOCK_MINUTES,
      };
    } else {
      merged.push({
        start: toHHMM(block * BLOCK_MINUTES + DAY_START_MIN),
        end: toHHMM((block + 1) * BLOCK_MINUTES + DAY_START_MIN),
        durationMin: BLOCK_MINUTES,
        memberCount: members.size,
        memberIds: [...members].sort(),
      });
    }
  }

  return merged.sort(
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

function previousStartBlock(slot: RankedSlot): number {
  const [hours, minutes] = slot.start.split(':').map(Number);
  return (hours * 60 + minutes - DAY_START_MIN) / BLOCK_MINUTES;
}

function previousBlockCount(slot: RankedSlot): number {
  return slot.durationMin / BLOCK_MINUTES;
}

function sameMembers(a: string[], b: string[]): boolean {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
```

- [ ] **Step 4: Run matching tests, typecheck, and lint**

```bash
npm run test -- --runInBand src/lib/__tests__/matching-test.ts
npm run typecheck
npm run lint
```

Expected: 6 tests passed, typecheck 0, lint 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/matching.ts src/lib/__tests__/matching-test.ts
git commit -m "feat: add 15-minute overlap matching"
```

---

### Task 4: Add runtime dates, fixtures, and demo-state reducer

**Files:**
- Create: `src/lib/demo-dates.ts`
- Create: `src/lib/fixtures.ts`
- Create: `src/lib/demo-state.tsx`
- Test: `src/lib/__tests__/demo-state-test.ts`

**Interfaces:**
- Consumes: all shared types, `isValidRange`, and time helpers from Task 2.
- Produces: initial `DemoData`, `createFixtures`, `demoReducer`, selectors, provider, and hook used by every screen.

- [ ] **Step 1: Write failing reducer tests**

Create `src/lib/__tests__/demo-state-test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests and verify they fail**

```bash
npm run test -- --runInBand src/lib/__tests__/demo-state-test.ts
```

Expected: module resolution failure for the new files.

- [ ] **Step 3: Implement `src/lib/demo-dates.ts`**

```ts
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
```

- [ ] **Step 4: Implement `src/lib/fixtures.ts`**

This fixture set intentionally contains one obvious full-overlap scenario, partial-overlap scenarios, and a no-overlap scenario.

```ts
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
```

- [ ] **Step 5: Implement `src/lib/demo-state.tsx`**

```tsx
import React, { createContext, useContext, useMemo, useReducer } from 'react';

import { todayLocal } from '@/lib/demo-dates';
import { createFixtures } from '@/lib/fixtures';
import { isValidRange } from '@/lib/time';
import type {
  AvailabilityInterval,
  DemoAction,
  DemoData,
  Group,
  ISODate,
  Meeting,
} from '@/lib/types';

const DemoContext = createContext<{
  state: DemoData;
  dispatch: React.Dispatch<DemoAction>;
} | null>(null);

export function createInitialState(): DemoData {
  return createFixtures(todayLocal());
}

export function demoReducer(state: DemoData, action: DemoAction): DemoData {
  switch (action.type) {
    case 'group/create':
      return {
        ...state,
        groups: [...state.groups, action.group],
        availability: [...state.availability, ...action.seededAvailability],
      };

    case 'availability/set': {
      const valid = action.intervals.filter((item) => isValidRange(item.start, item.end));
      const retained = state.availability.filter(
        (item) => !(item.userId === action.userId && item.date === action.date)
      );
      const next = valid.map((item, index) => ({
        id: `${action.userId}-${action.date}-${index}`,
        userId: action.userId,
        date: action.date,
        start: item.start,
        end: item.end,
      }));
      return { ...state, availability: [...retained, ...next] };
    }

    case 'meeting/create':
      return { ...state, meetings: [...state.meetings, action.meeting] };

    case 'meeting/setStatus':
      return {
        ...state,
        meetings: state.meetings.map((meeting) =>
          meeting.id === action.meetingId
            ? { ...meeting, status: action.status }
            : meeting
        ),
      };
  }
}

export function availabilityForGroup(
  availability: AvailabilityInterval[],
  group: Group,
  date: ISODate
): AvailabilityInterval[] {
  const memberIds = new Set(group.memberIds);
  return availability.filter((item) => item.date === date && memberIds.has(item.userId));
}

export function meetingsForGroup(meetings: Meeting[], groupId: string): Meeting[] {
  return meetings.filter((meeting) => meeting.groupId === groupId);
}

export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoData must be used within DemoDataProvider');
  return context;
}
```

- [ ] **Step 6: Run tests, typecheck, and lint**

```bash
npm run test -- --runInBand src/lib/__tests__/demo-state-test.ts
npm run typecheck
npm run lint
```

Expected: 5 tests passed; typecheck and lint exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/demo-dates.ts src/lib/fixtures.ts src/lib/demo-state.tsx src/lib/__tests__/demo-state-test.ts
git commit -m "feat: add fixtures and demo state store"
```

---

### Task 5: Retheme the app and remove starter content

**Files:**
- Modify: `src/constants/theme.ts`
- Modify: `app.json`
- Modify: `src/app/_layout.tsx`
- Delete: starter files listed in the file structure

**Interfaces:**
- Consumes: existing `ThemedText`, `ThemedView`, and `useTheme` components.
- Produces: UniMeet color tokens and a minimal working root `Stack` shell.

- [ ] **Step 1: Add UniMeet colors to `src/constants/theme.ts`**

Keep `Fonts`, `Spacing`, `BottomTabInset`, and `MaxContentWidth`. Replace the `Colors` object with:

```ts
export const Colors = {
  light: {
    text: '#17211B',
    background: '#FBFDFC',
    backgroundElement: '#EEF4F2',
    backgroundSelected: '#DCEBE8',
    textSecondary: '#60716A',
    primary: '#0F766E',
    primaryText: '#FFFFFF',
    coverage0: '#F0FDF4',
    coverage1: '#DCFCE7',
    coverage2: '#86EFAC',
    coverage3: '#22C55E',
    coverage4: '#15803D',
    warning: '#B45309',
    warningBackground: '#FEF3C7',
    danger: '#B91C1C',
    dangerBackground: '#FEE2E2',
  },
  dark: {
    text: '#F4FAF7',
    background: '#101815',
    backgroundElement: '#1B2521',
    backgroundSelected: '#283832',
    textSecondary: '#A9BBB4',
    primary: '#2DD4BF',
    primaryText: '#062B27',
    coverage0: '#142019',
    coverage1: '#173B27',
    coverage2: '#166534',
    coverage3: '#22C55E',
    coverage4: '#86EFAC',
    warning: '#FBBF24',
    warningBackground: '#3A2A08',
    danger: '#F87171',
    dangerBackground: '#431A1A',
  },
} as const;
```

- [ ] **Step 2: Rename the app in `app.json`**

Change only these fields:

```json
"name": "UniMeet",
"slug": "unimeet"
```

Keep `typedRoutes`, `reactCompiler`, and static web output unchanged.

- [ ] **Step 3: Delete starter-only files**

Run:

```bash
rm src/app/index.tsx src/app/explore.tsx \
  src/components/app-tabs.tsx src/components/app-tabs.web.tsx \
  src/components/animated-icon.tsx src/components/animated-icon.web.tsx \
  src/components/web-badge.tsx src/components/hint-row.tsx
```

If one of the platform-specific animated-icon files does not exist, remove the files that do exist and continue. Remove only Expo-artwork image files that are not referenced by `app.json` or tab icons.

- [ ] **Step 4: Replace `src/app/_layout.tsx` with a minimal UniMeet shell**

```tsx
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { DemoDataProvider } from '@/lib/demo-state';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DemoDataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </DemoDataProvider>
  );
}
```

- [ ] **Step 5: Verify the shell typechecks**

At this stage the app intentionally has no tab index yet, so typecheck may still report a missing `(tabs)` route. Create the three placeholder screens in Task 6; do not commit a broken intermediate state.

---

### Task 6: Add navigation and placeholder tabs

**Files:**
- Create: `src/app/(tabs)/_layout.tsx`
- Create: `src/app/(tabs)/index.tsx`
- Create: `src/app/(tabs)/kalender.tsx`
- Create: `src/app/(tabs)/profil.tsx`

**Interfaces:**
- Consumes: root layout and theme from Tasks 4–5.
- Produces: routes `/`, `/kalender`, and `/profil`; group and meeting routes are added in later tasks.

- [ ] **Step 1: Create tab layout**

`src/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Gruppen' }} />
      <Tabs.Screen name="kalender" options={{ title: 'Kalender' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: Create a shared placeholder component**

`src/components/placeholder-screen.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function PlaceholderScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">{message}</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
```

- [ ] **Step 3: Create the three tab screens**

`src/app/(tabs)/index.tsx` temporarily:

```tsx
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function GroupsScreen() {
  return (
    <PlaceholderScreen
      title="Meine Gruppen"
      message="Deine Lerngruppen werden hier angezeigt."
    />
  );
}
```

`src/app/(tabs)/kalender.tsx`:

```tsx
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function CalendarScreen() {
  return (
    <PlaceholderScreen
      title="Kalender"
      message="Deine bestätigten Termine werden hier angezeigt."
    />
  );
}
```

`src/app/(tabs)/profil.tsx`:

```tsx
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ProfileScreen() {
  return (
    <PlaceholderScreen
      title="Profil"
      message="Profilinformationen sind in der Mockup-Demo noch nicht verfügbar."
    />
  );
}
```

- [ ] **Step 4: Run all current checks**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
```

Expected: all existing tests pass, typecheck exits 0, lint exits 0.

- [ ] **Step 5: Verify navigation manually**

Run `npm run web`, press `w` when prompted, and switch among **Gruppen**, **Kalender**, and **Profil**.

Expected: all tabs render and the URL changes.

- [ ] **Step 6: Commit theme, cleanup, and navigation**

```bash
git add -A
git commit -m "feat: replace starter shell with UniMeet navigation"
```

---

### Task 7: Add shared UI primitives and the Meine Gruppen screen

**Files:**
- Create: `src/components/primary-button.tsx`
- Create: `src/components/status-chip.tsx`
- Create: `src/components/empty-state.tsx`
- Create: `src/components/group-card.tsx`
- Create: `src/components/student-chip.tsx`
- Modify: `src/app/(tabs)/index.tsx`
- Modify: `src/app/_layout.tsx`
- Create: `src/app/group/create.tsx` placeholder

**Interfaces:**
- Consumes: `useDemoData`, fixtures, and theme tokens.
- Produces: reusable `PrimaryButton`, `StatusChip`, `EmptyState`, `GroupCard`, and `StudentChip` for later screens.

- [ ] **Step 1: Create `src/components/primary-button.tsx`**

```tsx
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primary, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
```

- [ ] **Step 2: Create `src/components/status-chip.tsx`**

```tsx
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MeetingStatus } from '@/lib/types';

const labels: Record<MeetingStatus, string> = {
  proposed: 'Vorgeschlagen',
  confirmed: 'Bestätigt',
  changed: 'Verschoben',
  cancelled: 'Abgesagt',
};

export function StatusChip({ status }: { status: MeetingStatus }) {
  const theme = useTheme();
  const warning = status === 'changed';
  const danger = status === 'cancelled';
  const backgroundColor = danger
    ? theme.dangerBackground
    : warning
      ? theme.warningBackground
      : theme.backgroundSelected;
  const color = danger ? theme.danger : warning ? theme.warning : theme.primary;

  return (
    <ThemedView style={[styles.chip, { backgroundColor }]}>
      <ThemedText type="smallBold" style={{ color }}>
        {labels[status]}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
```

- [ ] **Step 3: Create `src/components/empty-state.tsx`**

```tsx
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      <PrimaryButton label={actionLabel} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
});
```

- [ ] **Step 4: Create `src/components/group-card.tsx`**

```tsx
import { Pressable, StyleSheet } from 'react-native';

import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Group, Meeting, StudyContext } from '@/lib/types';

export function GroupCard({
  group,
  context,
  memberCount,
  meeting,
  onPress,
}: {
  group: Group;
  context: StudyContext;
  memberCount: number;
  meeting?: Meeting;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">{group.name}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {context.label} · {memberCount} Personen
        </ThemedText>
        {meeting ? (
          <ThemedText type="small">
            {formatDate(meeting.date)} · {meeting.start}–{meeting.end}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary" type="small">
            Kein Termin geplant
          </ThemedText>
        )}
        {meeting ? <StatusChip status={meeting.status} /> : null}
        <ThemedText type="linkPrimary" style={{ color: theme.primary }}>
          Details ansehen
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`));
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    gap: Spacing.two,
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.75,
  },
});
```

- [ ] **Step 5: Create `src/components/student-chip.tsx`**

```tsx
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Student } from '@/lib/types';

export function StudentChip({
  student,
  selected,
  onToggle,
}: {
  student: Student;
  selected: boolean;
  onToggle: (student: Student) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => onToggle(student)}>
      <ThemedView
        type={selected ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.chip, selected && { borderColor: theme.primary }]}>
        <ThemedText type="smallBold">{student.initials}</ThemedText>
        <ThemedText type="small" numberOfLines={1}>
          {student.name}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 104,
    padding: Spacing.two,
    gap: Spacing.one,
  },
});
```

- [ ] **Step 6: Add a placeholder create route and register it as a modal**

`src/app/group/create.tsx`:

```tsx
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function CreateGroupScreen() {
  return (
    <PlaceholderScreen
      title="Gruppe erstellen"
      message="Das Formular wird als Nächstes implementiert."
    />
  );
}
```

In `src/app/_layout.tsx`, change the `Stack` children to:

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen
    name="group/create"
    options={{ presentation: 'modal', headerShown: true, title: 'Gruppe erstellen' }}
  />
</Stack>
```

- [ ] **Step 7: Implement `src/app/(tabs)/index.tsx`**

```tsx
import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { GroupCard } from '@/components/group-card';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoData } from '@/lib/demo-state';

export default function GroupsScreen() {
  const { state } = useDemoData();

  const groups = state.groups.map((group) => {
    const meetings = state.meetings
      .filter((meeting) => meeting.groupId === group.id)
      .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
    return {
      group,
      context: state.contexts.find((context) => context.id === group.contextId),
      meeting: meetings[0],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Willkommen zurück
            </ThemedText>
            <ThemedText type="subtitle">Meine Gruppen</ThemedText>
          </View>
          <ThemedText type="smallBold">UniMeet</ThemedText>
        </View>

        {groups.length === 0 ? (
          <EmptyState
            title="Noch keine Gruppen"
            message="Erstelle eine Lerngruppe und lade Mitglieder ein."
            actionLabel="Gruppe erstellen"
            onAction={() => router.push('/group/create')}
          />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.group.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) =>
              item.context ? (
                <GroupCard
                  group={item.group}
                  context={item.context}
                  memberCount={item.group.memberIds.length}
                  meeting={item.meeting}
                  onPress={() => router.push(`/group/${item.group.id}`)}
                />
              ) : null
            }
          />
        )}

        <View style={styles.fab}>
          <PrimaryButton
            label="+ Gruppe erstellen"
            onPress={() => router.push('/group/create')}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  list: { gap: Spacing.three, paddingBottom: 96 },
  fab: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.four,
  },
});
```

- [ ] **Step 8: Run checks and manually verify**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
```

Then verify in Expo web: group cards render from fixtures, statuses appear, and **Gruppe erstellen** opens the modal placeholder.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Meine Gruppen screen and shared cards"
```

---

### Task 8: Implement Gruppe erstellen

**Files:**
- Replace: `src/app/group/create.tsx`
- Consumes: `useDemoData`, `StudentChip`, and `PrimaryButton`.
- Produces: the `group/create` action with deterministic seeded availability for the selected members.

- [ ] **Step 1: Replace `src/app/group/create.tsx`**

```tsx
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { StudentChip } from '@/components/student-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatLocalDate, todayLocal } from '@/lib/demo-dates';
import { useDemoData } from '@/lib/demo-state';
import type { AvailabilityInterval } from '@/lib/types';

const dateOffsets = [0, 1, 2];
const seededRanges = [
  ['09:00', '11:00'],
  ['13:00', '15:00'],
  ['16:30', '18:00'],
] as const;

export default function CreateGroupScreen() {
  const theme = useTheme();
  const { state, dispatch } = useDemoData();
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([state.currentUserId]);

  const selectableStudents = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return state.students.filter(
      (student) =>
        student.id !== state.currentUserId &&
        (!normalized || student.name.toLowerCase().includes(normalized))
    );
  }, [search, state.students, state.currentUserId]);

  const canCreate = name.trim().length > 0 && memberIds.length > 1;

  function toggleMember(studentId: string) {
    if (studentId === state.currentUserId) return;
    setMemberIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  function createGroup() {
    if (!canCreate) return;

    const baseDate = todayLocal();
    const groupId = `g-${Date.now()}`;
    const group = {
      id: groupId,
      name: name.trim(),
      contextId: state.contexts[0]?.id ?? 'ctx-analysis',
      memberIds,
      createdAt: baseDate,
    };

    const seededAvailability: AvailabilityInterval[] = memberIds.flatMap((userId, memberIndex) =>
      dateOffsets.map((offset, offsetIndex) => {
        const date = new Date(`${baseDate}T00:00:00`);
        date.setDate(date.getDate() + offset);
        const range = seededRanges[(memberIndex + offsetIndex) % seededRanges.length];
        return {
          id: `seed-${groupId}-${userId}-${offset}`,
          userId,
          date: formatLocalDate(date),
          start: range[0],
          end: range[1],
        };
      })
    );

    dispatch({ type: 'group/create', group, seededAvailability });
    router.replace(`/group/${groupId}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Gruppe erstellen</ThemedText>

          <View style={styles.field}>
            <ThemedText type="smallBold">Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="z. B. Analysis Lerngruppe"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
              ]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Personen einladen</ThemedText>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Suchen"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
              ]}
            />
          </View>

          <View style={styles.chips}>
            {selectableStudents.map((student) => (
              <StudentChip
                key={student.id}
                student={student}
                selected={memberIds.includes(student.id)}
                onToggle={(item) => toggleMember(item.id)}
              />
            ))}
          </View>

          <PrimaryButton label="Erstellen" disabled={!canCreate} onPress={createGroup} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
```

- [ ] **Step 2: Verify the full creation flow in Expo web**

Create a group named **Testgruppe**, select at least one student, press **Erstellen**, and confirm the app routes to the group placeholder.

- [ ] **Step 3: Run checks**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
```

Expected: existing tests pass and both checks exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add group creation flow"
```

---

### Task 9: Implement group detail and availability entry

**Files:**
- Create: `src/app/group/[id].tsx`
- Create: `src/app/group/[id]/availability.tsx`
- Create: `src/components/availability-grid.tsx`

**Interfaces:**
- Consumes: `availabilityForGroup`, `demoReducer` through dispatch, `intervalToBlocks`, `toHHMM`, and group fixtures.
- Produces: a group detail route and a saved set of current-user intervals for one selected date.

- [ ] **Step 1: Create `src/app/group/[id].tsx`**

```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { meetingsForGroup, useDemoData } from '@/lib/demo-state';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useDemoData();
  const group = state.groups.find((item) => item.id === id);

  if (!group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content}>
          <ThemedText type="subtitle">Gruppe nicht gefunden</ThemedText>
          <PrimaryButton label="Zurück zu Gruppen" onPress={() => router.replace('/')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const context = state.contexts.find((item) => item.id === group.contextId);
  const members = state.students.filter((student) => group.memberIds.includes(student.id));
  const meetings = meetingsForGroup(state.meetings, group.id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedText type="subtitle">{group.name}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {context?.label ?? 'Lerngruppe'} · {members.length} Personen
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold">Mitglieder</ThemedText>
          {members.map((member) => (
            <ThemedText key={member.id} type="small">
              {member.name}
            </ThemedText>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Termine</ThemedText>
          {meetings.length === 0 ? (
            <ThemedText themeColor="textSecondary">Noch kein Termin geplant.</ThemedText>
          ) : (
            meetings.map((meeting) => (
              <View key={meeting.id} style={styles.meetingRow}>
                <ThemedText type="small">
                  {meeting.date} · {meeting.start}–{meeting.end}
                </ThemedText>
                <StatusChip status={meeting.status} />
              </View>
            ))
          )}
        </View>

        <PrimaryButton
          label="Verfügbarkeit eintragen"
          onPress={() => router.push(`/group/${group.id}/availability`)}
        />
        <PrimaryButton
          label="Verfügbarkeiten vergleichen"
          onPress={() => router.push(`/group/${group.id}/compare`)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  section: { gap: Spacing.two },
  meetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
```

- [ ] **Step 2: Create `src/components/availability-grid.tsx`**

Tap-to-toggle is the guaranteed cross-platform interaction. Web pointer-entry drag is included, with tap-only fallback on native.

```tsx
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DAY_START_MIN, BLOCK_MINUTES, intervalToBlocks, toHHMM } from '@/lib/time';
import type { HHMM } from '@/lib/types';

export type AvailabilityDraft = { start: HHMM; end: HHMM };

export function blocksToDrafts(blocks: Set<number>): AvailabilityDraft[] {
  const sorted = [...blocks].sort((a, b) => a - b);
  const drafts: AvailabilityDraft[] = [];

  for (const block of sorted) {
    const start = toHHMM(block * BLOCK_MINUTES + DAY_START_MIN);
    const end = toHHMM((block + 1) * BLOCK_MINUTES + DAY_START_MIN);
    const previous = drafts[drafts.length - 1];
    if (previous && previous.end === start) {
      drafts[drafts.length - 1] = { start: previous.start, end };
    } else {
      drafts.push({ start, end });
    }
  }
  return drafts;
}

export function draftsToBlocks(drafts: AvailabilityDraft[]): Set<number> {
  const blocks = new Set<number>();
  for (const draft of drafts) {
    for (const block of intervalToBlocks(draft.start, draft.end)) blocks.add(block);
  }
  return blocks;
}

export function AvailabilityGrid({
  value,
  onChange,
}: {
  value: AvailabilityDraft[];
  onChange: (next: AvailabilityDraft[]) => void;
}) {
  const theme = useTheme();
  const [selectionAnchor, setSelectionAnchor] = useState<number | null>(null);
  const selectedBlocks = useMemo(() => draftsToBlocks(value), [value]);

  function toggleBlock(block: number) {
    const next = new Set(selectedBlocks);
    if (next.has(block)) next.delete(block);
    else next.add(block);
    onChange(blocksToDrafts(next));
  }

  function extendSelection(block: number) {
    if (selectionAnchor === null || Platform.OS !== 'web') return;
    const start = Math.min(selectionAnchor, block);
    const end = Math.max(selectionAnchor, block);
    const next = new Set(selectedBlocks);
    for (let item = start; item <= end; item += 1) next.add(item);
    onChange(blocksToDrafts(next));
  }

  return (
    <ThemedView type="backgroundElement" style={styles.grid}>
      {Array.from({ length: 48 }, (_, block) => {
        const selected = selectedBlocks.has(block);
        return (
          <Pressable
            key={block}
            onPress={() => toggleBlock(block)}
            onPressIn={() => setSelectionAnchor(block)}
            onPointerEnter={Platform.OS === 'web' ? () => extendSelection(block) : undefined}
            style={({ pressed }) => [
              styles.cell,
              {
                backgroundColor: selected ? theme.coverage3 : theme.background,
                borderColor: theme.backgroundSelected,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          />
        );
      })}
      <ThemedText type="small" themeColor="textSecondary">
        08:00 – 20:00 · Tippen zum Markieren, auf dem Webclient ziehen für einen Bereich
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderRadius: 18,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  cell: {
    minHeight: 22,
    borderWidth: 1,
    borderRadius: 6,
  },
});
```

- [ ] **Step 3: Create `src/app/group/[id]/availability.tsx`**

```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvailabilityGrid, draftsToBlocks, type AvailabilityDraft } from '@/components/availability-grid';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoData } from '@/lib/demo-state';
import { upcomingDates, todayLocal } from '@/lib/demo-dates';

export default function AvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useDemoData();
  const group = state.groups.find((item) => item.id === id);
  const baseDates = useMemo(() => upcomingDates(todayLocal(), 3), []);
  const [date, setDate] = useState(baseDates[0]);

  const initialDrafts = useMemo<AvailabilityDraft[]>(() => {
    if (!group) return [];
    return state.availability
      .filter(
        (item) => item.userId === state.currentUserId && item.date === date && group.memberIds.includes(item.userId)
      )
      .map(({ start, end }) => ({ start, end }));
  }, [date, group, state.availability, state.currentUserId]);

  const [drafts, setDrafts] = useState<AvailabilityDraft[]>(initialDrafts);

  if (!group) return null;

  function changeDate(nextDate: string) {
    setDate(nextDate);
    const nextDrafts = state.availability
      .filter(
        (item) => item.userId === state.currentUserId && item.date === nextDate && group?.memberIds.includes(item.userId)
      )
      .map(({ start, end }) => ({ start, end }));
    setDrafts(nextDrafts);
  }

  function save() {
    const validDrafts = drafts.filter((item) => draftsToBlocks([item]).size > 0);
    dispatch({
      type: 'availability/set',
      userId: state.currentUserId,
      date,
      intervals: validDrafts,
    });
    router.push(`/group/${group.id}/compare?date=${date}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Verfügbarkeit eintragen</ThemedText>
          <ThemedText themeColor="textSecondary">{group.name}</ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
            {baseDates.map((item) => (
              <PrimaryButton
                key={item}
                label={item}
                disabled={item === date}
                onPress={() => changeDate(item)}
              />
            ))}
          </ScrollView>

          <AvailabilityGrid value={drafts} onChange={setDrafts} />
          <PrimaryButton label="Speichern" onPress={save} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  dates: { gap: Spacing.two },
});
```

If `initialDrafts` and `useState` become stale after date changes, use the explicit `changeDate` loader above as the source of truth; do not mutate existing intervals.

- [ ] **Step 4: Verify availability flow**

On web: open a group, enter availability, toggle several blocks, save, and confirm routing to comparison.

- [ ] **Step 5: Run checks and commit**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
git add -A
git commit -m "feat: add availability entry flow"
```

---

### Task 10: Implement Vergleichen and recommended slots

**Files:**
- Create: `src/app/group/[id]/compare.tsx`
- Create: `src/components/date-selector.tsx`
- Create: `src/components/slot-list.tsx`

**Interfaces:**
- Consumes: `findCommonSlots`, `availabilityForGroup`, and `meeting/create`.
- Produces: ranked German-labelled slots and navigation to the newly created meeting details route.

- [ ] **Step 1: Create `src/components/date-selector.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `src/components/slot-list.tsx`**

```tsx
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RankedSlot } from '@/lib/matching';

export function SlotList({
  slots,
  groupSize,
  onSelect,
}: {
  slots: RankedSlot[];
  groupSize: number;
  onSelect: (slot: RankedSlot) => void;
}) {
  const theme = useTheme();

  if (slots.length === 0) return null;

  return (
    <View style={styles.list}>
      {slots.map((slot) => (
        <Pressable key={`${slot.start}-${slot.end}`} onPress={() => onSelect(slot)}>
          <ThemedView type="backgroundElement" style={styles.slot}>
            <View style={styles.row}>
              <ThemedText type="smallBold">
                {slot.start}–{slot.end}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.primary }}>
                {slot.memberCount}/{groupSize} Personen
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" type="small">
              {slot.durationMin} Minuten verfügbar
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  slot: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
```

- [ ] **Step 3: Create `src/app/group/[id]/compare.tsx`**

```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSelector } from '@/components/date-selector';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SlotList } from '@/components/slot-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { availabilityForGroup, useDemoData } from '@/lib/demo-state';
import { upcomingDates, todayLocal } from '@/lib/demo-dates';
import { findCommonSlots, countMembersPerBlock, type RankedSlot } from '@/lib/matching';

export default function CompareScreen() {
  const { id, date: initialDate } = useLocalSearchParams<{ id: string; date?: string }>();
  const { state, dispatch } = useDemoData();
  const group = state.groups.find((item) => item.id === id);
  const baseDates = useMemo(() => upcomingDates(todayLocal(), 3), []);
  const [date, setDate] = useState(initialDate ?? baseDates[0]);
  const [minMembers, setMinMembers] = useState(1);

  const availability = useMemo(
    () => (group ? availabilityForGroup(state.availability, group, date) : []),
    [date, group, state.availability]
  );
  const slots = useMemo(
    () => (group ? findCommonSlots(state.availability, group.memberIds, date, minMembers) : []),
    [date, group, minMembers, state.availability]
  );
  const coverage = useMemo(() => countMembersPerBlock(availability), [availability]);

  if (!group) return null;

  function selectSlot(slot: RankedSlot) {
    const meetingId = `m-${Date.now()}`;
    dispatch({
      type: 'meeting/create',
      meeting: {
        id: meetingId,
        groupId: group.id,
        date,
        start: slot.start,
        end: slot.end,
        location: 'Campus Bibliothek',
        status: 'proposed',
      },
    });
    router.push(`/meeting/${meetingId}`);
  }

  if (availability.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <EmptyState
            title="Keine Verfügbarkeit eingetragen"
            message="Trage zuerst deine Zeiten ein, bevor du die Gruppe vergleichst."
            actionLabel="Verfügbarkeit eintragen"
            onAction={() => router.push(`/group/${group.id}/availability`)}
          />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Verfügbarkeiten vergleichen</ThemedText>
          <DateSelector dates={baseDates} value={date} onChange={setDate} />

          <View style={styles.threshold}>
            <ThemedText type="smallBold">Mindestens {minMembers} Personen</ThemedText>
            <View style={styles.thresholdButtons}>
              <PrimaryButton label="−" onPress={() => setMinMembers((value) => Math.max(1, value - 1))} />
              <PrimaryButton
                label="+"
                onPress={() => setMinMembers((value) => Math.min(group.memberIds.length, value + 1))}
              />
            </View>
          </View>

          <ThemedView type="backgroundElement" style={styles.coverage}>
            {Array.from({ length: 48 }, (_, block) => {
              const count = coverage.get(block)?.size ?? 0;
              const level = Math.min(4, count);
              return (
                <View
                  key={block}
                  style={[
                    styles.coverageCell,
                    { backgroundColor: coverageColor(level) },
                  ]}
                />
              );
            })}
            <ThemedText type="small" themeColor="textSecondary">
              08:00 – 20:00
            </ThemedText>
          </ThemedView>

          {slots.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              Für dieses Datum gibt es keinen gemeinsamen Zeitraum. Erweitere das Datum oder senke den Personenschwellenwert.
            </ThemedText>
          ) : (
            <>
              <ThemedText type="smallBold">Empfohlene Zeitfenster</ThemedText>
              <SlotList slots={slots} groupSize={group.memberIds.length} onSelect={selectSlot} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function coverageColor(level: number): string {
  const colors = ['#F0FDF4', '#DCFCE7', '#86EFAC', '#22C55E', '#15803D'];
  return colors[level];
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  threshold: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thresholdButtons: { flexDirection: 'row', gap: Spacing.two },
  coverage: { borderRadius: 18, padding: Spacing.two, gap: Spacing.one },
  coverageCell: { minHeight: 22, borderRadius: 6 },
});
```

Use the theme coverage tokens instead of hard-coded colors if `useTheme()` is already imported; the helper exists only to keep this screen self-contained.

- [ ] **Step 4: Verify the three fixture scenarios**

Open `g-analysis` and switch dates:

- Base date: full overlap should rank 14:00–16:00 first.
- Base date +1: partial ranked slots should appear.
- Base date +2: no-overlap feedback should appear.

- [ ] **Step 5: Run checks and commit**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
git add -A
git commit -m "feat: add availability comparison screen"
```

---

### Task 11: Implement Meeting-Details

**Files:**
- Create: `src/app/meeting/[id].tsx`

**Interfaces:**
- Consumes: `meeting/setStatus`, `StatusChip`, and fixture lookups.
- Produces: a meeting screen whose status changes locally and resets after refresh.

- [ ] **Step 1: Create `src/app/meeting/[id].tsx`**

```tsx
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDemoData } from '@/lib/demo-state';

export default function MeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useDemoData();
  const meeting = state.meetings.find((item) => item.id === id);

  if (!meeting) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content}>
          <ThemedText type="subtitle">Termin nicht gefunden</ThemedText>
          <PrimaryButton label="Zurück zu Gruppen" onPress={() => router.replace('/')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const group = state.groups.find((item) => item.id === meeting.groupId);
  const attendees = state.students.filter((student) => group?.memberIds.includes(student.id));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText type="subtitle">Lerntreffen</ThemedText>
          <StatusChip status={meeting.status} />
        </View>

        <ThemedText themeColor="textSecondary">{group?.name ?? 'Lerngruppe'}</ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold">Zeit</ThemedText>
          <ThemedText>
            {new Intl.DateTimeFormat('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }).format(new Date(`${meeting.date}T00:00:00`))}
          </ThemedText>
          <ThemedText>{meeting.start}–{meeting.end} Uhr</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Ort</ThemedText>
          <ThemedText>{meeting.location}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Teilnehmer</ThemedText>
          {attendees.map((attendee) => (
            <ThemedText key={attendee.id}>{attendee.name}</ThemedText>
          ))}
        </View>

        <PrimaryButton
          label="Annehmen"
          disabled={meeting.status === 'confirmed'}
          onPress={() => dispatch({ type: 'meeting/setStatus', meetingId: meeting.id, status: 'confirmed' })}
        />
        <PrimaryButton
          label="Verschieben"
          onPress={() => router.push(`/group/${meeting.groupId}/compare?date=${meeting.date}`)}
        />
        <PrimaryButton
          label="Absagen"
          disabled={meeting.status === 'cancelled'}
          onPress={() => dispatch({ type: 'meeting/setStatus', meetingId: meeting.id, status: 'cancelled' })}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { gap: Spacing.two },
});
```

- [ ] **Step 2: Verify state transitions and reset behavior**

Open each fixture meeting, accept or cancel it, confirm the chip changes, and refresh the browser to confirm fixture state returns.

- [ ] **Step 3: Run checks and commit**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
git add -A
git commit -m "feat: add meeting details screen"
```

---

### Task 12: Final verification and polish

**Files:**
- Modify: any small layout/copy issues discovered during verification
- Modify: `src/app/(tabs)/kalender.tsx`
- Modify: `src/app/(tabs)/profil.tsx`

**Interfaces:**
- Consumes: the complete app.
- Produces: the final reviewable mockup.

- [ ] **Step 1: Run automated verification**

```bash
npm run test -- --runInBand
npm run typecheck
npm run lint
```

Expected: all tests pass, typecheck exits 0, lint exits 0.

- [ ] **Step 2: Complete the manual demo script**

Run `npm run web`, press `w`, and verify at approximately 390 px width and at desktop width:

1. **Meine Gruppen** renders fixture cards.
2. **Gruppe erstellen** creates a visible group.
3. **Verfügbarkeit eintragen** saves selected ranges.
4. **Vergleichen** shows full overlap, partial overlap, and no overlap.
5. A recommended slot creates a proposed meeting.
6. **Meeting-Details** supports accept and cancel.
7. Refresh restores fixtures.
8. **Kalender** and **Profil** placeholders remain labelled and intentional.

- [ ] **Step 3: Fix only issues that block the demo script**

Do not add notifications, authentication, persistence, chat, or unrelated polish.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: finalize unimeet mockup"
```

---

## Plan self-review

- **Spec coverage:** all five core screens, German copy, specific-date availability, 08:00–20:00 bounds, 15-minute matching, local state/reset, theme, feedback states, and verification are represented by Tasks 2–12.
- **Consistency:** shared types and function signatures are defined once in the contracts and reused by name.
- **Placeholder scan:** no unresolved implementation placeholders remain in the task sequence.
- **Known simplification:** drag selection is web-enhanced with tap selection everywhere, matching the no-extra-plugin constraint.
