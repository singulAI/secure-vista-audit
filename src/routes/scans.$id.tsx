import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, Copy, ShieldCheck, Calendar, AlertTriangle, Vault, Link2 } from "lucide-react";
import { LoadingState, EmptyState, SectionHeader } from "@/components/audit/States";
import { RiskScoreBadge, StatusBadge, SeverityBadge, TypeBadge, VerifiedBadge } from "@/components/audit/Badges";
import { HashBlock } from "@/components/audit/HashBlock";
import { CopyButton } from "@/components/audit/CopyButton";
import { MetricCard } from "@/components/audit/MetricCard";
import { getScan, formatDate, shortHash, type Scan } from "@/lib/auditApi";

export const Route = createFileRoute("/scans/$id")({
  head: ({ params }) => ({ meta: [{ title: `Scan #${params.id} — SingulAI Audit Center` }] }),
  component: ScanDetail,
});

function ScanDetail() {
  const { id } = Route.useParams();
  const [scan, setScan] = useState<Scan | null | undefined>(null);

  useEffect(() => { getScan(Number(id)).then((s) => setScan(s ?? undefined)); }, [id]);

  if (scan === null) return <LoadingState label="Loading scan details…" />;
  if (!scan) return <EmptyState title="Scan not found" description={`No audit scan with ID #${id}`} />;

  function exportJson() {
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `scan-${id}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Link to="/scans" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to scans
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl glass-strong p-6">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <RiskScoreBadge score={scan.risk_score} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan">SCAN</span>
                <span className="font-display text-2xl font-semibold">#{scan.id}</span>
                <StatusBadge status={scan.status} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="font-medium">{scan.target?.name ?? `Target #${scan.target_id}`}</span>
                {scan.target && <TypeBadge type={scan.target.target_type} />}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Started {formatDate(scan.started_at)}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Completed {formatDate(scan.completed_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm hover:border-cyan/50 active:scale-95">
              <Download className="h-4 w-4" /> Export JSON
            </button>
            <Link to="/reports" className="inline-flex items-center gap-1.5 rounded-md border border-violet/40 bg-violet/10 px-3 py-2 text-sm text-violet hover:bg-violet/20 active:scale-95">
              <FileText className="h-4 w-4" /> Generate Report
            </Link>
            <CopyButton value={JSON.stringify(scan)} label="Copy Hash" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Findings" value={scan.findings.length} icon={AlertTriangle} accent="amber" />
        <MetricCard label="Evidence" value={scan.evidence.length} icon={Vault} accent="violet" />
        <MetricCard label="On-chain" value={scan.onchain_verifications.length} icon={Link2} accent="cyan" />
        <MetricCard label="Risk Score" value={scan.risk_score} icon={ShieldCheck} accent={scan.risk_score > 50 ? "danger" : "emerald"} />
      </div>

      {/* Findings */}
      <section className="rounded-xl glass p-5">
        <SectionHeader title="Findings" description="Issues detected during audit execution" icon={AlertTriangle} />
        {scan.findings.length === 0 ? <EmptyState title="No findings" description="No issues were detected." /> : (
          <div className="space-y-3">
            {scan.findings.map(f => (
              <div key={f.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{f.title}</div>
                  <SeverityBadge severity={f.severity} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                <div className="mt-3 rounded-md border border-cyan/20 bg-cyan/5 p-3 text-xs text-cyan/90">
                  <span className="font-semibold uppercase tracking-wider">Recommendation: </span>{f.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Evidence */}
      <section className="rounded-xl glass p-5">
        <SectionHeader title="Evidence" description="Cryptographically hashed artifacts (stored outside the core)" icon={Vault} />
        {scan.evidence.length === 0 ? <EmptyState title="No evidence captured" /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {scan.evidence.map(e => (
              <div key={e.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">{e.filename}</div>
                  <VerifiedBadge verified />
                </div>
                <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{e.storage_uri}</div>
                <div className="mt-3"><HashBlock hash={e.sha256} /></div>
                <div className="mt-2 text-xs text-muted-foreground">{formatDate(e.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* On-chain */}
      <section className="rounded-xl glass p-5">
        <SectionHeader title="On-chain Verifications" description="Blockchain proofs of audit integrity" icon={Link2} />
        {scan.onchain_verifications.length === 0 ? <EmptyState title="No on-chain proofs yet" /> : (
          <div className="space-y-2">
            {scan.onchain_verifications.map(o => (
              <div key={o.id} className="grid gap-3 rounded-lg border border-border/60 bg-background/40 p-4 md:grid-cols-[auto,1fr,auto] md:items-center">
                <div className="inline-flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface font-mono text-[10px] uppercase text-cyan">{o.chain.slice(0, 3)}</div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider">{o.chain}</div>
                    <div className="text-[10px] text-muted-foreground">{formatDate(o.timestamp)}</div>
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">tx</span>
                    <span className="font-mono text-xs">{shortHash(o.tx_hash, 10)}</span>
                    <CopyButton value={o.tx_hash} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground">proof</span>
                    <span className="font-mono text-xs">{shortHash(o.proof_hash, 10)}</span>
                    <CopyButton value={o.proof_hash} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VerifiedBadge verified={o.verified} />
                  <button className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs hover:border-cyan/60 active:scale-95">Validate proof</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
