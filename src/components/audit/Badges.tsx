import { cn } from "@/lib/utils";
import type { Severity, ScanStatus } from "@/lib/auditApi";
import { AlertTriangle, CheckCircle2, Clock, Loader2, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";

const sevStyle: Record<Severity, string> = {
  critical: "bg-danger/15 text-danger border-danger/40",
  high: "bg-amber/15 text-amber border-amber/40",
  medium: "bg-cyan/15 text-cyan border-cyan/40",
  low: "bg-emerald/10 text-emerald border-emerald/40",
  info: "bg-muted text-muted-foreground border-border",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", sevStyle[severity])}>
      <ShieldAlert className="h-3 w-3" />
      {severity}
    </span>
  );
}

const statusStyle: Record<ScanStatus, { cls: string; icon: any; label: string }> = {
  pending: { cls: "bg-muted text-muted-foreground border-border", icon: Clock, label: "Pending" },
  running: { cls: "bg-cyan/15 text-cyan border-cyan/40", icon: Loader2, label: "Running" },
  completed: { cls: "bg-emerald/15 text-emerald border-emerald/40", icon: CheckCircle2, label: "Completed" },
  failed: { cls: "bg-danger/15 text-danger border-danger/40", icon: XCircle, label: "Failed" },
};

export function StatusBadge({ status }: { status: ScanStatus }) {
  const s = statusStyle[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium", s.cls)}>
      <Icon className={cn("h-3.5 w-3.5", status === "running" && "animate-spin")} />
      {s.label}
    </span>
  );
}

export function RiskScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const level = score >= 70 ? "critical" : score >= 40 ? "high" : score >= 20 ? "medium" : "low";
  const cls =
    level === "critical" ? "from-danger to-danger/60 text-danger" :
    level === "high" ? "from-amber to-amber/60 text-amber" :
    level === "medium" ? "from-cyan to-cyan/60 text-cyan" :
    "from-emerald to-emerald/60 text-emerald";
  const sizeCls = size === "lg" ? "h-20 w-20 text-2xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-14 w-14 text-base";
  return (
    <div className={cn("relative grid place-items-center rounded-full border border-border bg-background font-mono font-semibold", sizeCls)}>
      <div className={cn("absolute inset-0 rounded-full bg-gradient-to-br opacity-20", cls)} />
      <div className={cn("relative", cls.split(" ").slice(-1))}>{score}</div>
    </div>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    domain: "bg-cyan/15 text-cyan border-cyan/30",
    ip: "bg-violet/15 text-violet border-violet/30",
    api: "bg-emerald/15 text-emerald border-emerald/30",
    smart_contract: "bg-amber/15 text-amber border-amber/30",
    solana_program: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", styles[type] || "bg-muted text-muted-foreground border-border")}>
      {type}
    </span>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald/40 bg-emerald/15 px-2 py-0.5 text-[11px] text-emerald">
      <ShieldCheck className="h-3.5 w-3.5" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/15 px-2 py-0.5 text-[11px] text-amber">
      <AlertTriangle className="h-3.5 w-3.5" /> Pending
    </span>
  );
}
