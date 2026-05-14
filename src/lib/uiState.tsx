import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type UI = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
};

const Ctx = createContext<UI>({ sidebarCollapsed: false, toggleSidebar: () => {}, setSidebarCollapsed: () => {} });

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("singulai_sidebar_collapsed");
      if (v === "1") setSidebarCollapsed(true);
    } catch {}
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((c) => {
      const nv = !c;
      try { localStorage.setItem("singulai_sidebar_collapsed", nv ? "1" : "0"); } catch {}
      return nv;
    });
  }

  return <Ctx.Provider value={{ sidebarCollapsed, toggleSidebar, setSidebarCollapsed }}>{children}</Ctx.Provider>;
}

export function useUI() { return useContext(Ctx); }
