"use client";

import * as React from "react";
import { ScrollText, Repeat, FolderKanban, ChevronRight } from "lucide-react";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { serviceColor } from "@/lib/service-color";
import { serviceProgress, coverage, fmtMoney, fmtDateShort, activityResponsible, daysFromToday } from "@/lib/domain";
import type { ContractedService, ServiceProgress, ServiceLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROGRESS = Object.keys(serviceProgress) as ServiceProgress[];
const realToday = () => new Date().toISOString().slice(0, 10);
const newLog = (text: string, auto = false): ServiceLogEntry => ({
  id: `log-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  at: realToday(),
  text,
  auto,
});

export function ServiceScope({
  services,
  catalogServices,
  onChange,
}: {
  services: ContractedService[];
  catalogServices?: string[];
  /** Quando presente, o escopo fica interativo (marca atividade, muda status). */
  onChange?: (services: ContractedService[]) => void;
}) {
  const recorrentes = services.filter((s) => (s.kind ?? "recorrente") === "recorrente");
  const pontuais = services.filter((s) => s.kind === "pontual");
  const [open, setOpen] = React.useState<Set<string>>(new Set());
  const toggleOpen = (name: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const [note, setNote] = React.useState<Record<string, string>>({});

  const updateService = (name: string, fn: (s: ContractedService) => ContractedService) =>
    onChange?.(services.map((s) => (s.name === name ? fn(s) : s)));

  const changeStatus = (name: string, progress: ServiceProgress) =>
    updateService(name, (s) => ({
      ...s,
      progress,
      deliveredAt: progress === "entregue" ? realToday() : s.deliveredAt,
      history: [...(s.history ?? []), newLog(`Status alterado para "${serviceProgress[progress].label}"`, true)],
    }));

  const toggleAct = (name: string, id: string) =>
    updateService(name, (s) => {
      let label = "";
      let nowDone = false;
      const activities = (s.activities ?? []).map((a) => {
        if (a.id !== id) return a;
        nowDone = !a.done;
        label = a.label;
        return { ...a, done: nowDone, completedAt: nowDone ? realToday() : undefined };
      });
      return {
        ...s,
        activities,
        history: [...(s.history ?? []), newLog(`Etapa "${label}" ${nowDone ? "concluída" : "reaberta"}`, true)],
      };
    });

  const addNote = (name: string) => {
    const text = (note[name] ?? "").trim();
    if (!text) return;
    updateService(name, (s) => ({ ...s, history: [...(s.history ?? []), newLog(text)] }));
    setNote((n) => ({ ...n, [name]: "" }));
  };

  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex items-center gap-2.5 border-b bg-muted/30 px-5 py-3">
        <ScrollText className="size-4 text-primary" />
        <div>
          <div className="font-display text-sm font-semibold leading-tight">Escopo de serviço</div>
          <div className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
            Recorrentes e projetos pontuais
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Recorrentes */}
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <Repeat className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">Serviços recorrentes</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{recorrentes.length}</span>
          </div>
          {recorrentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum serviço recorrente.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recorrentes.map((s) => (
                <span
                  key={s.name}
                  style={serviceColor(s.name, catalogServices)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium"
                >
                  {s.name}
                  {s.coverage === "cortesia" && <span className="text-[0.625rem] opacity-70">· cortesia</span>}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Projetos pontuais */}
        <section className="border-t pt-4">
          <div className="mb-2.5 flex items-center gap-2">
            <FolderKanban className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">Projetos pontuais</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{pontuais.length}</span>
          </div>
          {pontuais.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum projeto pontual.</p>
          ) : (
            <ul className="divide-y overflow-hidden rounded-lg border">
              {pontuais.map((s) => {
                const acts = s.activities ?? [];
                const done = acts.filter((a) => a.done).length;
                const prog = s.progress ?? "liberado";
                const isOpen = open.has(s.name);
                return (
                  <li key={s.name}>
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleOpen(s.name)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                        <span style={serviceColor(s.name, catalogServices)} className="inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-medium">
                          {s.name}
                        </span>
                      </button>
                      {acts.length > 0 && (
                        <span className="font-mono text-xs text-muted-foreground">{done}/{acts.length}</span>
                      )}
                      {typeof s.value === "number" && (
                        <span className="font-mono text-xs text-muted-foreground">{fmtMoney(s.value)}</span>
                      )}
                      {onChange ? (
                        <select
                          aria-label="Status do projeto"
                          value={prog}
                          onChange={(e) => changeStatus(s.name, e.target.value as ServiceProgress)}
                          className="h-7 rounded-md border bg-card px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                        >
                          {PROGRESS.map((p) => <option key={p} value={p}>{serviceProgress[p].label}</option>)}
                        </select>
                      ) : (
                        <Badge tone={serviceProgress[prog].tone} dot>{serviceProgress[prog].label}</Badge>
                      )}
                    </div>

                    {isOpen && (
                      <div className="space-y-3 bg-muted/20 px-3 pb-3 pl-9 pt-1">
                        {(s.releasedAt || s.deliveredAt) && (
                          <p className="font-mono text-xs text-muted-foreground">
                            {s.releasedAt && <>Liberado em {fmtDateShort(s.releasedAt)}</>}
                            {s.releasedAt && !s.deliveredAt && <> · {Math.max(0, -daysFromToday(s.releasedAt))} dias em andamento</>}
                            {s.deliveredAt && <> · Entregue em {fmtDateShort(s.deliveredAt)}</>}
                          </p>
                        )}

                        {/* Etapas */}
                        <ul className="space-y-1">
                          {acts.map((a) => {
                            const late = !a.done && a.dueDate && daysFromToday(a.dueDate) < 0;
                            return (
                              <li key={a.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                <label className={cn("flex cursor-pointer items-center gap-2", a.done && "text-muted-foreground")}>
                                  <input type="checkbox" checked={a.done} disabled={!onChange} onChange={() => toggleAct(s.name, a.id)} className="size-3.5 shrink-0 accent-primary" />
                                  <span className={cn(a.done && "line-through")}>{a.label}</span>
                                </label>
                                {a.responsible && <Badge tone={activityResponsible[a.responsible].tone}>{activityResponsible[a.responsible].label}</Badge>}
                                {a.done && a.completedAt ? (
                                  <span className="font-mono text-[0.6875rem] text-success">✓ {fmtDateShort(a.completedAt)}</span>
                                ) : a.dueDate ? (
                                  <span className={cn("font-mono text-[0.6875rem]", late ? "text-danger" : "text-muted-foreground")}>
                                    prazo {fmtDateShort(a.dueDate)}{late ? " · atrasada" : ""}
                                  </span>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>

                        {/* Timeline / histórico */}
                        <div className="border-t pt-2">
                          <div className="mb-1.5 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">Histórico</div>
                          {(s.history ?? []).length > 0 && (
                            <ul className="mb-2 space-y-1">
                              {[...(s.history ?? [])].reverse().map((h) => (
                                <li key={h.id} className="flex gap-2 text-xs">
                                  <span className="shrink-0 font-mono text-muted-foreground">{fmtDateShort(h.at)}</span>
                                  <span className={cn(h.auto && "text-muted-foreground")}>{h.text}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {onChange && (
                            <div className="flex gap-1.5">
                              <input
                                value={note[s.name] ?? ""}
                                onChange={(e) => setNote((n) => ({ ...n, [s.name]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(s.name); } }}
                                placeholder="Adicionar anotação…"
                                className="h-7 flex-1 rounded-md border bg-card px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                              />
                              <button type="button" onClick={() => addNote(s.name)} className="rounded-md border bg-card px-2.5 text-xs font-medium transition-colors hover:bg-muted">
                                Anotar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Panel>
  );
}
