import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Wifi, Shield, KeyRound, Database, Eye, Lock } from "lucide-react";
import { SectionHeader } from "@/components/audit/States";
import { API_URL, getHealth } from "@/lib/auditApi";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SingulAI Audit Center" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [url, setUrl] = useState(API_URL);
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"unknown" | "online" | "mock">("unknown");
  const [testing, setTesting] = useState(false);

  useEffect(() => { test(); /* eslint-disable-next-line */ }, []);

  async function test() {
    setTesting(true);
    const h = await getHealth();
    setStatus(h.mock ? "mock" : "online");
    setTesting(false);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Frontend configuration for the Audit Center" icon={SettingsIcon} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wifi className="h-4 w-4 text-cyan" />
            <h3 className="font-display text-base font-semibold">API Connection</h3>
          </div>

          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">API Base URL</label>
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm focus:border-cyan/60 outline-none"
          />
          <div className="mt-2 text-[11px] text-muted-foreground">From <code className="font-mono text-cyan">VITE_AUDIT_API_URL</code> · changes apply at build time.</div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 bg-background/40 p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full pulse-dot ${status === "online" ? "bg-emerald" : status === "mock" ? "bg-amber" : "bg-muted-foreground"}`} />
              <span className="font-medium">
                {status === "online" ? "API Online" : status === "mock" ? "Mock Mode (API unreachable)" : "Unknown"}
              </span>
            </div>
            <button
              onClick={test} disabled={testing}
              className="rounded-md border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/20 active:scale-95 disabled:opacity-60"
            >
              {testing ? "Testing…" : "Test connection"}
            </button>
          </div>
        </div>

        <div className="rounded-xl glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-violet" />
            <h3 className="font-display text-base font-semibold">Internal API Key</h3>
          </div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">API Key (placeholder)</label>
          <input
            type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-audit-…"
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm focus:border-violet/60 outline-none"
          />
          <div className="mt-2 text-[11px] text-muted-foreground">Reserved slot for future internal authentication. Not transmitted yet.</div>
          <button disabled className="mt-4 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted-foreground opacity-60">
            Coming soon
          </button>
        </div>

        <div className="rounded-xl glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald" />
            <h3 className="font-display text-base font-semibold">Theme</h3>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-lg border border-cyan/40 bg-cyan/10 p-3 text-sm text-cyan">Dark (default)</button>
            <button disabled className="flex-1 rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground opacity-60">Light (soon)</button>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">SOC palette optimized for low-light operation centers.</div>
        </div>

        <div className="rounded-xl glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald" />
            <h3 className="font-display text-base font-semibold">Security Posture</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              { icon: Lock, t: "API access controlled" },
              { icon: Eye, t: "Read-only consumer (frontend)" },
              { icon: Database, t: "Database isolated from SingulAI core" },
              { icon: Shield, t: "Evidence stored externally" },
              { icon: Lock, t: "Core platform protected from scanners" },
            ].map((it, i) => (
              <li key={i} className="flex items-center gap-3 rounded-md border border-border/40 bg-background/40 p-2.5">
                <it.icon className="h-4 w-4 text-emerald" />
                <span className="text-sm">{it.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
