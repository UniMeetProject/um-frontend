import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Avatar, Shell } from "@/components/ui-kit";
import { DAYS, ME, person } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [
    { title: "Profil – UniMeet" },
    { name: "description", content: "Dein Profil und deine Verfügbarkeiten." },
    { property: "og:title", content: "Profil – UniMeet" },
    { property: "og:description", content: "Dein Profil und deine Verfügbarkeiten." },
  ] }),
  component: Profil,
});

function Profil() {
  const { av, groups } = useStore();
  const me = person(ME);
  const total = DAYS.reduce((n, d) => n + (av[ME]?.[d]?.length ?? 0), 0) / 4;
  return (
    <Shell>
      <div className="flex items-center gap-5">
        <Avatar name={me.name} className="h-16 w-16 text-xl" />
        <div><h1 className="text-4xl">{me.name}</h1><p className="text-sm text-muted-foreground">{me.study}</p></div>
      </div>
      <ul className="mt-10 divide-y divide-border border-y border-border">
        <li>
          <Link to="/verfuegbarkeit" className="flex items-center gap-4 py-5 hover:bg-secondary/50">
            <div className="flex-1"><p className="font-serif text-xl">Meine Verfügbarkeiten</p><p className="text-sm text-muted-foreground">{total} Stunden diese Woche markiert</p></div>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </li>
        <li className="flex items-center py-5"><div className="flex-1"><p className="font-serif text-xl">Lerngruppen</p><p className="text-sm text-muted-foreground">{groups.length} Gruppen</p></div></li>
      </ul>
      <p className="label-caps mt-10">Wochenüberblick</p>
      <ul className="mt-3 divide-y divide-border border-y border-border text-sm">
        {DAYS.map((d) => <li key={d} className="flex justify-between py-3"><span>{fmtDay(d)}</span><span className="text-muted-foreground">{(av[ME]?.[d]?.length ?? 0) / 4 || "–"} {av[ME]?.[d]?.length ? "h frei" : ""}</span></li>)}
      </ul>
    </Shell>
  );
}
