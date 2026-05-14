import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: string;
  accent?: "cyan" | "emerald" | "violet" | "amber" | "danger";
  className?: string;
}

export function MetricCard({ label, value, hint, icon: Icon, trend, accent = "cyan", className }: Props) {
  const accentMap = {
    cyan: "text-cyan",
    emerald: "text-emerald",
    violet: "text-violet",
    amber: "text-amber",
    danger: "text-danger",
  };
  return (
    <div className={cn("group relative overflow-hidden rounded-xl glass p-5 transition-all hover:border-cyan/40", className)}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40" style={{ background: `radial-gradient(circle, var(--${accent}), transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg border border-border/60 bg-background/60 p-2", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {trend && (
        <div className={cn("mt-3 inline-flex items-center gap-1 text-xs", accentMap[accent])}>
          <ArrowUpRight className="h-3 w-3" />
          {trend}
        </div>
      )}
    </div>
  );
}
