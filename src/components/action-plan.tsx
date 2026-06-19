"use client";

import * as React from "react";
import { List, Columns3, Calendar as CalIcon, Paperclip, AlertTriangle, Plus } from "lucide-react";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionItemRow } from "@/components/action-item-row";
import { NewActionDialog } from "@/components/new-action-dialog";
import { useCondos } from "@/lib/condo-store";
import {
  actionStatus,
  priority,
  category,
  kanbanColumns,
  fmtDateShort,
  isOverdue,
  relativeDays,
} from "@/lib/domain";
import type {
  ActionItem,
  ActionStatus,
  Priority,
  ActionCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "lista" | "kanban" | "calendario";

const MESES_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function ActionPlan({
  items: initialItems,
  condoNames,
  showCondo = false,
  fixedCondoId,
}: {
  items: ActionItem[];
  condoNames: Record<string, string>;
  showCondo?: boolean;
  fixedCondoId?: string;
}) {
  const condos = useCondos();
  const [items, setItems] = React.useState<ActionItem[]>(initialItems);
  const [view, setView] = React.useState<View>("lista");
  const [status, setStatus] = React.useState<ActionStatus | "">("");
  const [prio, setPrio] = React.useState<Priority | "">("");
  const [cat, setCat] = React.useState<ActionCategory | "">("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = items.filter((i) => {
    if (status && i.status !== status) return false;
    if (prio && i.priority !== prio) return false;
    if (cat && i.category !== cat) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-md border bg-card p-0.5">
          <ViewBtn active={view === "lista"} onClick={() => setView("lista")} icon={List}>
            Lista
          </ViewBtn>
          <ViewBtn active={view === "kanban"} onClick={() => setView("kanban")} icon={Columns3}>
            Kanban
          </ViewBtn>
          <ViewBtn active={view === "calendario"} onClick={() => setView("calendario")} icon={CalIcon}>
            Calendário
          </ViewBtn>
        </div>

        <div className="flex flex-wrap gap-2">
          <Sel value={status} onChange={(v) => setStatus(v as ActionStatus | "")} label="Status">
            {Object.entries(actionStatus).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Sel>
          <Sel value={prio} onChange={(v) => setPrio(v as Priority | "")} label="Prioridade">
            {Object.entries(priority).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Sel>
          <Sel value={cat} onChange={(v) => setCat(v as ActionCategory | "")} label="Categoria">
            {Object.entries(category).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Sel>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> Nova pendência
          </button>
        </div>
      </div>

      {view === "lista" && (
        <Panel className="overflow-hidden p-0">
          <div className="divide-y">
            {filtered.map((item) => (
              <div key={item.id}>
                <ActionItemRow item={item} />
                {showCondo && (
                  <div className="-mt-2 pb-2 pl-[2.75rem] font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground/80">
                    {condoNames[item.condoId]}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <Empty />}
          </div>
        </Panel>
      )}

      {view === "kanban" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kanbanColumns.map((col) => {
            const colItems = filtered.filter((i) => i.status === col);
            return (
              <div key={col} className="flex flex-col rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
                  <span className="text-xs font-semibold">{actionStatus[col].label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{colItems.length}</span>
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {colItems.map((item) => (
                    <KanbanCard
                      key={item.id}
                      item={item}
                      condoName={showCondo ? condoNames[item.condoId] : undefined}
                    />
                  ))}
                  {colItems.length === 0 && (
                    <div className="px-2 py-6 text-center font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground/60">
                      vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "calendario" && <CalendarView items={filtered} condoNames={condoNames} showCondo={showCondo} />}

      <p className="font-mono text-xs text-muted-foreground">
        {filtered.length} de {items.length} itens
      </p>

      <NewActionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(item) => setItems((prev) => [item, ...prev])}
        condos={condos}
        fixedCondoId={fixedCondoId}
      />
    </div>
  );
}

function KanbanCard({ item, condoName }: { item: ActionItem; condoName?: string }) {
  const overdue = isOverdue(item.dueDate, item.status);
  const pr = priority[item.priority];
  return (
    <div className="rounded-md border bg-card p-3 shadow-[0_1px_0_0_oklch(0.3_0.02_60/0.04)] transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge tone={pr.tone} className="px-1.5 py-0">{pr.label}</Badge>
        <span className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
          {category[item.category].label}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug">{item.title}</p>
      {condoName && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{condoName}</p>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t pt-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[0.6875rem]",
            overdue ? "font-medium text-danger" : "text-muted-foreground",
          )}
        >
          {overdue && <AlertTriangle className="size-3" />}
          {fmtDateShort(item.dueDate)}
        </span>
        {item.attachments ? (
          <span className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-muted-foreground">
            <Paperclip className="size-3" />
            {item.attachments}
          </span>
        ) : (
          <span className="text-[0.6875rem] text-muted-foreground/70">{relativeDays(item.dueDate)}</span>
        )}
      </div>
    </div>
  );
}

function CalendarView({
  items,
  condoNames,
  showCondo,
}: {
  items: ActionItem[];
  condoNames: Record<string, string>;
  showCondo?: boolean;
}) {
  // Anchored to June 2026 — the active operating month for the demo data.
  const year = 2026;
  const month = 5; // June (0-indexed)
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const byDay = new Map<number, ActionItem[]>();
  for (const it of items) {
    const [y, m, d] = it.dueDate.split("-").map(Number);
    if (y === year && m === month + 1) {
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d)!.push(it);
    }
  }

  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h3 className="font-display text-sm font-semibold">
          {MESES_FULL[month]} de {year}
        </h3>
        <span className="font-mono text-xs text-muted-foreground">vencimentos</span>
      </div>
      <div className="grid grid-cols-7 border-b bg-muted/30 text-center">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="py-2 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const dayItems = day ? byDay.get(day) ?? [] : [];
          const isToday = day === 10;
          return (
            <div
              key={idx}
              className={cn(
                "min-h-[5.5rem] border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0",
                !day && "bg-muted/20",
              )}
            >
              {day && (
                <>
                  <div
                    className={cn(
                      "mb-1 inline-flex size-5 items-center justify-center rounded font-mono text-[0.6875rem]",
                      isToday ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((it) => {
                      const overdue = isOverdue(it.dueDate, it.status);
                      return (
                        <div
                          key={it.id}
                          className={cn(
                            "truncate rounded px-1.5 py-0.5 text-[0.6875rem] leading-tight",
                            overdue
                              ? "bg-danger-soft text-danger"
                              : "bg-info-soft text-info",
                          )}
                          title={`${it.title}${showCondo ? " · " + condoNames[it.condoId] : ""}`}
                        >
                          {it.title}
                        </div>
                      );
                    })}
                    {dayItems.length > 3 && (
                      <div className="px-1.5 font-mono text-[0.625rem] text-muted-foreground">
                        +{dayItems.length - 3}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ViewBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}

function Sel({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={`Filtrar por ${label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
    >
      <option value="">{label}: todos</option>
      {children}
    </select>
  );
}

function Empty() {
  return (
    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
      Nenhum item corresponde aos filtros.
    </div>
  );
}
