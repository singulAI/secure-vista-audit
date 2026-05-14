import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link2, RefreshCw, BookOpen } from "lucide-react";
import { SectionHeader, LoadingState, EmptyState } from "@/components/audit/States";
import { VerifiedBadge } from "@/components/audit/Badges";
import { CopyButton } from "@/components/audit/CopyButton";
import { allOnchain, formatDate, shortHash, listScans } from "@/lib/auditApi";

export const Route = createFileRoute("/onchain")({
  head: () => ({ meta: [{ title: "On-chain Proofs — SingulAI Audit Center" }] }),
  component: OnchainPage,
});

function OnchainPage() {
  const [items, setItems] = useState<ReturnType<typeof allOnchain> | null>(null);
  useEffect(() => { listScans().then(() => setItems(allOnchain())); }, []);

  const solana = items?.filter(i => i.chain === "solana") ?? [];
  const evm = items?.filter(i => i.chain !== "solana") ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader title="On-chain Proofs" description="Immutable verifications anchored on public blockchains" icon={Link2} />

      <div className="grid gap-4 md:grid-cols-2">
        <ChainCard title="Solana" subtitle="Solana Program · low-cost anchoring" tone="violet" count={solana.length} verified={solana.filter(s => s.verified).length} />
        <ChainCard title="EVM" subtitle="Ethereum / Polygon / Base" tone="cyan" count={evm.length} verified={evm.filter(s => s.verified).length} />
      </div>

      {!items ? <LoadingState /> : items.length === 0 ? (
        <EmptyState title="No on-chain proofs yet" icon={Link2} />
      ) : (
        <div className="rounded-xl glass p-5">
          <SectionHeader title="All Proofs" />
          <div className="space-y-2">
            {items.map(o => (
              <div key={`${o.scan_id}-${o.id}`} className="grid gap-3 rounded-lg border border-border/60 bg-background/40 p-4 md:grid-cols-[auto,1fr,auto] md:items-center">
                <div className="inline-flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface font-mono text-[10px] uppercase text-cyan">{o.chain.slice(0, 3)}</div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider">{o.chain}</div>
                    <div className="text-[10px] text-muted-foreground">Scan #{o.scan_id} · {formatDate(o.timestamp)}</div>
                  </div>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] uppercase text-muted-foreground w-10">tx</span>
                    <span className="font-mono">{shortHash(o.tx_hash, 12)}</span>
                    <CopyButton value={o.tx_hash} />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] uppercase text-muted-foreground w-10">proof</span>
                    <span className="font-mono">{shortHash(o.proof_hash, 12)}</span>
                    <CopyButton value={o.proof_hash} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VerifiedBadge verified={o.verified} />
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs hover:border-cyan/60 active:scale-95">
                    <RefreshCw className="h-3 w-3" /> Verify again
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future registry */}
      <div className="rounded-xl glass-strong p-6">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet" />
          <h3 className="font-display text-base font-semibold">AuditProofRegistry — Future Schema</h3>
        </div>
        <p className="text-sm text-muted-foreground">Conceptual on-chain structure that will anchor every audit's integrity proof.</p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-background/60 p-4 font-mono text-[12px] leading-relaxed text-muted-foreground scrollbar-thin">
{`AuditProof {
  auditId       u64       // unique scan identifier
  targetHash    bytes32   // sha256 of canonical target representation
  reportHash    bytes32   // sha256 of full report payload
  evidenceHash  bytes32   // merkle root of evidence artifacts
  auditor       address   // signing entity (audit-center key)
  timestamp     u64       // unix seconds
  riskScore     u16       // 0-100
  valid         bool      // verification status
}`}
        </pre>
      </div>
    </div>
  );
}

function ChainCard({ title, subtitle, tone, count, verified }: { title: string; subtitle: string; tone: "cyan" | "violet"; count: number; verified: number }) {
  return (
    <div className="relative overflow-hidden rounded-xl glass p-5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, var(--${tone}), transparent 70%)` }} />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: `var(--${tone})` }}>{title}</div>
        <div className="mt-1 font-display text-2xl font-semibold">{count} proofs</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
        <div className="mt-3 text-xs text-emerald">{verified} verified · {count - verified} pending</div>
      </div>
    </div>
  );
}
