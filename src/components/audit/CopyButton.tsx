import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface Props { value: string; className?: string; label?: string }
export function CopyButton({ value, className, label }: Props) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-surface px-2 py-1 text-xs text-muted-foreground transition-all hover:border-cyan/60 hover:text-foreground active:scale-95",
        className,
      )}
      aria-label="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
