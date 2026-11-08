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

export { createFixtures } from '@/lib/fixtures';

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

    case 'meeting/reschedule': {
      if (!state.meetings.some((meeting) => meeting.id === action.meetingId)) {
        return state;
      }
      return {
        ...state,
        meetings: state.meetings.map((meeting) =>
          meeting.id === action.meetingId
            ? {
                ...meeting,
                date: action.date,
                start: action.start,
                end: action.end,
                status: 'changed' as const,
                attendeeIds: action.attendeeIds ?? meeting.attendeeIds,
              }
            : meeting
        ),
      };
    }
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
