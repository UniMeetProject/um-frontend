import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Search, X } from "lucide-react";
import { Avatar, Button, Shell } from "@/components/ui-kit";
import { ME, PEOPLE, person } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/gruppen/neu")({
  head: () => ({ meta: [
    { title: "Neue Gruppe – UniMeet" },
    { name: "description", content: "Lerngruppe benennen und Mitglieder einladen." },
    { property: "og:title", content: "Neue Gruppe – UniMeet" },
    { property: "og:description", content: "Lerngruppe benennen und Mitglieder einladen." },
  ] }),
  component: NeueGruppe,
});

function NeueGruppe() {
  const { addGroup } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const results = PEOPLE.filter((p) => p.id !== ME && (p.name + p.study).toLowerCase().includes(q.trim().toLowerCase()));
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const create = () => {
    const id = name.trim().toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-") + "-" + Date.now().toString(36);
    addGroup({ id, name: name.trim(), course: course.trim() || "Lerngruppe", members: [ME, ...sel] });
    nav({ to: "/gruppen/$id", params: { id } });
  };
  return (
    <Shell>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Start</Link>
      <h1 className="mt-4 text-4xl md:text-5xl">Neue Gruppe</h1>
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <label className="block"><span className="label-caps">1 · Name der Gruppe</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Statistik Tutorium" className="mt-2 w-full border-b border-border bg-transparent py-2 font-serif text-2xl outline-none placeholder:text-muted-foreground/60 focus:border-primary" /></label>
          <label className="block"><span className="label-caps">Fach oder Ziel (optional)</span>
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="z. B. Klausur am 12. Februar" className="mt-2 w-full border-b border-border bg-transparent py-2 outline-none focus:border-primary" /></label>
          <div>
            <p className="label-caps">Ausgewählt ({sel.length + 1})</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-sm">Du</span>
              {sel.map((id) => <button key={id} onClick={() => toggle(id)} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm hover:bg-border">{person(id).name}<X className="h-3 w-3" /></button>)}
            </div>
          </div>
          <Button onClick={create} disabled={!name.trim() || sel.length === 0} className="w-full md:w-auto">Gruppe erstellen und öffnen</Button>
          {(!name.trim() || sel.length === 0) && <p className="text-xs text-muted-foreground">Gib einen Namen ein und wähle mindestens eine Person aus.</p>}
        </div>
        <div>
          <p className="label-caps">2 · Mitglieder suchen</p>
          <div className="mt-2 flex items-center gap-2 border-b border-border py-2 focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name oder Studiengang" className="flex-1 bg-transparent outline-none" />
          </div>
          {results.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Niemand gefunden für „{q}“. Prüfe die Schreibweise.</p> : (
            <ul className="divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}><button onClick={() => toggle(p.id)} aria-pressed={sel.includes(p.id)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-secondary/50">
                  <Avatar name={p.name} /><span className="flex-1"><span className="block">{p.name}</span><span className="text-sm text-muted-foreground">{p.study}</span></span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${sel.includes(p.id) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{sel.includes(p.id) && <Check className="h-3.5 w-3.5" />}</span>
                </button></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Shell>
  );
}
