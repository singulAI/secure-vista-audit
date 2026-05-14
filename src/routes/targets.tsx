import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crosshair, Plus, ShieldAlert, Play } from "lucide-react";
import { SectionHeader, EmptyState, LoadingState } from "@/components/audit/States";
import { TypeBadge } from "@/components/audit/Badges";
import { listTargets, createTarget, createScan, formatDate, type Target, type TargetType } from "@/lib/auditApi";

export const Route = createFileRoute("/targets")({
  head: () => ({ meta: [{ title: "Targets — SingulAI Audit Center" }] }),
  component: TargetsPage,
});

const types: { value: TargetType; label: string }[] = [
  { value: "domain", label: "Domain" },
  { value: "ip", label: "IP Address" },
  { value: "api", label: "API Endpoint" },
  { value: "smart_contract", label: "Smart Contract (EVM)" },
  { value: "solana_program", label: "Solana Program" },
];

function TargetsPage() {
  const [items, setItems] = useState<Target[] | null>(null);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [target_type, setType] = useState<TargetType>("domain");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { listTargets().then(setItems); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !value) return;
    setSubmitting(true);
    const t = await createTarget({ name, target_type, value });
    setItems((prev) => prev ? [...prev, t] : [t]);
    setName(""); setValue("");
    setSubmitting(false);
  }

  async function startAudit(id: number) {
    await createScan(id);
    window.location.href = "/scans";
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Targets"
        description="Register and manage authorized audit targets"
        icon={Crosshair}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={submit} className="relative overflow-hidden rounded-xl glass p-5 lg:col-span-1">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative space-y-4">
            <div className="font-display text-base font-semibold">Register Authorized Target</div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Name</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="singulai.site"
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-cyan/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Target Type</label>
              <select
                value={target_type} onChange={(e) => setType(e.target.value as TargetType)}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-cyan/60"
              >
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Value</label>
              <input
                value={value} onChange={(e) => setValue(e.target.value)} required
                placeholder="domain / ip / address"
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm outline-none focus:border-cyan/60"
              />
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/5 p-3 text-[11px] text-amber">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Only register targets you are explicitly authorized to audit.
            </div>
            <button
              type="submit" disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {submitting ? "Registering…" : "Register Authorized Target"}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="rounded-xl glass p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-display text-base font-semibold">Registered Targets</div>
            <span className="text-xs text-muted-foreground">{items?.length ?? 0} total</span>
          </div>
          {!items ? <LoadingState /> : items.length === 0 ? (
            <EmptyState title="No targets yet" description="Register your first authorized target to begin auditing." icon={Crosshair} />
          ) : (
            <div className="space-y-2">
              {items.map(t => (
                <div key={t.id} className="group flex flex-col gap-3 rounded-lg border border-border/60 bg-background/40 p-4 transition-all hover:border-cyan/40 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{t.name}</span>
                      <TypeBadge type={t.target_type} />
                    </div>
                    <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{t.value}</div>
                    {t.created_at && <div className="mt-0.5 text-[10px] text-muted-foreground/70">Added {formatDate(t.created_at)}</div>}
                  </div>
                  <button
                    onClick={() => startAudit(t.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-xs text-cyan transition-all hover:bg-cyan/20 active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5" /> Start audit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link to="/scans" className="inline-block text-xs text-cyan hover:underline">View all scans →</Link>
    </div>
  );
}
