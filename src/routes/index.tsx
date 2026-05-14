import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ScanSearch, Vault, Link2, Shield, Plus, Play, Eye, Server, Lock, Cpu, Database } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MetricCard } from "@/components/audit/MetricCard";
import { SectionHeader, ProtectedCoreNotice, LoadingState } from "@/components/audit/States";
import { RiskScoreBadge, StatusBadge, TypeBadge } from "@/components/audit/Badges";
import { listScans, allEvidence, allOnchain, formatDate, type Scan } from "@/lib/auditApi";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — SingulAI Audit Center" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [scans, setScans] = useState<Scan[] | null>(null);
  useEffect(() => { listScans().then(setScans); }, []);

  if (!scans) return <LoadingState />;
  const completed = scans.filter(s => s.status === "completed");
  const avgRisk = completed.length ? Math.round(completed.reduce((a, s) => a + s.risk_score, 0) / completed.length) : 0;
  const evidence = allEvidence();
  const onchain = allOnchain();

  const trendData = Array.from({ length: 8 }, (_, i) => ({
    day: `D-${7 - i}`,
    risk: Math.round(20 + Math.sin(i / 1.4) * 18 + (i === 7 ? avgRisk - 25 : 0)),
  }));
  const sevData = [
    { name: "Critical", value: completed.flatMap(s => s.findings).filter(f => f.severity === "critical").length, fill: "var(--danger)" },
    { name: "High", value: completed.flatMap(s => s.findings).filter(f => f.severity === "high").length, fill: "var(--amber)" },
    { name: "Medium", value: completed.flatMap(s => s.findings).filter(f => f.severity === "medium").length, fill: "var(--cyan)" },
    { name: "Low", value: completed.flatMap(s => s.findings).filter(f => f.severity === "low").length, fill: "var(--emerald)" },
    { name: "Info", value: completed.flatMap(s => s.findings).filter(f => f.severity === "info").length, fill: "var(--muted-foreground)" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl glass-strong p-6 md:p-8">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan">
              <Shield className="h-3 w-3" /> Independent Security Module
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              SingulAI <span className="gradient-text">Audit Center</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Enterprise audit operations with cryptographic evidence and on-chain proof verification — fully isolated from the SingulAI core platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/targets" className="inline-flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/15 px-4 py-2.5 text-sm font-medium text-cyan transition-all hover:bg-cyan/25 active:scale-95">
              <Plus className="h-4 w-4" /> New Target
            </Link>
            <Link to="/scans" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-95">
              <Play className="h-4 w-4" /> Start Audit
            </Link>
            <Link to="/evidence" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:border-cyan/40 active:scale-95">
              <Eye className="h-4 w-4" /> Evidence
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="API Status" value="Online" hint="audit.singulai.site" icon={Activity} accent="emerald" />
        <MetricCard label="Total Scans" value={scans.length} hint={`${completed.length} completed`} icon={ScanSearch} accent="cyan" />
        <MetricCard label="Evidence" value={evidence.length} hint="SHA-256 hashed" icon={Vault} accent="violet" />
        <MetricCard label="On-chain Proofs" value={onchain.length} hint={`${onchain.filter(o => o.verified).length} verified`} icon={Link2} accent="amber" />
        <MetricCard label="Avg Risk Score" value={avgRisk} hint="Across completed audits" icon={Shield} accent={avgRisk > 50 ? "danger" : "emerald"} />
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl glass p-5 lg:col-span-2">
          <SectionHeader title="Risk Trend" description="Composite risk score across the last 8 evaluations" icon={Activity} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--cyan)" />
                    <stop offset="100%" stopColor="var(--violet)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="risk" stroke="url(#riskGrad)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--cyan)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl glass p-5">
          <SectionHeader title="Findings Severity" description="Distribution across all audits" icon={Shield} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevData}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Latest audits */}
      <section className="rounded-xl glass p-5">
        <SectionHeader
          title="Latest Audits"
          description="Most recent scan executions"
          icon={ScanSearch}
          action={<Link to="/scans" className="text-xs text-cyan hover:underline">View all →</Link>}
        />
        <div className="-mx-5 overflow-x-auto px-5 scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-2 py-3">Scan</th>
                <th className="px-2 py-3">Target</th>
                <th className="px-2 py-3">Type</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Risk</th>
                <th className="px-2 py-3">Started</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {scans.slice(0, 6).map(s => (
                <tr key={s.id} className="border-b border-border/40 transition-colors hover:bg-surface-2/40">
                  <td className="px-2 py-3 font-mono text-xs text-cyan">#{s.id}</td>
                  <td className="px-2 py-3 font-medium">{s.target?.name || "—"}</td>
                  <td className="px-2 py-3">{s.target && <TypeBadge type={s.target.target_type} />}</td>
                  <td className="px-2 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-2 py-3"><RiskScoreBadge score={s.risk_score} size="sm" /></td>
                  <td className="px-2 py-3 text-xs text-muted-foreground">{formatDate(s.started_at)}</td>
                  <td className="px-2 py-3 text-right">
                    <Link to="/scans/$id" params={{ id: String(s.id) }} className="text-xs text-cyan hover:underline">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Architecture */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl glass p-6 lg:col-span-2">
          <SectionHeader title="Secure Architecture" description="Why scanners never run inside the SingulAI core" icon={Lock} />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Cpu, label: "SingulAI Core", note: "Read-only consumer of audit reports", color: "violet" },
              { icon: Server, label: "Audit Center", note: "Independent scanning runtime", color: "cyan" },
              { icon: Database, label: "Evidence Vault", note: "Off-core hashed storage", color: "emerald" },
            ].map((b, i) => (
              <div key={i} className="relative overflow-hidden rounded-lg border border-border/60 bg-background/40 p-4">
                <b.icon className="h-5 w-5" style={{ color: `var(--${b.color})` }} />
                <div className="mt-3 font-display text-sm font-semibold">{b.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{b.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-border/60 bg-background/40 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
            <div className="mb-2 text-cyan">// data flow</div>
            target → <span className="text-emerald">audit-center</span> → evidence(SHA-256) → onchain-proof → <span className="text-violet">singulai-core (read-only)</span>
          </div>
        </div>
        <ProtectedCoreNotice />
      </section>
    </div>
  );
}
