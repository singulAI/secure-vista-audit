import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Download, FileJson, Sparkles, Eye } from "lucide-react";
import { SectionHeader, LoadingState, EmptyState } from "@/components/audit/States";
import { RiskScoreBadge, StatusBadge, TypeBadge } from "@/components/audit/Badges";
import { HashBlock } from "@/components/audit/HashBlock";
import { listScans, formatDate, shortHash, type Scan } from "@/lib/auditApi";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — SingulAI Audit Center" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [scans, setScans] = useState<Scan[] | null>(null);
  const [active, setActive] = useState<Scan | null>(null);
  useEffect(() => { listScans().then(s => { setScans(s); setActive(s.find(x => x.status === "completed") ?? s[0] ?? null); }); }, []);

  function exportJson(s: Scan) {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${s.id}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!scans) return <LoadingState />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Reports" description="Export and review audit reports" icon={FileText} />

      <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        {/* List */}
        <div className="space-y-2">
          {scans.length === 0 ? <EmptyState title="No reports" /> : scans.map(s => (
            <button
              key={s.id} onClick={() => setActive(s)}
              className={`w-full text-left rounded-xl glass p-4 transition-all ${active?.id === s.id ? "border-cyan/60 ring-1 ring-cyan/40" : "hover:border-cyan/40"}`}
            >
              <div className="flex items-center gap-4">
                <RiskScoreBadge score={s.risk_score} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan">#{s.id}</span>
                    <span className="truncate font-medium">{s.target?.name ?? "—"}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {s.target && <TypeBadge type={s.target.target_type} />}
                    <span>{formatDate(s.started_at)}</span>
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            </button>
          ))}
        </div>

        {/* Preview */}
        {active && (
          <div className="rounded-xl glass-strong p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Audit Report</div>
                <div className="mt-1 font-display text-xl font-semibold">{active.target?.name ?? `Scan #${active.id}`}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => exportJson(active)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs hover:border-cyan/60 active:scale-95">
                  <FileJson className="h-3.5 w-3.5" /> Export JSON
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-violet/40 bg-violet/10 px-3 py-1.5 text-xs text-violet hover:bg-violet/20 active:scale-95">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/20 active:scale-95">
                  <Sparkles className="h-3.5 w-3.5" /> Executive Summary
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Risk" value={active.risk_score} />
              <Stat label="Findings" value={active.findings.length} />
              <Stat label="Evidence" value={active.evidence.length} />
              <Stat label="On-chain" value={active.onchain_verifications.length} />
            </div>

            {active.evidence[0] && (
              <div className="mt-5">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Evidence root hash</div>
                <HashBlock hash={active.evidence[0].sha256} />
              </div>
            )}

            {active.onchain_verifications[0] && (
              <div className="mt-3">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">On-chain proof</div>
                <div className="rounded-md border border-border/60 bg-background/60 px-3 py-2 font-mono text-[11px]">
                  <span className="text-cyan">{active.onchain_verifications[0].chain}</span> · tx {shortHash(active.onchain_verifications[0].tx_hash, 8)} · proof {shortHash(active.onchain_verifications[0].proof_hash, 8)}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Findings</div>
              {active.findings.length === 0 ? <div className="text-sm text-muted-foreground">No findings.</div> : (
                <ul className="space-y-1.5 text-sm">
                  {active.findings.map(f => (
                    <li key={f.id} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                      <span><span className="font-medium">{f.title}</span> <span className="text-muted-foreground">— {f.recommendation}</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Link to="/scans/$id" params={{ id: String(active.id) }} className="inline-flex items-center gap-1.5 text-xs text-cyan hover:underline">
                <Eye className="h-3.5 w-3.5" /> Open full scan
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}
