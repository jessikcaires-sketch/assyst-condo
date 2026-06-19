"use client";

import * as React from "react";
import { ScrollText, Repeat, FolderKanban, ChevronRight } from "lucide-react";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { serviceColor } from "@/lib/service-color";
import { serviceProgress, coverage, fmtMoney } from "@/lib/domain";
import type { ContractedService, ServiceProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROGRESS = Object.keys(serviceProgress) as ServiceProgress[];

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

  const patch = (name: string, p: Partial<ContractedService>) =>
    onChange?.(services.map((s) => (s.name === name ? { ...s, ...p } : s)));
  const toggleAct = (name: string, id: string) =>
    onChange?.(
      services.map((s) =>
        s.name === name
          ? { ...s, activities: (s.activities ?? []).map((a) => (a.id === id ? { ...a, done: !a.done } : a)) }
          : s,
      ),
    );

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
                        onClick={() => acts.length > 0 && toggleOpen(s.name)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        {acts.length > 0 && (
                          <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                        )}
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
                          onChange={(e) => patch(s.name, { progress: e.target.value as ServiceProgress })}
                          className="h-7 rounded-md border bg-card px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                        >
                          {PROGRESS.map((p) => <option key={p} value={p}>{serviceProgress[p].label}</option>)}
                        </select>
                      ) : (
                        <Badge tone={serviceProgress[prog].tone} dot>{serviceProgress[prog].label}</Badge>
                      )}
                    </div>

                    {isOpen && acts.length > 0 && (
                      <div className="bg-muted/20 px-3 pb-3 pl-9">
                        <ul className="grid gap-1 pt-1 sm:grid-cols-2">
                          {acts.map((a) => (
                            <li key={a.id}>
                              <label className={cn("flex cursor-pointer items-center gap-2 text-sm", a.done && "text-muted-foreground")}>
                                <input
                                  type="checkbox"
                                  checked={a.done}
                                  disabled={!onChange}
                                  onChange={() => toggleAct(s.name, a.id)}
                                  className="size-3.5 shrink-0 accent-primary"
                                />
                                <span className={cn(a.done && "line-through")}>{a.label}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
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
