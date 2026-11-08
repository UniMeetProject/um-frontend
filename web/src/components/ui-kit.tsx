import { Link } from "@tanstack/react-router";
import { CalendarDays, Home, Plus, User } from "lucide-react";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" };
export const btnClass = (variant: BtnProps["variant"] = "primary") =>
  cn("inline-flex items-center justify-center gap-2 rounded-full px-5 h-11 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-ring",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "outline" && "border border-foreground/25 text-foreground hover:bg-secondary",
    variant === "ghost" && "text-foreground hover:bg-secondary",
    variant === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90");
export function Button({ variant, className, ...p }: BtnProps) { return <button className={cn(btnClass(variant), className)} {...p} />; }

export function Wordmark() {
  return <Link to="/" className="font-serif text-2xl tracking-tight text-foreground">Uni<span className="italic text-primary">Meet</span></Link>;
}

const nav = [
  { to: "/", label: "Start", icon: Home },
  { to: "/kalender", label: "Kalender", icon: CalendarDays },
  { to: "/gruppen/neu", label: "Neue Gruppe", icon: Plus },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
          <Wordmark />
          <nav className="hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground bg-secondary" }}>{n.label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background md:hidden">
        <div className="grid grid-cols-4">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
              <n.icon className="h-5 w-5" strokeWidth={1.5} />{n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map((x) => x[0]).join("").slice(0, 2);
  return <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-xs text-foreground", className)}>{initials}</span>;
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-secondary px-6 py-10 text-center">
      <p className="font-serif text-xl">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusDot({ status }: { status: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", status === "bestaetigt" && "bg-success", status === "vorschlag" && "bg-primary", status === "abgesagt" && "bg-destructive", status === "offen" && "border border-muted-foreground")} />;
}
