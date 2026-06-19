"use client";

import * as React from "react";
import { X, CalendarPlus, Repeat, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  generateSeries,
  parseISO,
  periodicityLabel,
  periodicityDescription,
  weekdayShort,
} from "@/lib/calendar";
import { visitType } from "@/lib/domain";
import type { Condominium, User, Visit, Periodicity, VisitType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PRO_COLORS } from "./colors";

const PERIODICITIES: Periodicity[] = ["unica", "semanal", "quinzenal", "mensal"];

export function NewVisitDialog({
  open,
  onClose,
  onCreate,
  condos,
  users,
  defaultDateISO,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (visits: Visit[]) => void;
  condos: Condominium[];
  users: User[];
  defaultDateISO: string;
}) {
  const [condoId, setCondoId] = React.useState(condos[0]?.id ?? "");
  const [proId, setProId] = React.useState(users[0]?.id ?? "");
  const [type, setType] = React.useState<VisitType>("visita_tecnica");
  const [dateISO, setDateISO] = React.useState(defaultDateISO);
  const [start, setStart] = React.useState("09:00");
  const [end, setEnd] = React.useState("10:30");
  const [periodicity, setPeriodicity] = React.useState<Periodicity>("semanal");
  const [count, setCount] = React.useState(4);
  const [notes, setNotes] = React.useState("");
  const [units, setUnits] = React.useState("");
  const [diagnostic, setDiagnostic] = React.useState<"" | "drone" | "termografia">("");
  const [diagnosticCourtesy, setDiagnosticCourtesy] = React.useState(true);

  React.useEffect(() => {
    if (open) setDateISO(defaultDateISO);
  }, [open, defaultDateISO]);

  if (!open) return null;

  const series = generateSeries(dateISO, periodicity, periodicity === "unica" ? 1 : count);

  function handleCreate() {
    const seriesId = `s-${Date.now()}`;
    const visits: Visit[] = series.map((date, i) => ({
      id: `${seriesId}-${i}`,
      condoId,
      professionalId: proId,
      type,
      date,
      start,
      end,
      notes: notes || undefined,
      status: "agendada",
      periodicity,
      seriesId,
      units: units ? Number(units) : undefined,
      diagnostic: diagnostic || undefined,
      diagnosticCourtesy: diagnostic ? diagnosticCourtesy : undefined,
    }));
    onCreate(visits);
    onClose();
  }

  const proIndex = users.findIndex((u) => u.id === proId);
  const proColor = PRO_COLORS[Math.max(proIndex, 0) % PRO_COLORS.length];

  return (
    <Modal open={open} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
              <CalendarPlus className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold leading-tight">Nova visita</h2>
              <p className="text-xs text-muted-foreground">Agende uma visita avulsa ou recorrente</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Condomínio" className="sm:col-span-2">
            <Select value={condoId} onChange={setCondoId}>
              {condos.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Profissional">
            <Select value={proId} onChange={setProId}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Tipo">
            <Select value={type} onChange={(v) => setType(v as VisitType)}>
              {Object.entries(visitType).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Data de início">
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Início">
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Fim">
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
            </Field>
          </div>

          {/* Periodicity */}
          <Field label="Periodicidade" className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PERIODICITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodicity(p)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    periodicity === p
                      ? "border-primary bg-primary/10 text-primary"
                      : "bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {periodicityLabel[p]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{periodicityDescription[periodicity]}</p>
          </Field>

          {periodicity !== "unica" && (
            <Field label="Número de ocorrências">
              <input
                type="number"
                min={2}
                max={26}
                value={count}
                onChange={(e) => setCount(Math.min(26, Math.max(2, Number(e.target.value) || 2)))}
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Observações" className={periodicity !== "unica" ? "" : "sm:col-span-2"}>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
              className={inputCls}
            />
          </Field>

          {/* Captura para indicadores de valor */}
          <div className="mt-1 rounded-lg border bg-muted/30 p-3 sm:col-span-2">
            <div className="eyebrow mb-2.5">Captura para indicadores (opcional)</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Unidades privativas a visitar">
                <input
                  type="number"
                  min={0}
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <Field label="Diagnóstico de engenharia">
                <select
                  aria-label="Diagnóstico de engenharia"
                  value={diagnostic}
                  onChange={(e) => setDiagnostic(e.target.value as "" | "drone" | "termografia")}
                  className={inputCls}
                >
                  <option value="">Nenhum</option>
                  <option value="drone">Drone</option>
                  <option value="termografia">Termografia</option>
                </select>
              </Field>
              {diagnostic && (
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={diagnosticCourtesy}
                    onChange={(e) => setDiagnosticCourtesy(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Diagnóstico oferecido como cortesia
                </label>
              )}
            </div>
          </div>

          {/* Preview */}
          {periodicity !== "unica" && (
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Repeat className="size-3.5 text-primary" />
                {series.length} visitas serão criadas em dias úteis
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-2.5">
                {series.map((d) => {
                  const date = parseISO(d);
                  return (
                    <span
                      key={d}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[0.6875rem]",
                        proColor.chip,
                      )}
                    >
                      <span className="opacity-70">{weekdayShort[date.getDay()]}</span>
                      {String(date.getDate()).padStart(2, "0")}/{String(date.getMonth() + 1).padStart(2, "0")}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <CheckCircle2 className="size-4" />
            {periodicity === "unica" ? "Agendar visita" : `Agendar ${series.length} visitas`}
          </button>
        </div>
    </Modal>
  );
}

const inputCls =
  "h-9 w-full rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {children}
    </select>
  );
}
