import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "pt";

const dict = {
  en: {
    "brand.subtitle": "Audit Center",
    "sidebar.module": "Independent Security Module",
    "nav.dashboard": "Dashboard",
    "nav.targets": "Targets",
    "nav.scans": "Scans",
    "nav.evidence": "Evidence Vault",
    "nav.onchain": "On-chain Proofs",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "topbar.title": "Security Operations",
    "topbar.subtitle": "Audit · Evidence · On-chain proofs",
    "topbar.online": "API Online",
    "topbar.mock": "Mock Mode",
    "topbar.checking": "Checking…",
    "footer": "DEV — rodrigo.run © 2026 SingulAI — All rights reserved",
    "hero.badge": "Independent Security Module",
    "hero.title.suffix": "Audit Center",
    "hero.desc": "Enterprise audit operations with cryptographic evidence and on-chain proof verification — fully isolated from the SingulAI core platform.",
    "hero.newTarget": "New Target",
    "hero.startAudit": "Start Audit",
    "hero.evidence": "Evidence",
    "lang.label": "Language",
  },
  pt: {
    "brand.subtitle": "Central de Auditoria",
    "sidebar.module": "Módulo de Segurança Independente",
    "nav.dashboard": "Painel",
    "nav.targets": "Alvos",
    "nav.scans": "Auditorias",
    "nav.evidence": "Cofre de Evidências",
    "nav.onchain": "Provas On-chain",
    "nav.reports": "Relatórios",
    "nav.settings": "Configurações",
    "topbar.title": "Operações de Segurança",
    "topbar.subtitle": "Auditoria · Evidências · Provas on-chain",
    "topbar.online": "API Online",
    "topbar.mock": "Modo Simulado",
    "topbar.checking": "Verificando…",
    "footer": "DEV — rodrigo.run © 2026 SingulAI — Todos os direitos reservados",
    "hero.badge": "Módulo de Segurança Independente",
    "hero.title.suffix": "Central de Auditoria",
    "hero.desc": "Operações de auditoria corporativa com evidências criptográficas e verificação on-chain — totalmente isolada do núcleo da SingulAI.",
    "hero.newTarget": "Novo Alvo",
    "hero.startAudit": "Iniciar Auditoria",
    "hero.evidence": "Evidências",
    "lang.label": "Idioma",
  },
} as const;

type Key = keyof typeof dict["en"];

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("singulai_lang") as Lang)) || null;
    if (saved === "en" || saved === "pt") setLangState(saved);
    else if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("pt")) setLangState("pt");
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("singulai_lang", l); } catch {}
  }

  const t = (k: Key) => (dict[lang] as Record<string, string>)[k] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useT() {
  return useContext(Ctx);
}

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div className={`inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-[11px] font-medium ${className}`}>
      {(["en", "pt"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === l ? "bg-cyan/20 text-cyan" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
