import { Paperclip, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  actionStatus,
  priority,
  category,
  coverage,
  fmtDate,
  relativeDays,
  isOverdue,
} from "@/lib/domain";
import type { ActionItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ActionItemRow({
  item,
  showCategory = true,
}: {
  item: ActionItem;
  showCategory?: boolean;
}) {
  const overdue = isOverdue(item.dueDate, item.status);
  const st = actionStatus[item.status];
  const pr = priority[item.priority];

  return (
    <div className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          item.priority === "critica"
            ? "bg-danger"
            : item.priority === "alta"
              ? "bg-warning"
              : item.priority === "media"
                ? "bg-info"
                : "bg-muted-foreground/40",
        )}
        title={`Prioridade ${pr.label}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm font-medium leading-snug">{item.title}</p>
          <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
            {item.coverage && (
              <Badge tone={coverage[item.coverage].tone}>{coverage[item.coverage].label}</Badge>
            )}
            <Badge tone={st.tone}>{st.label}</Badge>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {showCategory && (
            <span className="font-mono uppercase tracking-wide">
              {category[item.category].label}
            </span>
          )}
          {item.responsibleName && (
            <span className="truncate">{item.responsibleName}</span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "font-medium text-danger",
            )}
          >
            {overdue && <AlertTriangle className="size-3" />}
            {fmtDate(item.dueDate)} · {relativeDays(item.dueDate)}
          </span>
          {item.attachments ? (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3" />
              {item.attachments}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
