import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({ title, description, action, icon: Icon }: { title: string; description?: string; action?: ReactNode; icon?: any }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          {Icon && <Icon className="h-4 w-4 text-cyan" />}
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading audit data…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl glass p-12 text-muted-foreground", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-cyan" />
      <div className="text-sm">{label}</div>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-10 text-center">
      <AlertCircle className="h-6 w-6 text-danger" />
      <div className="font-medium">{title}</div>
      {message && <div className="max-w-md text-sm text-muted-foreground">{message}</div>}
      {onRetry && (
        <button onClick={onRetry} className="mt-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:border-cyan/60">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox, action }: { title: string; description?: string; icon?: any; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-background/30 p-12 text-center">
      <div className="rounded-full border border-border bg-surface p-3 text-cyan">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-medium">{title}</div>
      {description && <div className="max-w-md text-sm text-muted-foreground">{description}</div>}
      {action}
    </div>
  );
}

export function ProtectedCoreNotice() {
  return (
    <div className="rounded-xl glass p-4 text-xs text-muted-foreground">
      <div className="mb-1 font-display text-sm font-semibold text-foreground">Protected Core</div>
      Independent audit module designed to protect the SingulAI core.
      Scanners never run inside the main platform. Evidence is stored and hashed outside the core system.
    </div>
  );
}
