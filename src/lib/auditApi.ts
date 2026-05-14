// Mock data + API client for SingulAI Audit Center
export type TargetType = "domain" | "ip" | "api" | "smart_contract" | "solana_program";

export interface Target {
  id: number;
  name: string;
  target_type: TargetType;
  value: string;
  created_at?: string;
}

export type ScanStatus = "pending" | "running" | "completed" | "failed";
export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string | number;
  title: string;
  description: string;
  severity: Severity;
  recommendation: string;
}

export interface Evidence {
  id: string | number;
  filename: string;
  sha256: string;
  timestamp: string;
  storage_uri: string;
  size?: number;
}

export interface OnchainVerification {
  id: string | number;
  chain: "solana" | "ethereum" | "polygon" | "base";
  tx_hash: string;
  proof_hash: string;
  verified: boolean;
  timestamp: string;
}

export interface Scan {
  id: number;
  target_id: number;
  target?: Target;
  started_at: string;
  completed_at?: string | null;
  status: ScanStatus;
  risk_score: number;
  findings: Finding[];
  evidence: Evidence[];
  onchain_verifications: OnchainVerification[];
}

export const API_URL = (import.meta as any).env?.VITE_AUDIT_API_URL || "http://localhost:8000";

const mockTargets: Target[] = [
  { id: 1, name: "singulai.site", target_type: "domain", value: "singulai.site", created_at: "2026-04-22T10:00:00Z" },
  { id: 2, name: "Solana Vault Program", target_type: "solana_program", value: "8K9...QnY", created_at: "2026-04-25T11:30:00Z" },
  { id: 3, name: "Audit API Gateway", target_type: "api", value: "https://api.singulai.site", created_at: "2026-05-01T09:15:00Z" },
  { id: 4, name: "EVM Treasury", target_type: "smart_contract", value: "0xA1b2...F4d9", created_at: "2026-05-04T14:50:00Z" },
];

const sevs: Severity[] = ["critical", "high", "medium", "low", "info"];
function makeFindings(n: number): Finding[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    title: ["Exposed admin endpoint", "TLS 1.0 fallback", "Missing CSP", "Outdated dependency", "Open S3 bucket"][i % 5],
    description: "Detected by passive observation of public surface. No intrusive testing performed.",
    severity: sevs[i % sevs.length],
    recommendation: "Apply hardening guidance from CIS Benchmarks and rotate exposed credentials.",
  }));
}

