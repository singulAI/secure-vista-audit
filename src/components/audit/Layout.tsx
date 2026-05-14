import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Crosshair, ScanSearch, Vault, Link2, FileText, Settings, ShieldCheck, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/singulai-logo.jpeg";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/targets", label: "Targets", icon: Crosshair },
  { to: "/scans", label: "Scans", icon: ScanSearch },
  { to: "/evidence", label: "Evidence Vault", icon: Vault },
  { to: "/onchain", label: "On-chain Proofs", icon: Link2 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border/60 bg-surface/80 backdrop-blur-xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <img src={logo} alt="SingulAI" className="h-9 w-9 rounded-md object-cover ring-1 ring-cyan/40" />
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold tracking-wide">SingulAI</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan">Audit Center</div>
            </div>
          </Link>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground md:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-5 mt-4 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-[10px] uppercase tracking-wider text-cyan">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Independent Security Module
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3 scrollbar-thin overflow-y-auto">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-gradient-to-r from-cyan/15 to-violet/10 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-cyan" />}
                <n.icon className={cn("h-4 w-4", active && "text-cyan")} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-4 text-[10px] leading-relaxed text-muted-foreground">
          <div className="font-mono text-[10px] text-muted-foreground/70">v1.0 · audit.singulai.site</div>
          <div className="mt-1">DEV — rodrigo.run</div>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const [health, setHealth] = useState<"checking" | "online" | "mock">("checking");
  useEffect(() => {
    import("@/lib/auditApi").then(({ getHealth, onMockChange, isMockMode }) => {
      getHealth().then(h => setHealth(h.mock ? "mock" : "online"));
      const off = onMockChange((m) => setHealth(m ? "mock" : "online"));
      setHealth(isMockMode() ? "mock" : "online");
      return () => off();
    });
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <button className="rounded-md border border-border p-2 text-muted-foreground md:hidden" onClick={onMenu}>
        <Menu className="h-4 w-4" />
      </button>

      <div className="hidden md:block">
        <div className="font-display text-sm font-medium">Security Operations</div>
        <div className="text-[11px] text-muted-foreground">Audit · Evidence · On-chain proofs</div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className={cn(
          "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium sm:flex",
          health === "online" && "border-emerald/40 bg-emerald/10 text-emerald",
          health === "mock" && "border-amber/40 bg-amber/10 text-amber",
          health === "checking" && "border-border bg-surface text-muted-foreground",
        )}>
          <span className={cn(
            "h-1.5 w-1.5 rounded-full pulse-dot",
            health === "online" && "bg-emerald",
            health === "mock" && "bg-amber",
            health === "checking" && "bg-muted-foreground",
          )} />
          {health === "online" ? "API Online" : health === "mock" ? "Mock Mode" : "Checking…"}
        </div>
        <div className="rounded-full border border-violet/40 bg-violet/10 px-3 py-1.5 text-[11px] font-medium text-violet">
          SOC · L2
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground">
      DEV — rodrigo.run © 2026 SingulAI — Todos os direitos reservados
    </footer>
  );
}
