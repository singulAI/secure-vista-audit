import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ScanSearch, Play, Search, Filter } from "lucide-react";
import { SectionHeader, EmptyState, LoadingState } from "@/components/audit/States";
import { StatusBadge, RiskScoreBadge, TypeBadge } from "@/components/audit/Badges";
import { MetricCard } from "@/components/audit/MetricCard";
import { listScans, listTargets, createScan, formatDate, type Scan, type Target, type ScanStatus } from "@/lib/auditApi";

export const Route = createFileRoute("/scans")({
  head: () => ({ meta: [{ title: "Scans — SingulAI Audit Center" }] }),
  component: ScansPage,
});

const statuses: (ScanStatus | "all")[] = ["all", "pending", "running", "completed", "failed"];

function ScansPage() {
  const [scans, setScans] = useState<Scan[] | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ScanStatus | "all">("all");
  const [q, setQ] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    listScans().then(setScans);
    listTargets().then(t => { setTargets(t); setSelected(t[0]?.id ?? null); });
  }, []);

  const filtered = useMemo(() => {
    if (!scans) return [];
    return scans.filter(s => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !`${s.id} ${s.target?.name ?? ""} ${s.target?.value ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [scans, statusFilter, q]);

  async function start() {
    if (!selected) return;
    setStarting(true);
    const ns = await createScan(selected);
    setScans((prev) => prev ? [ns, ...prev] : [ns]);
    setStarting(false);
  }

  const total = scans?.length ?? 0;
  const completed = scans?.filter(s => s.status === "completed").length ?? 0;
  const running = scans?.filter(s => s.status === "running").length ?? 0;
  const failed = scans?.filter(s => s.status === "failed").length ?? 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="Audit Scans" description="Execute and review audit operations" icon={ScanSearch} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total" value={total} icon={ScanSearch} accent="cyan" />
        <MetricCard label="Completed" value={completed} accent="emerald" />
        <MetricCard label="Running" value={running} accent="violet" />
        <MetricCard label="Failed" value={failed} accent="danger" />
      </div>

      {/* Launcher */}
      <div className="rounded-xl glass p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Target</label>
            <select
              value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm focus:border-cyan/60"
            >
              {targets.map(t => <option key={t.id} value={t.id}>{t.name} ({t.target_type})</option>)}
            </select>
          </div>
          <button
            onClick={start} disabled={!selected || starting}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/15 px-5 py-2.5 text-sm font-medium text-cyan transition-all hover:bg-cyan/25 active:scale-95 disabled:opacity-60"
          >
            <Play className="h-4 w-4" /> {starting ? "Starting…" : "Start Scan"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, target name, value…"
            className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan/60"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {statuses.map(s => (
            <button
              key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${statusFilter === s ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-border bg-surface text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {!scans ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="No scans match your filters" />
      ) : (
        <div className="grid gap-3">
          {filtered.map(s => (
            <Link
              key={s.id} to="/scans/$id" params={{ id: String(s.id) }}
              className="group flex flex-col gap-4 rounded-xl glass p-4 transition-all hover:border-cyan/40 sm:flex-row sm:items-center"
            >
              <RiskScoreBadge score={s.risk_score} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-cyan">SCAN #{s.id}</span>
                  <span className="font-medium">{s.target?.name ?? "—"}</span>
                  {s.target && <TypeBadge type={s.target.target_type} />}
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  Started {formatDate(s.started_at)} · {s.findings.length} findings · {s.evidence.length} evidence · {s.onchain_verifications.length} on-chain
                </div>
              </div>
              <StatusBadge status={s.status} />
              <div className="text-xs text-cyan transition-transform group-hover:translate-x-1">Open →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
