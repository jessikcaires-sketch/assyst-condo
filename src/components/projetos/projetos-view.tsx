"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban, Building2, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useCondoStore } from "@/lib/condo-store";
import { useCatalogs } from "@/lib/catalog-store";
import { Badge } from "@/components/ui/badge";
import { projectFlow, serviceProgress, fmtMoney, fmtDate, relativeDays, isOverdue, activityResponsible, addBusinessDays, businessDaysBetween } from "@/lib/domain";
import { serviceColor } from "@/lib/service-color";
import type { Condominium, ContractedService, ServiceProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Project {
  condo: Condominium;
  service: ContractedService;
}

const COLUMN_TONE: Record<ServiceProgress, string> = {
  aguardando_liberacao: "border-t-muted-foreground/25",
  liberado: "border-t-muted-foreground/40",
  em_andamento: "border-t-info",
  entregue: "border-t-success",
};

export function ProjetosView() {
  const { condos, updateCondo } = useCondoStore();
  const cat = useCatalogs();
  const [dragged, setDragged] = React.useState<{ condoId: string; serviceName: string } | null>(null);
  const [overCol, setOverCol] = React.useState<ServiceProgress | null>(null);
  const [today, setToday] = React.useState("");
  React.useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const projects: Project[] = condos.flatMap((c) =>
    c.services.filter((s) => s.kind === "pontual").map((service) => ({ condo: c, service })),
  );

  const columns = projectFlow.map((key) => {
    const items = projects.filter((p) => (p.service.progress ?? "liberado") === key);
    const total = items.reduce((sum, p) => sum + (p.service.value ?? 0), 0);
    return { key, items, total };
  });

  function move(condo: Condominium, serviceName: string, progress: ServiceProgress) {
    updateCondo(condo.id, {
      services: condo.services.map((s) => (s.name === serviceName ? { ...s, progress } : s)),
    });
  }

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Operação"
        title="Serviços Pontuais"
        description="Serviços pontuais (inspeções, vistorias, laudos) de todos os condomínios — etapa, previsão de entrega e atividades."
      />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center md:px-8">
          <FolderKanban className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum projeto pontual ainda. Abra um condomínio, edite e marque um serviço como
            <strong> Pontual</strong> (ex.: Inspeção predial) — ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 py-6 md:grid-cols-3 md:px-8">
          {columns.map((col) => (
            <div
              key={col.key}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
              onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
              onDrop={() => {
                if (dragged) {
                  const c = condos.find((x) => x.id === dragged.condoId);
                  if (c) move(c, dragged.serviceName, col.key);
                }
                setDragged(null);
                setOverCol(null);
              }}
              className={cn(
                "rounded-xl border border-t-4 bg-muted/20 transition-colors",
                COLUMN_TONE[col.key],
                overCol === col.key && "bg-primary/5 ring-2 ring-primary/40",
              )}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <span className="text-sm font-semibold">{serviceProgress[col.key].label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {col.items.length}
                  {col.total > 0 && <span className="ml-1.5">· {fmtMoney(col.total)}</span>}
                </span>
              </div>
              <div className="space-y-2.5 px-3 pb-3">
                {col.items.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground">Vazio</p>
                )}
                {col.items.map(({ condo, service }) => {
                  const acts = service.activities ?? [];
                  const done = acts.filter((a) => a.done).length;
                  const pend = (service.pendencias ?? []).filter((p) => !p.done);
                  const vist = acts.find((a) => /vistoria|inspe/i.test(a.label));
                  const base = vist?.completedAt || vist?.dueDate;
                  const deadline = service.slaDays && base ? addBusinessDays(base, service.slaDays) : service.dueDate;
                  const bdays = today && deadline && service.progress !== "entregue" ? businessDaysBetween(today, deadline) : null;
                  return (
                    <div
                      key={`${condo.id}-${service.name}`}
                      draggable
                      onDragStart={() => setDragged({ condoId: condo.id, serviceName: service.name })}
                      onDragEnd={() => { setDragged(null); setOverCol(null); }}
                      className="cursor-grab rounded-lg border bg-card p-3 shadow-sm active:cursor-grabbing"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span style={serviceColor(service.name, cat.services)} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
                          {service.name}
                        </span>
                        {service.situacao && (
                          <span className="inline-flex items-center rounded-md bg-warning-soft px-2 py-0.5 text-[0.625rem] font-semibold text-warning-foreground">{service.situacao}</span>
                        )}
                      </div>
                      <Link href={`/condominios/${condo.id}`} className="mt-2 flex items-center gap-1.5 text-sm font-medium leading-tight hover:text-primary">
                        <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate">{condo.name}</span>
                      </Link>
                      {bdays !== null && (
                        <div className={cn("mt-2 rounded-md px-2 py-1.5 text-center text-sm font-bold", bdays < 0 ? "bg-danger-soft text-danger" : bdays <= 3 ? "bg-warning-soft text-warning-foreground" : "bg-success/10 text-success")}>
                          {bdays < 0 ? `Atrasado ${Math.abs(bdays)} dia(s) útil(eis)` : bdays === 0 ? "Entrega hoje" : `Faltam ${bdays} dias úteis`}
                          {deadline && <span className="block text-[0.5625rem] font-normal opacity-70">prazo {fmtDate(deadline)}</span>}
                        </div>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        {typeof service.value === "number" && (
                          <span className="font-mono text-muted-foreground">{fmtMoney(service.value)}</span>
                        )}
                        {service.dueDate && service.progress !== "entregue" && (
                          <span className={cn("inline-flex items-center gap-1 font-mono", isOverdue(service.dueDate, "nao_iniciado") ? "text-danger" : "text-muted-foreground")}>
                            <CalendarClock className="size-3" /> {fmtDate(service.dueDate)} ({relativeDays(service.dueDate)})
                          </span>
                        )}
                        {service.dueDate && service.progress === "entregue" && (
                          <span className="font-mono text-success">Entregue</span>
                        )}
                      </div>
                      {acts.length > 0 && (() => {
                        const next = acts.find((a) => !a.done);
                        return (
                          <div className="mt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-success" style={{ width: `${(done / acts.length) * 100}%` }} />
                            </div>
                            <span className="mt-1 block text-right font-mono text-[0.625rem] text-muted-foreground">
                              {done}/{acts.length} etapas
                            </span>
                            {next && (
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
                                <span className="text-muted-foreground">Próxima: {next.label}</span>
                                {next.responsible && <Badge tone={activityResponsible[next.responsible].tone}>{activityResponsible[next.responsible].label}</Badge>}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {pend.length > 0 && (
                        <div className="mt-2 rounded-md border border-warning/40 bg-warning-soft px-2 py-1.5 text-[0.6875rem] text-warning-foreground">
                          <span className="font-semibold">{pend.length} pendência{pend.length > 1 ? "s" : ""}</span>
                          <ul className="mt-0.5 list-disc pl-4">
                            {pend.slice(0, 3).map((p) => <li key={p.id}>{p.text}</li>)}
                          </ul>
                        </div>
                      )}
                      <select
                        aria-label="Mover projeto"
                        value={service.progress ?? "liberado"}
                        onChange={(e) => move(condo, service.name, e.target.value as ServiceProgress)}
                        className="mt-2.5 h-7 w-full rounded-md border bg-card px-2 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                      >
                        {projectFlow.map((p) => <option key={p} value={p}>Mover p/ {serviceProgress[p].label}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
