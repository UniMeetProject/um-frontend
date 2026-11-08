import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Clock, MapPin } from "lucide-react";
import { AvailabilityEditor } from "@/components/AvailabilityEditor";
import { Avatar, Button, Empty, Shell, StatusDot, btnClass } from "@/components/ui-kit";
import { ME, PLACES, findWindows, person, slotTime, statusKey, statusLabel, type Window } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gruppen/$id")({
  head: () => ({ meta: [
    { title: "Lerngruppe – UniMeet" },
    { name: "description", content: "Freie Zeiten markieren und einen gemeinsamen Lerntermin finden." },
    { property: "og:title", content: "Lerngruppe – UniMeet" },
    { property: "og:description", content: "Freie Zeiten markieren und einen gemeinsamen Lerntermin finden." },
  ] }),
  component: GroupPage,
});

function GroupPage() {
  const { id } = Route.useParams();
  const { groups, av, setMeeting } = useStore();
  const g = groups.find((x) => x.id === id);
  const [pick, setPick] = useState<Window | null>(null);
  const [place, setPlace] = useState<string>(PLACES[0]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  if (!g) return <Shell><Empty title="Gruppe nicht gefunden" text="Diese Gruppe existiert nicht (mehr)." action={<Link to="/" className={btnClass("primary")}>Zur Startseite</Link>} /></Shell>;

  const windows = findWindows(g, av);
  const m = g.meeting;
  const showPlanner = !m || m.status === "abgesagt" || rescheduling;

  const propose = () => { if (!pick) return; setMeeting(g.id, { ...pick, place, attendees: pick.people, status: "vorschlag" }); setPick(null); setRescheduling(false); };

  return (
    <Shell>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Meine Gruppen</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div><p className="label-caps">{g.course}</p><h1 className="mt-2 text-4xl md:text-5xl">{g.name}</h1></div>
        <p className="flex items-center gap-2 text-sm"><StatusDot status={statusKey(g)} />{statusLabel(g)}</p>
      </div>

      {m && m.status !== "abgesagt" && !rescheduling && (
        <section className="mt-8 rounded-3xl bg-secondary p-6 md:p-8">
          <p className="label-caps">{m.status === "bestaetigt" ? "Bestätigter Termin" : "Vorschlag zur Prüfung"}</p>
          <h2 className="mt-2 text-3xl">{fmtDay(m.date)}</h2>
          <div className="mt-3 space-y-1.5 text-sm">
            <p className="flex items-center gap-2"><Clock className="h-4 w-4" strokeWidth={1.5} />{slotTime(m.start)}–{slotTime(m.end)} Uhr</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" strokeWidth={1.5} />{m.place}</p>
          </div>
          <p className="label-caps mt-5">Durchgehend verfügbar ({m.attendees.length} von {g.members.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">{m.attendees.map((a) => <span key={a} className="rounded-full bg-background px-3 py-1 text-sm">{a === ME ? "Du" : person(a).name}</span>)}</div>
          {confirmCancel ? (
            <div className="mt-6 border-t border-border pt-5">
              <p className="font-serif text-lg">Termin wirklich absagen?</p>
              <p className="text-sm text-muted-foreground">Alle Mitglieder werden informiert. Das lässt sich nicht rückgängig machen.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="danger" onClick={() => { setMeeting(g.id, { ...m, status: "abgesagt" }); setConfirmCancel(false); }}>Ja, absagen</Button>
                <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Zurück</Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {m.status === "vorschlag" && <Button onClick={() => setMeeting(g.id, { ...m, status: "bestaetigt" })}><Check className="h-4 w-4" />Termin bestätigen</Button>}
              <Button variant="outline" onClick={() => setRescheduling(true)}>Verschieben</Button>
              <Button variant="ghost" onClick={() => setConfirmCancel(true)}>Absagen</Button>
            </div>
          )}
        </section>
      )}
      {m?.status === "abgesagt" && !rescheduling && <p className="mt-6 rounded-2xl border border-border px-5 py-4 text-sm">Der Termin am {fmtDay(m.date)} wurde abgesagt. Wähle unten ein neues gemeinsames Fenster.</p>}

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="label-caps">Mitglieder</p>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {g.members.map((id) => <li key={id} className="flex items-center gap-3 py-3"><Avatar name={person(id).name} /><span className="flex-1"><span className="block">{id === ME ? "Du" : person(id).name}</span><span className="text-sm text-muted-foreground">{person(id).study}</span></span></li>)}
          </ul>

          {showPlanner && (
            <div className="mt-10">
              <div className="flex items-baseline justify-between"><p className="label-caps">Gemeinsame Fenster</p>{rescheduling && <button onClick={() => setRescheduling(false)} className="text-sm underline underline-offset-4">Abbrechen</button>}</div>
              {windows.length === 0 ? (
                <div className="mt-3"><Empty title="Noch keine Überschneidung" text="Markiere rechts deine freien Zeiten. Ab 60 Minuten mit mindestens einer weiteren Person erscheinen hier Vorschläge." /></div>
              ) : (
                <ul className="mt-3 divide-y divide-border border-y border-border">
                  {windows.map((w) => {
                    const active = pick && pick.date === w.date && pick.start === w.start && pick.end === w.end;
                    return (
                      <li key={w.date + w.start + w.end}><button onClick={() => setPick(w)} aria-pressed={!!active} className={cn("flex w-full items-center gap-4 px-2 py-4 text-left", active ? "bg-accent" : "hover:bg-secondary/50")}>
                        <span className="flex-1"><span className="block font-serif text-lg">{fmtDay(w.date)}</span><span className="text-sm text-muted-foreground">{slotTime(w.start)}–{slotTime(w.end)} Uhr · {w.people.length} von {g.members.length} Personen</span></span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </button></li>
                    );
                  })}
                </ul>
              )}
              {pick && (
                <div className="mt-6 rounded-3xl bg-secondary p-6">
                  <p className="label-caps">Vorschlag prüfen</p>
                  <p className="mt-2 font-serif text-2xl">{fmtDay(pick.date)}, {slotTime(pick.start)}–{slotTime(pick.end)}</p>
                  <label className="mt-4 block text-sm"><span className="label-caps">Treffpunkt</span>
                    <select value={place} onChange={(e) => setPlace(e.target.value)} className="mt-2 w-full rounded-full border border-border bg-background px-4 py-2.5">{PLACES.map((p) => <option key={p}>{p}</option>)}</select></label>
                  <p className="label-caps mt-4">Durchgehend verfügbar</p>
                  <div className="mt-2 flex flex-wrap gap-2">{pick.people.map((a) => <span key={a} className="rounded-full bg-background px-3 py-1 text-sm">{a === ME ? "Du" : person(a).name}</span>)}</div>
                  {pick.people.length < g.members.length && <p className="mt-2 text-xs text-muted-foreground">Nicht dabei: {g.members.filter((x) => !pick.people.includes(x)).map((x) => person(x).name).join(", ")}</p>}
                  <Button className="mt-5 w-full" onClick={propose}>Vorschlag an Gruppe senden</Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="label-caps">Meine freien Zeiten</p>
          <div className="mt-3"><AvailabilityEditor /></div>
        </div>
      </div>
    </Shell>
  );
}
