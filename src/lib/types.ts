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
      intervals: Pick<AvailabilityInterval, 'start' | 'end'>[];
    }
  | { type: 'meeting/create'; meeting: Meeting }
  | { type: 'meeting/setStatus'; meetingId: string; status: MeetingStatus };
