import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Avatar, Shell } from "@/components/ui-kit";
import { DAYS, ME } from "@/lib/data";
import { fmtDay } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { Button } from "@/components/ui-kit";

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
  const { user, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const { av, groups } = useStore();
  const me = { name: user?.username ?? user?.email.split('@')[0] ?? 'Mein Konto', study: user?.email ?? '' };
  const total = DAYS.reduce((n, d) => n + (av[ME]?.[d]?.length ?? 0), 0) / 4;
  return (
    <Shell>
      <div className="flex items-center gap-5">
        <Avatar name={me.name} className="h-16 w-16 text-xl" />
        <div className="min-w-0 break-words"><h1 className="text-4xl">{me.name}</h1><p className="text-sm text-muted-foreground">{me.study}</p></div>
      </div>
      <div className="mt-6">
        <Button variant="outline" disabled={pending} onClick={async () => {
          setPending(true); setError('');
          try { await logout(); } catch (error) { setError(error instanceof Error ? error.message : 'Abmelden fehlgeschlagen.'); }
          finally { setPending(false); }
        }}>{pending ? 'Wird abgemeldet …' : 'Abmelden'}</Button>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
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
