import { createFileRoute, Link } from "@tanstack/react-router";
import { Empty, Shell, StatusDot, btnClass } from "@/components/ui-kit";
import { DAYS, slotTime, statusLabel } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/kalender")({
  head: () => ({ meta: [
    { title: "Kalender – UniMeet" },
    { name: "description", content: "Alle Lerntermine dieser Woche, nach Tagen gruppiert." },
    { property: "og:title", content: "Kalender – UniMeet" },
    { property: "og:description", content: "Alle Lerntermine dieser Woche, nach Tagen gruppiert." },
  ] }),
  component: Kalender,
});

function Kalender() {
  const { groups } = useStore();
  const withMeeting = groups.filter((g) => g.meeting);
  return (
    <Shell>
      <p className="label-caps">9.–13. November</p>
      <h1 className="mt-2 text-4xl md:text-5xl">Kalender</h1>
      <div className="mt-10 space-y-10">
        {withMeeting.length === 0 && <Empty title="Noch keine Termine" text="Sobald du in einer Gruppe einen Termin vorschlägst oder bestätigst, erscheint er hier." action={<Link to="/" className={btnClass("primary")}>Zu meinen Gruppen</Link>} />}
        {withMeeting.length > 0 && DAYS.map((d) => {
          const items = withMeeting.filter((g) => g.meeting!.date === d).sort((a, b) => a.meeting!.start - b.meeting!.start);
          return (
            <section key={d}>
              <p className="label-caps">{fmtDay(d)}</p>
              {items.length === 0 ? <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">Keine Termine</p> : (
                <ul className="mt-3 divide-y divide-border border-y border-border">
                  {items.map((g) => (
                    <li key={g.id}>
                      <Link to="/gruppen/$id" params={{ id: g.id }} className="flex items-baseline gap-5 py-4 hover:bg-secondary/50">
                        <span className="w-24 text-sm tabular-nums">{slotTime(g.meeting!.start)}–{slotTime(g.meeting!.end)}</span>
                        <span className="flex-1"><span className={`font-serif text-lg ${g.meeting!.status === "abgesagt" ? "line-through opacity-60" : ""}`}>{g.name}</span><span className="block text-sm text-muted-foreground">{g.meeting!.place}</span></span>
                        <span className="flex items-center gap-2 text-sm"><StatusDot status={g.meeting!.status} />{statusLabel(g)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