const mockScans: Scan[] = [
  {
    id: 101, target_id: 1, target: mockTargets[0],
    started_at: "2026-05-12T08:00:00Z", completed_at: "2026-05-12T08:14:00Z",
    status: "completed", risk_score: 12,
    findings: makeFindings(3),
    evidence: [
      { id: 1, filename: "headers-snapshot.json", sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", timestamp: "2026-05-12T08:10:00Z", storage_uri: "s3://singulai-evidence/101/headers.json" },
      { id: 2, filename: "tls-report.pdf", sha256: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae", timestamp: "2026-05-12T08:12:00Z", storage_uri: "s3://singulai-evidence/101/tls.pdf" },
    ],
    onchain_verifications: [
      { id: 1, chain: "solana", tx_hash: "5xT9...kQp1", proof_hash: "0xabc123def456789abc123def456789abc123def4", verified: true, timestamp: "2026-05-12T08:15:00Z" },
    ],
  },
  {
    id: 102, target_id: 2, target: mockTargets[1],
    started_at: "2026-05-13T11:00:00Z", completed_at: "2026-05-13T11:22:00Z",
    status: "completed", risk_score: 38,
    findings: makeFindings(5),
    evidence: [
      { id: 3, filename: "program-bytecode.bin", sha256: "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9", timestamp: "2026-05-13T11:20:00Z", storage_uri: "s3://singulai-evidence/102/bytecode.bin" },
    ],
    onchain_verifications: [
      { id: 2, chain: "solana", tx_hash: "7yU2...mRz5", proof_hash: "0xdef987abc654321def987abc654321def987abc6", verified: true, timestamp: "2026-05-13T11:23:00Z" },
    ],
  },
  {
    id: 103, target_id: 3, target: mockTargets[2],
    started_at: "2026-05-14T09:30:00Z", completed_at: null,
    status: "running", risk_score: 0, findings: [], evidence: [], onchain_verifications: [],
  },
  {
    id: 104, target_id: 4, target: mockTargets[3],
    started_at: "2026-05-14T07:00:00Z", completed_at: "2026-05-14T07:18:00Z",
    status: "completed", risk_score: 67,
    findings: makeFindings(8),
    evidence: [
      { id: 4, filename: "contract-audit.json", sha256: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d", timestamp: "2026-05-14T07:16:00Z", storage_uri: "s3://singulai-evidence/104/audit.json" },
    ],
    onchain_verifications: [
      { id: 3, chain: "ethereum", tx_hash: "0x9ab3cd...e21f", proof_hash: "0x111222333444555666777888999aaabbbcccddde", verified: false, timestamp: "2026-05-14T07:19:00Z" },
    ],
  },
];

let useMock = false;
export const isMockMode = () => useMock;
const subs = new Set<(v: boolean) => void>();
export function onMockChange(cb: (v: boolean) => void) { subs.add(cb); return () => subs.delete(cb); }
function setMock(v: boolean) { if (useMock !== v) { useMock = v; subs.forEach(s => s(v)); } }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`${API_URL}${path}`, { ...init, signal: ctrl.signal, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    setMock(false);
    return r.json() as Promise<T>;
  } finally { clearTimeout(t); }
}

export async function getHealth(): Promise<{ status: string; api_url: string; mock: boolean }> {
  try {
    const r = await req<{ status: string }>("/health");
    return { status: r.status || "ok", api_url: API_URL, mock: false };
  } catch {
    setMock(true);
    return { status: "mock", api_url: API_URL, mock: true };
  }
}

export async function listTargets(): Promise<Target[]> {
  try { return await req<Target[]>("/targets"); }
  catch { setMock(true); return mockTargets; }
}

export async function createTarget(t: Omit<Target, "id" | "created_at">): Promise<Target> {
  try { return await req<Target>("/targets", { method: "POST", body: JSON.stringify(t) }); }
  catch {
    setMock(true);
    const nt: Target = { ...t, id: Math.max(0, ...mockTargets.map(x => x.id)) + 1, created_at: new Date().toISOString() };
    mockTargets.push(nt);
    return nt;
  }
}

export async function listScans(): Promise<Scan[]> {
  // Backend has no list endpoint specified; mock-friendly aggregator
  try {
    return await req<Scan[]>("/scans");
  } catch {
    setMock(true);
    return mockScans.map(s => ({ ...s, target: mockTargets.find(t => t.id === s.target_id) }));
  }
}

export async function createScan(target_id: number): Promise<Scan> {
  try { return await req<Scan>("/scans", { method: "POST", body: JSON.stringify({ target_id }) }); }
  catch {
    setMock(true);
    const ns: Scan = {
      id: Math.max(0, ...mockScans.map(x => x.id)) + 1,
      target_id,
      target: mockTargets.find(t => t.id === target_id),
      started_at: new Date().toISOString(),
      completed_at: null,
      status: "running",
      risk_score: 0, findings: [], evidence: [], onchain_verifications: [],
    };
    mockScans.unshift(ns);
    return ns;
  }
}

export async function getScan(id: number): Promise<Scan | undefined> {
  try { return await req<Scan>(`/scans/${id}`); }
  catch {
    setMock(true);
    const s = mockScans.find(x => x.id === id);
    return s ? { ...s, target: mockTargets.find(t => t.id === s.target_id) } : undefined;
  }
}

export function allEvidence(): (Evidence & { scan_id: number })[] {
  return mockScans.flatMap(s => s.evidence.map(e => ({ ...e, scan_id: s.id })));
}
export function allOnchain(): (OnchainVerification & { scan_id: number })[] {
  return mockScans.flatMap(s => s.onchain_verifications.map(o => ({ ...o, scan_id: s.id })));
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}
export function shortHash(h: string, n = 6) {
  if (!h) return "";
  return h.length <= n * 2 + 3 ? h : `${h.slice(0, n)}…${h.slice(-n)}`;
}
