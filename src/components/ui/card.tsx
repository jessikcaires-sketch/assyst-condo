import * as React from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel", className)} {...props}>
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h3 className="text-[0.95rem] font-semibold leading-tight">{title}</h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
