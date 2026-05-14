import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  title: string;
  description?: string;
  icon?: any;
  defaultOpen?: boolean;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "glass" | "plain";
}

export function CollapsibleSection({
  id, title, description, icon: Icon, defaultOpen = true, action, children, className, variant = "glass",
}: Props) {
  const storageKey = id ? `singulai_section_${id}` : null;
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "0") setOpen(false);
      else if (v === "1") setOpen(true);
    } catch {}
  }, [storageKey]);

  function toggle() {
    setOpen((o) => {
      const nv = !o;
      if (storageKey) { try { localStorage.setItem(storageKey, nv ? "1" : "0"); } catch {} }
      return nv;
    });
  }

  return (
    <section className={cn(variant === "glass" ? "rounded-xl glass" : "rounded-xl border border-border/40", className)}>
      <header className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <button
          onClick={toggle}
          className="group flex flex-1 items-center gap-2.5 text-left"
          aria-expanded={open}
        >
          {Icon && <Icon className="h-4 w-4 text-cyan shrink-0" />}
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold tracking-tight sm:text-[15px]">{title}</div>
            {description && <div className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">{description}</div>}
          </div>
          <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="border-t border-border/40 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
