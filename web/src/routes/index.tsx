import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Clock, MapPin, Plus, Users } from "lucide-react";
import campus from "@/assets/campus.jpg";
import { Avatar, Empty, Shell, StatusDot, btnClass } from "@/components/ui-kit";
import { person, slotTime, statusKey, statusLabel } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "UniMeet – Dein Campusplaner" },
    { name: "description", content: "Nächstes Lerntreffen, deine Lerngruppen und gemeinsame Zeiten auf einen Blick." },
    { property: "og:title", content: "UniMeet – Dein Campusplaner" },
    { property: "og:description", content: "Nächstes Lerntreffen, deine Lerngruppen und gemeinsame Zeiten auf einen Blick." },
  ] }),
  component: Index,
});

const FILTERS = [
  { key: "alle", label: "Alle" }, { key: "bestaetigt", label: "Bestätigt" },
  { key: "vorschlag", label: "Vorschlag offen" }, { key: "offen", label: "Kein Termin" }, { key: "abgesagt", label: "Abgesagt" },
];

function Index() {
  const { groups } = useStore();
  const [filter, setFilter] = useState("alle");
  const next = groups.filter((g) => g.meeting?.status === "bestaetigt")
    .sort((a, b) => (a.meeting!.date + a.meeting!.start).localeCompare(b.meeting!.date + b.meeting!.start))[0];
  const shown = groups.filter((g) => filter === "alle" || statusKey(g) === filter);

  return (
    <Shell>
      <section className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <p className="label-caps">Wintersemester 2026/27 · KW 46</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-6xl">Guten Morgen, Lena.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">Finde mit deinen Lerngruppen Zeiten, die für alle passen – ohne endlose Nachrichten.</p>

          <div className="mt-8 border-t border-border pt-6">
            <p className="label-caps">Nächstes Lerntreffen</p>
            {next ? (
              <Link to="/gruppen/$id" params={{ id: next.id }} className="group mt-3 block">
                <h2 className="text-3xl group-hover:text-primary">{next.name}</h2>
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" strokeWidth={1.5} />{fmtDay(next.meeting!.date)} · {slotTime(next.meeting!.start)}–{slotTime(next.meeting!.end)} Uhr</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" strokeWidth={1.5} />{next.meeting!.place}</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" strokeWidth={1.5} />{next.meeting!.attendees.map((a) => person(a).name.split(" ")[0]).join(", ")}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">Termin ansehen <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Noch kein bestätigtes Treffen. Öffne eine Gruppe und finde ein gemeinsames Zeitfenster.</p>
            )}
          </div>
        </div>
        <img src={campus} alt="Illustration: Studierende lernen auf dem Campus mit Kalender und Büchern" width={1024} height={1024} className="aspect-square w-full rounded-3xl object-cover" />
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div><p className="label-caps">Übersicht</p><h2 className="mt-2 text-3xl">Meine Gruppen</h2></div>
          <Link to="/gruppen/neu" className={btnClass("primary")}><Plus className="h-4 w-4" />Neue Gruppe</Link>
        </div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
              className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm", filter === f.key ? "border-forest bg-forest text-forest-foreground" : "border-border hover:bg-secondary")}>{f.label}</button>
          ))}
        </div>
        <div className="mt-4">
          {shown.length === 0 ? (
            <Empty title="Keine Gruppen in dieser Ansicht" text="Wähle einen anderen Filter oder lege eine neue Lerngruppe an." action={<button onClick={() => setFilter("alle")} className={btnClass("outline")}>Alle anzeigen</button>} />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {shown.map((g) => (
                <li key={g.id}>
                  <Link to="/gruppen/$id" params={{ id: g.id }} className="flex items-center gap-4 py-5 hover:bg-secondary/50 md:px-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xl">{g.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{g.course} · {g.members.length} Personen</p>
                    </div>
                    <div className="hidden -space-x-2 sm:flex">{g.members.slice(0, 4).map((m) => <Avatar key={m} name={person(m).name} className="ring-2 ring-background" />)}</div>
                    <div className="w-36 text-right text-sm">
                      <p className="flex items-center justify-end gap-2"><StatusDot status={statusKey(g)} />{statusLabel(g)}</p>
                      {g.meeting && g.meeting.status !== "abgesagt" && <p className="text-xs text-muted-foreground">{fmtDay(g.meeting.date).split(",")[0]}, {slotTime(g.meeting.start)} Uhr</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Shell>
  );
}
