import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/domain";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border-strong/50",
  muted: "bg-muted text-muted-foreground border-transparent",
  info: "bg-info-soft text-info border-info/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning-foreground border-warning/40",
  danger: "bg-danger-soft text-danger border-danger/25",
  copper: "bg-[oklch(0.95_0.04_40)] text-copper border-copper/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot = false,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
