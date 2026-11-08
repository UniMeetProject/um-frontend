export type Person = { id: string; name: string; study: string };
export type MeetingStatus = "bestaetigt" | "vorschlag" | "abgesagt";
export type Meeting = { date: string; start: number; end: number; place: string; attendees: string[]; status: MeetingStatus };
export type Group = { id: string; name: string; course: string; members: string[]; meeting?: Meeting | undefined };
export type Availability = Record<string, Record<string, number[]>>; // person -> date -> slots

export const ME = "me";
export const SLOT_START_HOUR = 8;
export const SLOTS = 48; // 08:00–20:00 in 15-Minuten-Blöcken
export const DAYS = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"] as const;
export const PLACES = ["Bibliothek, Gruppenraum 2.14", "Mensa Süd, Fensterplätze", "Hörsaalgebäude B, Foyer", "Lernzentrum, Raum 0.08", "Online (Videokonferenz)"] as const;

export const PEOPLE: Person[] = [
  { id: ME, name: "Lena Hoffmann", study: "Wirtschaftsinformatik, 3. Semester" },
  { id: "p1", name: "Jonas Berger", study: "Informatik" },
  { id: "p2", name: "Aylin Demir", study: "Wirtschaftsinformatik" },
  { id: "p3", name: "Mats Kowalski", study: "Mathematik" },
  { id: "p4", name: "Sophie Wagner", study: "BWL" },
  { id: "p5", name: "Elias Neumann", study: "Informatik" },
  { id: "p6", name: "Mira Schulz", study: "Wirtschaftsinformatik" },
  { id: "p7", name: "Noah Krämer", study: "Mathematik" },
  { id: "p8", name: "Lea Fischer", study: "Medieninformatik" },
];
export const person = (id: string) => PEOPLE.find((p) => p.id === id)!;

function hash(s: string) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

export function seedAvailability(): Availability {
  const av: Availability = {};
  for (const p of PEOPLE) {
    av[p.id] = {};
    if (p.id === ME) continue;
    for (const d of DAYS) {
      const h = hash(p.id + d);
      const s1 = (h % 5) * 4 + 4; // 09:00–13:00 Start
      const s2 = 24 + ((h >> 4) % 4) * 4; // 14:00–17:00 Start
      av[p.id]![d] = [...range(s1, s1 + 8 + ((h >> 8) % 3) * 2), ...range(s2, s2 + 8 + ((h >> 10) % 3) * 4)].filter((x) => x < SLOTS);
    }
  }
  av[ME]![DAYS[0]] = range(8, 20);
  av[ME]![DAYS[2]] = range(24, 40);
  return av;
}

export const seedGroups = (): Group[] => [
  { id: "analysis", name: "Analysis II", course: "Klausurvorbereitung", members: [ME, "p3", "p7", "p1"],
    meeting: { date: DAYS[1], start: 24, end: 32, place: PLACES[0], attendees: [ME, "p3", "p7"], status: "bestaetigt" } },
  { id: "pm", name: "Projektmanagement", course: "Fallstudie & Präsentation", members: [ME, "p2", "p4", "p6"],
    meeting: { date: DAYS[3], start: 8, end: 14, place: PLACES[1], attendees: [ME, "p2", "p4"], status: "vorschlag" } },
  { id: "prog", name: "Programmierung", course: "Übungsblatt 6 – Java", members: [ME, "p1", "p5", "p8"] },
];

export const slotTime = (i: number) => { const m = SLOT_START_HOUR * 60 + i * 15; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };

export const statusLabel = (g: Group) => !g.meeting ? "Kein Termin" : g.meeting.status === "bestaetigt" ? "Bestätigt" : g.meeting.status === "vorschlag" ? "Vorschlag offen" : "Abgesagt";
export const statusKey = (g: Group) => g.meeting?.status ?? "offen";

export type Window = { date: string; start: number; end: number; people: string[] };

/** Gemeinsame Fenster: mind. 60 Minuten, mind. 2 Personen, die durchgehend verfügbar sind. */
export function findWindows(group: Group, av: Availability, limit = 6): Window[] {
  const out: Window[] = [];
  for (const d of DAYS) {
    const sets = range(0, SLOTS).map((s) => new Set(group.members.filter((m) => av[m]?.[d]?.includes(s))));
    for (let s = 0; s < SLOTS; s++) {
      let cur = new Set(sets[s]!);
      if (!cur.has(ME)) continue;
      for (let e = s + 1; e <= SLOTS; e++) {
        const next = e < SLOTS ? new Set([...cur].filter((x) => sets[e]!.has(x))) : new Set<string>();
        if (next.size < cur.size && e - s >= 4 && cur.size >= 2) {
          const prevSame = s > 0 && [...cur].every((x) => sets[s - 1]!.has(x));
          if (!prevSame) out.push({ date: d, start: s, end: e, people: [...cur] });
        }
        if (next.size < 2) break;
        cur = next;
      }
    }
  }
  return out.sort((a, b) => b.people.length - a.people.length || (b.end - b.start) - (a.end - a.start)).slice(0, limit);
}
