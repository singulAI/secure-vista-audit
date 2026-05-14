import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

export function HashBlock({ hash, className, compact }: { hash: string; className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 font-mono text-[11px] leading-tight text-muted-foreground",
        className,
      )}
    >
      <span className="text-cyan">SHA-256</span>
      <span className={cn("truncate text-foreground/90", compact && "max-w-[180px]")} title={hash}>{hash}</span>
      <CopyButton value={hash} className="ml-auto" />
    </div>
  );
}
