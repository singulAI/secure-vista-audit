import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Crosshair, ScanSearch, Vault, Link2, FileText, Settings, ShieldCheck, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/singulai-logo.jpeg";
import { LanguageSwitch, useT } from "@/lib/i18n";
import { useUI } from "@/lib/uiState";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useT();
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const collapsed = sidebarCollapsed;

  const nav = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/targets", label: t("nav.targets"), icon: Crosshair },
    { to: "/scans", label: t("nav.scans"), icon: ScanSearch },
    { to: "/evidence", label: t("nav.evidence"), icon: Vault },
    { to: "/onchain", label: t("nav.onchain"), icon: Link2 },
    { to: "/reports", label: t("nav.reports"), icon: FileText },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/60 bg-surface/85 backdrop-blur-xl transition-[width,transform] duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-72 md:w-[68px]" : "w-72",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-border/60", collapsed ? "md:justify-center md:px-0 px-5 justify-between" : "px-5 justify-between")}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
            <img src={logo} alt="SingulAI" className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-cyan/40" />
            <div className={cn("leading-tight overflow-hidden transition-all", collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100")}>
              <div className="font-display text-sm font-semibold tracking-[0.18em] whitespace-nowrap">SINGULAI</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan whitespace-nowrap">{t("brand.subtitle")}</div>
            </div>
          </Link>
          <button className="rounded-md border border-border p-1.5 text-muted-foreground md:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!collapsed && (
          <div className="mx-4 mt-4 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-[10px] uppercase tracking-wider text-cyan">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t("sidebar.module")}</span>
            </div>
          </div>
        )}

        <nav className={cn("mt-4 flex-1 space-y-1 overflow-y-auto scrollbar-thin", collapsed ? "px-2" : "px-3")}>
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={onClose}
                title={collapsed ? n.label : undefined}
                className={cn(
                  "group relative flex items-center rounded-lg text-sm transition-all",
                  collapsed ? "md:justify-center md:px-0 md:py-2.5 gap-3 px-3 py-2.5" : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-gradient-to-r from-cyan/15 to-violet/10 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-cyan" />}
                <n.icon className={cn("h-4 w-4 shrink-0", active && "text-cyan")} />
                <span className={cn("truncate", collapsed && "md:hidden")}>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t border-border/60 p-3 text-[10px] leading-relaxed text-muted-foreground", collapsed && "md:px-2")}>
          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden w-full items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:border-cyan/40 hover:text-cyan md:flex",
              collapsed && "md:justify-center md:px-0",
            )}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
          </button>
          {!collapsed && (
            <>
              <div className="mt-3"><LanguageSwitch /></div>
              <div className="mt-3 font-mono text-[10px] text-muted-foreground/70 truncate">v1.0 · audit.singulai.site</div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { t } = useT();
  const { sidebarCollapsed, toggleSidebar } = useUI();
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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/60 bg-background/75 px-3 backdrop-blur-xl sm:h-16 sm:gap-3 sm:px-4 md:px-6">
      <button className="rounded-md border border-border p-2 text-muted-foreground md:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-4 w-4" />
      </button>
      <button
        className="hidden rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-cyan/40 hover:text-cyan md:inline-flex"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <div className="hidden min-w-0 md:block">
        <div className="font-display text-sm font-medium tracking-wide truncate">{t("topbar.title")}</div>
        <div className="text-[11px] text-muted-foreground truncate">{t("topbar.subtitle")}</div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <LanguageSwitch />
        <div className={cn(
          "hidden items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium md:flex",
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
          {health === "online" ? t("topbar.online") : health === "mock" ? t("topbar.mock") : t("topbar.checking")}
        </div>
        <div className="hidden rounded-full border border-violet/40 bg-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet sm:inline-flex">
          SOC · L2
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-border/60 px-4 py-4 text-center text-[11px] text-muted-foreground sm:text-xs md:px-6">
      {t("footer")}
    </footer>
  );
}
