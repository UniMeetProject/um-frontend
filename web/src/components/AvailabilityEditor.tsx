import { useState } from "react";
import { DAYS, ME, SLOTS, SLOT_START_HOUR, slotTime } from "@/lib/data";
import { useStore } from "@/lib/store";
import { fmtShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AvailabilityEditor() {
  const { av, setMySlots } = useStore();
  const [day, setDay] = useState<string>(DAYS[0]);
  const mine = av[ME]?.[day] ?? [];
  const set = new Set(mine);
  const toggle = (slots: number[], on: boolean) => {
    const next = new Set(mine);
    slots.forEach((s) => (on ? next.add(s) : next.delete(s)));
    setMySlots(day, [...next]);
  };
  const hours = Array.from({ length: SLOTS / 4 }, (_, h) => h);
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Tag wählen">
        {DAYS.map((d) => {
          const n = (av[ME]?.[d] ?? []).length;
          return (
            <button key={d} role="tab" aria-selected={d === day} onClick={() => setDay(d)}
              className={cn("shrink-0 rounded-full border px-4 py-2 text-sm", d === day ? "border-forest bg-forest text-forest-foreground" : "border-border text-foreground hover:bg-secondary")}>
              {fmtShort(d)}{n > 0 && <span className="ml-2 text-xs opacity-70">{n * 15 / 60} h</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Tippe auf 15-Minuten-Blöcke oder markiere mit „Stunde“ die ganze Stunde. Deine Auswahl bleibt beim Tageswechsel erhalten.</p>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {hours.map((h) => {
          const slots = [0, 1, 2, 3].map((q) => h * 4 + q);
          const full = slots.every((s) => set.has(s));
          return (
            <div key={h} className="flex items-center gap-3 py-2">
              <span className="w-12 text-xs tabular-nums text-muted-foreground">{String(SLOT_START_HOUR + h).padStart(2, "0")}:00</span>
              <div className="grid flex-1 grid-cols-4 gap-1">
                {slots.map((s) => (
                  <button key={s} aria-pressed={set.has(s)} aria-label={`${slotTime(s)} bis ${slotTime(s + 1)}`} onClick={() => toggle([s], !set.has(s))}
                    className={cn("h-8 rounded-md transition-colors", set.has(s) ? "bg-success" : "bg-secondary hover:bg-border")} />
                ))}
              </div>
              <button onClick={() => toggle(slots, !full)} className={cn("w-20 rounded-full border px-2 py-1 text-xs", full ? "border-success text-success" : "border-border text-muted-foreground hover:text-foreground")}>
                {full ? "Frei ✓" : "Stunde"}
              </button>
            </div>
          );
        })}
      </div>
      {mine.length > 0 && <button onClick={() => setMySlots(day, [])} className="mt-3 text-sm text-muted-foreground underline underline-offset-4">Auswahl für diesen Tag löschen</button>}
    </div>
  );
}
