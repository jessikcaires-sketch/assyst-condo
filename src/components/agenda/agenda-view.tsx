"use client";

import * as React from "react";
import {
  CalendarDays,
  Columns3,
  Square,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { TimeGrid, type AgendaEntry } from "./time-grid";
import { MonthGrid } from "./month-grid";
import { NewVisitDialog } from "./new-visit-dialog";
import { PRO_COLORS } from "./colors";
import {
  parseISO,
  toISO,
  addDays,
  addMonths,
  weekDays,
  sameDay,
  fmtDayLong,
  fmtWeekRange,
  fmtMonthYear,
} from "@/lib/calendar";
import { TODAY } from "@/lib/domain";
import { users as allUsers, visits as seedVisits } from "@/lib/mock-data";
import { useCondos } from "@/lib/condo-store";
import type { Visit } from "@/lib/types";
import { cn } from "@/lib/utils";

type View = "dia" | "semana" | "mes";

const proIndexOf = (id: string) => allUsers.findIndex((u) => u.id === id);

export function AgendaView() {
  const condos = useCondos();
  const condoName = (id: string) => condos.find((c) => c.id === id)?.name ?? "—";
  const [visits, setVisits] = React.useState<Visit[]>(seedVisits);
  const [view, setView] = React.useState<View>("semana");
  const [anchor, setAnchor] = React.useState<Date>(() => parseISO(TODAY));
  const [proFilter, setProFilter] = React.useState("");
  const [condoFilter, setCondoFilter] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const visible = visits.filter((v) => {
    if (proFilter && v.professionalId !== proFilter) return false;
    if (condoFilter && v.condoId !== condoFilter) return false;
    return true;
  });

  const entriesFor = React.useCallback(
    (day: Date): AgendaEntry[] =>
      visible
        .filter((v) => sameDay(parseISO(v.date), day))
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((v) => ({
          visit: v,
          condoName: condoName(v.condoId),
          proName: allUsers.find((u) => u.id === v.professionalId)?.name ?? "—",
          proIndex: proIndexOf(v.professionalId),
        })),
    [visible],
  );

  function navigate(dir: -1 | 1) {
    setAnchor((a) =>
      view === "dia" ? addDays(a, dir) : view === "semana" ? addDays(a, dir * 7) : addMonths(a, dir),
    );
  }

  const periodLabel =
    view === "dia" ? fmtDayLong(anchor) : view === "semana" ? fmtWeekRange(anchor) : fmtMonthYear(anchor);

  const monthCount = visible.filter((v) => {
    const d = parseISO(v.date);
    return d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear();
  }).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border bg-card p-0.5">
            <ViewBtn active={view === "dia"} onClick={() => setView("dia")} icon={Square}>Dia</ViewBtn>
            <ViewBtn active={view === "semana"} onClick={() => setView("semana")} icon={Columns3}>Semana</ViewBtn>
            <ViewBtn active={view === "mes"} onClick={() => setView("mes")} icon={CalendarDays}>Mês</ViewBtn>
          </div>

          <div className="inline-flex items-center rounded-md border bg-card">
            <button type="button" onClick={() => navigate(-1)} className="p-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="Anterior">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={() => setAnchor(parseISO(TODAY))} className="border-x px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
              Hoje
            </button>
            <button type="button" onClick={() => navigate(1)} className="p-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="Próximo">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <span className="font-display text-sm font-semibold capitalize">{periodLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={proFilter} onChange={(e) => setProFilter(e.target.value)} className={filterCls}>
            <option value="">Todos os colaboradores</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select value={condoFilter} onChange={(e) => setCondoFilter(e.target.value)} className={filterCls}>
            <option value="">Todos os condomínios</option>
            {condos.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> Nova visita
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {allUsers.map((u, i) => (
          <span key={u.id} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2.5 rounded-full", PRO_COLORS[i % PRO_COLORS.length].dot)} />
            {u.name}
          </span>
        ))}
      </div>

      {/* Calendar */}
      {view === "mes" ? (
        <MonthGrid
          year={anchor.getFullYear()}
          month={anchor.getMonth()}
          entriesFor={entriesFor}
          onPickDay={(d) => {
            setAnchor(d);
            setView("dia");
          }}
        />
      ) : (
        <TimeGrid
          days={view === "dia" ? [anchor] : weekDays(anchor)}
          entriesFor={entriesFor}
          onPickDay={(d) => {
            setAnchor(d);
            setView("dia");
          }}
        />
      )}

      <p className="font-mono text-xs text-muted-foreground">
        {view === "mes" ? `${monthCount} visitas no mês` : `${visible.length} visitas no total`}
        {(proFilter || condoFilter) && " · filtrado"}
      </p>

      <NewVisitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(vs) => setVisits((prev) => [...prev, ...vs])}
        condos={condos}
        users={allUsers}
        defaultDateISO={toISO(anchor)}
      />
    </div>
  );
}

const filterCls =
  "h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

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
