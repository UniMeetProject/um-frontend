import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AvailabilityEditor } from "@/components/AvailabilityEditor";
import { Shell } from "@/components/ui-kit";

export const Route = createFileRoute("/verfuegbarkeit")({
  head: () => ({ meta: [
    { title: "Meine Verfügbarkeiten – UniMeet" },
    { name: "description", content: "Markiere deine freien Zeiten in 15-Minuten-Blöcken." },
    { property: "og:title", content: "Meine Verfügbarkeiten – UniMeet" },
    { property: "og:description", content: "Markiere deine freien Zeiten in 15-Minuten-Blöcken." },
  ] }),
  component: () => (
    <Shell>
      <Link to="/profil" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Profil</Link>
      <h1 className="mt-4 text-4xl">Meine Verfügbarkeiten</h1>
      <p className="mt-2 text-muted-foreground">Gilt für alle deine Gruppen.</p>
      <div className="mt-8 max-w-2xl"><AvailabilityEditor /></div>
    </Shell>
  ),
});
