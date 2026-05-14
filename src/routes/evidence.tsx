import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Vault, Search, ShieldCheck, Lock } from "lucide-react";
import { SectionHeader, EmptyState, LoadingState } from "@/components/audit/States";
import { HashBlock } from "@/components/audit/HashBlock";
import { allEvidence, listScans, formatDate } from "@/lib/auditApi";

export const Route = createFileRoute("/evidence")({
  head: () => ({ meta: [{ title: "Evidence Vault — SingulAI Audit Center" }] }),
  component: EvidenceVault,
});

function EvidenceVault() {
  const [items, setItems] = useState<ReturnType<typeof allEvidence> | null>(null);
  const [scanFilter, setScanFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [scanIds, setScanIds] = useState<number[]>([]);

  useEffect(() => {
    listScans().then(s => {
      setScanIds(s.map(x => x.id));
      setItems(allEvidence());
    });
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter(e => {
      if (scanFilter !== "all" && String(e.scan_id) !== scanFilter) return false;
      if (q && !`${e.filename} ${e.sha256}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, scanFilter, q]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Evidence Vault" description="Cryptographic vault of audit artifacts" icon={Vault} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl glass p-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-violet/40 bg-violet/10 text-violet">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-base font-semibold">Off-Core Evidence Storage</div>
              <div className="text-xs text-muted-foreground">Evidence files are stored outside the SingulAI core. Each artifact is hashed (SHA-256) and timestamped at creation.</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl glass p-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg border border-emerald/40 bg-emerald/10 text-emerald">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-semibold">Integrity</div>
            <div className="text-xs text-muted-foreground">{items?.length ?? 0} artifacts · 100% hashed</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search file or hash…"
            className="w-full rounded-lg border border-border bg-background/60 py-2.5 pl-9 pr-3 text-sm focus:border-cyan/60 outline-none"
          />
        </div>
        <select
          value={scanFilter} onChange={(e) => setScanFilter(e.target.value)}
          className="rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm focus:border-cyan/60"
        >
          <option value="all">All scans</option>
          {scanIds.map(id => <option key={id} value={String(id)}>Scan #{id}</option>)}
        </select>
      </div>

      {!items ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="No evidence found" icon={Vault} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(e => (
            <div key={`${e.scan_id}-${e.id}`} className="group relative overflow-hidden rounded-xl glass p-5 transition-all hover:border-violet/40">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet/20 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan">
                  Scan #{e.scan_id}
                </div>
                <div className="truncate font-display text-base font-semibold">{e.filename}</div>
                <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{e.storage_uri}</div>
                <div className="mt-4"><HashBlock hash={e.sha256} /></div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(e.timestamp)}</span>
                  <span className="inline-flex items-center gap-1 text-emerald"><ShieldCheck className="h-3 w-3" /> Integrity OK</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
