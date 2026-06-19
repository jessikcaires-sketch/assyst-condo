import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/domain";

const accent: Record<Tone, string> = {
  neutral: "text-foreground",
  muted: "text-muted-foreground",
  info: "text-info",
  success: "text-success",
  warning: "text-[oklch(0.55_0.12_78)]",
  danger: "text-danger",
  copper: "text-copper",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  className,
  style,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "panel group relative overflow-hidden p-4 transition-shadow hover:shadow-[0_2px_14px_-6px_oklch(0.3_0.02_60/0.25)]",
        className,
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="eyebrow">{label}</div>
        {Icon && (
          <Icon className={cn("size-4 opacity-60", accent[tone])} />
        )}
      </div>
      <div
        className={cn(
          "mt-2 font-display text-[2rem] font-semibold leading-none tabular-nums",
          accent[tone],
        )}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}
