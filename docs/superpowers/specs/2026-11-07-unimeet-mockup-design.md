# UniMeet Mockup Design

Date: 2026-11-07
Owner: Nico
Status: Approved for implementation planning

## 1. Purpose

Create a clickable German-language mobile demo for UniMeet, an app that helps students find suitable timeslots to study together. The first mockup demonstrates the complete core workflow while avoiding backend, database, and authentication setup.

## 2. Scope

### Included

- Frontend-only interactive Expo app.
- Realistic local fixtures for current user, students, study contexts, groups, dated availability, and meetings.
- Five core screens: study-group overview, create group, enter availability, compare availability, and meeting details.
- Local availability-overlap matching on 15-minute blocks.
- Demo-local state for created groups, edited availability, and selected meetings.
- Web and mobile-oriented visual verification.
- Unit tests for interval and matching helpers.

### Excluded from the first mockup

- Authentication and user registration.
- PostgreSQL, Prisma, persistence, and backend API integration.
- Notifications and chat.
- Device-specific Android and iOS verification.
- Full profile, settings, and account-management screens.

## 3. Core workflow

1. A student reviews existing study groups and meetings.
2. The student creates a named group and selects mock students.
3. The student enters availability for chosen dates.
4. The app compares group availability and ranks common timeslots.
5. The student selects a suitable timeslot and reviews meeting details.
6. The student can update the meeting state locally, including proposed, confirmed, changed, or cancelled examples.

## 4. Screen architecture

### 4.1 Meine Gruppen

- Current-user header with a placeholder profile action.
- Study-group cards showing meeting/deadline context, member count, and state.
- Floating action button labelled for creating a group.
- Tapping a card opens the group or meeting context.

### 4.2 Gruppe erstellen

- German-labelled form with group name.
- Mock-person search and selectable student chips.
- Create action builds a new group with realistic seeded availability.

### 4.3 Verfügbarkeit eintragen

- Date-based availability editor.
- Time range from 08:00 to 20:00.
- Tapping or dragging selects available ranges.
- Explicit **Speichern** action; previous local entries can be edited.

### 4.4 Vergleichen

- Date selector.
- Availability matrix or grid using a green overlap-intensity scale.
- **Empfohlene Zeitfenster** ranked by member coverage and duration.
- Selection of a recommended slot leads to meeting details or confirmation.

### 4.5 Meeting-Details

- Date, time, location, attendee list, and group context.
- Local actions for accepting/rescheduling or cancelling a proposed meeting.
- Refreshing the app restores fixture state.

### Navigation

Primary bottom navigation consists of **Gruppen**, **Kalender**, and **Profil**. The first demo prioritizes **Gruppen** and may leave the other tabs as minimal placeholders if needed.

## 5. Data model

Availability is represented as a dated interval:

```ts
type AvailabilityInterval = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string;   // HH:MM
};
```

Fixture entities also include students, groups, group memberships, study contexts, meetings, and meeting states.

## 6. Matching algorithm

1. Load availability for the selected date and group.
2. Normalize times into 15-minute blocks.
3. Count available members per block.
4. Apply a selected member-threshold requirement.
5. Merge adjacent qualifying blocks.
6. Rank merged timeslots by:
   1. member coverage, descending;
   2. duration, descending;
   3. earlier start time, ascending.

This must produce testable cases with one obvious match, several partial matches, and no available overlap.

## 7. Visual direction

- Student-friendly, calm, and practical.
- Light mode is the default; existing dark-mode support may be preserved.
- Primary color is a fresh academic blue or teal.
- Availability coverage uses a pale-to-strong green scale.
- Conflicts and deadline warnings use restrained amber/red accents.
- Cards use rounded corners, compact status chips, and clear hierarchy.
- Dialogs behave like mobile bottom sheets where appropriate.
- All visible product copy is German; code names may remain English.

## 8. Feedback states

- Empty groups: explanation plus creation action.
- No availability entered: guidance to add times before comparison.
- No overlap: explain the conflict and suggest widening the date or duration.
- Invalid range: prevent an end time before the start time and show inline feedback.
- Simulated loading appears only where future API calls are expected.

## 9. Verification

- Run the Expo web preview and inspect each route.
- Complete the end-to-end local flow from group creation through meeting details.
- Add unit tests for interval normalization, block counting, threshold filtering, and ranking/merging.
- Check responsive mobile and web layouts.
- Android and iOS device verification is optional follow-up work.

## 10. Non-goals and constraints

- Do not use or modify the backend for the mockup.
- Do not merge the unmerged authentication branch merely for UI prototyping.
- Do not preserve Expo starter branding or demo content.
- Follow the Expo SDK 57 project instructions before changing implementation code.
