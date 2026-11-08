import { createContext, useContext, useState, type ReactNode } from "react";
import { seedAvailability, seedGroups, ME, type Availability, type Group, type Meeting } from "./data";

type Store = {
  groups: Group[]; av: Availability;
  addGroup: (g: Group) => void;
  setMeeting: (id: string, m: Meeting | undefined) => void;
  setMySlots: (date: string, slots: number[]) => void;
};
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState(seedGroups);
  const [av, setAv] = useState(seedAvailability);
  const store: Store = {
    groups, av,
    addGroup: (g) => setGroups((gs) => [...gs, g]),
    setMeeting: (id, m) => setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, meeting: m } : g))),
    setMySlots: (date, slots) => setAv((a) => ({ ...a, [ME]: { ...a[ME], [date]: [...new Set(slots)].sort((x, y) => x - y) } })),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
export const useStore = () => { const s = useContext(Ctx); if (!s) throw new Error("StoreProvider fehlt"); return s; };
