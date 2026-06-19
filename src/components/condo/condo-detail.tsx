"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Gavel,
  CalendarRange,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Building,
  User as UserIcon,
  FileText,
  ListChecks,
  ArrowUpRight,
  Hash,
  Pencil,
  Users2,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Panel, PanelHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionItemRow } from "@/components/action-item-row";
import { ServiceScope } from "@/components/condo/service-scope";
import { ValueIndicators } from "@/components/condo/value-indicators";
import { CondoDialog } from "@/components/condo/condo-dialog";
import { useCondoStore } from "@/lib/condo-store";
import { useCatalogs } from "@/lib/catalog-store";
import { cn } from "@/lib/utils";
import {
  getCondoStats,
  getActionItems,
  getMeetings,
  getVisits,
  getBids,
} from "@/lib/mock-data";
import {
  generalStatus,
  condoStatus,
  contactRole,
  contractSignal,
  fmtDate,
  fmtDateShort,
  meetingType,
  isOverdue,
} from "@/lib/domain";

export function CondoDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { getCondo, updateCondo, hydrated } = useCondoStore();
  const cat = useCatalogs();
  const [editing, setEditing] = React.useState(false);

  const condo = getCondo(id);

  if (!condo) {
    return (
      <div className="animate-rise px-4 py-16 text-center md:px-8">
        <p className="text-sm text-muted-foreground">
          {hydrated ? "Condomínio não encontrado." : "Carregando…"}
        </p>
        <Link href="/condominios" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Voltar para condomínios
        </Link>
      </div>
    );
  }

  const stats = getCondoStats(condo.id);
  const responsible = cat.getResponsible(condo.responsibleId);
  const gs = generalStatus[stats.general];
  const cs = condoStatus[condo.status];
  const contract = contractSignal(condo.contractEnd);

  const proximasAcoes = getActionItems(condo.id)
    .filter((i) => i.status !== "concluido" && i.status !== "cancelado")
    .sort((a, b) => {
      const ao = isOverdue(a.dueDate, a.status) ? 0 : 1;
      const bo = isOverdue(b.dueDate, b.status) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 6);

  const recentMeetings = getMeetings(condo.id).slice(0, 3);

  const realizadas = getVisits(condo.id).filter((v) => v.status === "realizada");
  const liveMetrics = {
    ...condo.valueMetrics,
    visitsDone: realizadas.length,
    unitsVisited: realizadas.reduce((sum, v) => sum + (v.units ?? 0), 0),
    diagnostics: realizadas.filter((v) => v.diagnostic).length,
    diagnosticsCourtesy: realizadas.filter((v) => v.diagnostic && v.diagnosticCourtesy).length,
    worksSupervised: getActionItems(condo.id).filter(
      (i) => i.category === "reforma" && i.status === "em_andamento",
    ).length,
    bids: getBids(condo.id).length,
  };

  return (
    <div className="animate-rise">
      {/* Header */}
      <div className="border-b bg-background/60 px-4 py-6 md:px-8 md:py-7">
        <Link
          href="/condominios"
          className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Condomínios
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-[1.75rem]">
                {condo.name}
              </h1>
              <Badge tone={gs.tone} dot>
                {gs.label}
              </Badge>
              <Badge tone={cs.tone}>{cs.label}</Badge>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" /> {condo.address || "Endereço não informado"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Pencil className="size-4" /> Editar
            </button>
            <Link
              href={`/condominios/${condo.id}/plano-de-acao`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ListChecks className="size-4" /> Plano de ação
            </Link>
            <Link
              href="/relatorios"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <FileText className="size-4" /> Relatório
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 md:px-8">
        {condo.photoUrl && (
          <div className="h-48 w-full overflow-hidden rounded-xl border bg-muted md:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={condo.photoUrl} alt={`Fachada — ${condo.name}`} className="h-full w-full object-cover" />
          </div>
        )}

        {(contract.state === "a_vencer" || contract.state === "vencido") && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm",
              contract.state === "vencido"
                ? "border-danger/30 bg-danger-soft text-danger"
                : "border-warning/40 bg-warning-soft text-warning-foreground",
            )}
          >
            <AlertTriangle className="size-4 shrink-0" />
            <span className="font-medium">
              {contract.state === "vencido" ? "Contrato vencido" : "Contrato próximo do término"} — {contract.label}.
            </span>
            {condo.contractEnd && (
              <span className="font-mono text-xs opacity-80">Término: {fmtDate(condo.contractEnd)}</span>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="ml-auto rounded-md border border-current/30 px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
            >
              Renovar / editar
            </button>
          </div>
        )}

        <ServiceScope services={condo.services} />

        {/* Resumo executivo */}
        <section>
          <div className="eyebrow mb-3">Resumo executivo</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Pendências abertas" value={stats.openItems} icon={ClipboardList} tone="neutral" />
            <StatCard label="Atrasadas" value={stats.overdueItems} icon={AlertTriangle} tone="danger" />
            <StatCard label="Concluídas" value={stats.doneItems} icon={CheckCircle2} tone="success" />
            <StatCard label="Orçamentos" value={stats.bidsInProgress} icon={Gavel} tone="copper" />
            <StatCard label="Visitas no mês" value={stats.visitsThisMonth} icon={CalendarRange} tone="info" />
            <StatCard label="Reuniões no mês" value={stats.meetingsThisMonth} icon={CalendarDays} tone="info" />
          </div>
        </section>

        <ValueIndicators metrics={liveMetrics} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Próximas ações */}
          <Panel className="lg:col-span-2">
            <PanelHeader
              eyebrow="Vencimento futuro e atrasos"
              title="Próximas ações"
              action={
                <Link
                  href={`/condominios/${condo.id}/plano-de-acao`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Plano completo <ArrowUpRight className="size-3.5" />
                </Link>
              }
            />
            <div className="divide-y">
              {proximasAcoes.map((item) => (
                <ActionItemRow key={item.id} item={item} />
              ))}
              {proximasAcoes.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma pendência aberta. Tudo em dia.
                </div>
              )}
            </div>
          </Panel>

          {/* Sidebar: ficha + contatos + agenda */}
          <div className="space-y-6">
            {/* Ficha */}
            <Panel>
              <PanelHeader eyebrow="Cadastro" title="Ficha do condomínio" />
              <dl className="divide-y text-sm">
                <Field icon={Hash} label="CNPJ" value={condo.cnpj || "—"} mono />
                <Field icon={Building} label="Administradora" value={condo.administrator || "—"} />
                <Field icon={UserIcon} label="Responsável Assyst" value={responsible?.name ?? "—"} />
                <div className="flex items-start gap-3 px-5 py-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">Contrato</dt>
                    <dd className="font-mono text-xs">
                      {condo.contractStart || condo.contractEnd
                        ? `${condo.contractStart ? fmtDate(condo.contractStart) : "—"} → ${condo.contractEnd ? fmtDate(condo.contractEnd) : "—"}`
                        : "—"}
                    </dd>
                    {condo.contractEnd && (
                      <dd className="mt-1.5">
                        <Badge tone={contract.tone} dot>{contract.label}</Badge>
                      </dd>
                    )}
                  </div>
                </div>
              </dl>
            </Panel>

            {/* Contatos */}
            <Panel>
              <PanelHeader
                eyebrow="Pessoas"
                title="Contatos"
                action={
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Gerenciar <Pencil className="size-3" />
                  </button>
                }
              />
              {condo.contacts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
                  <Users2 className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
                  <button type="button" onClick={() => setEditing(true)} className="text-xs font-medium text-primary hover:underline">
                    Adicionar contato
                  </button>
                </div>
              ) : (
                <ul className="divide-y">
                  {condo.contacts.map((c) => (
                    <li key={c.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{c.name}</span>
                        <Badge tone="neutral">
                          {c.role === "outro" ? c.customRole || "Outro" : contactRole[c.role].label}
                        </Badge>
                      </div>
                      {(c.phone || c.email) && (
                        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {c.phone && (
                            <div className="flex items-center gap-1.5"><Phone className="size-3" /> <span className="font-mono">{c.phone}</span></div>
                          )}
                          {c.email && (
                            <div className="flex items-center gap-1.5"><Mail className="size-3" /> {c.email}</div>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Próxima agenda */}
            <Panel>
              <PanelHeader eyebrow="Agenda" title="Próximos compromissos" />
              <div className="space-y-3 px-5 py-4 text-sm">
                <NextItem
                  label="Próxima visita"
                  value={
                    stats.nextVisit
                      ? `${fmtDate(stats.nextVisit.date)} · ${stats.nextVisit.start}`
                      : "Sem visita agendada"
                  }
                  has={!!stats.nextVisit}
                />
                <NextItem
                  label="Próxima reunião"
                  value={
                    stats.nextMeeting
                      ? `${fmtDate(stats.nextMeeting.date)} · ${stats.nextMeeting.time}`
                      : "Sem reunião agendada"
                  }
                  has={!!stats.nextMeeting}
                />
              </div>
            </Panel>
          </div>
        </div>

        {/* Reuniões recentes */}
        <Panel>
          <PanelHeader
            eyebrow="Histórico"
            title="Reuniões recentes"
            action={
              <Link
                href="/reunioes"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Ver todas <ArrowUpRight className="size-3.5" />
              </Link>
            }
          />
          <div className="divide-y">
            {recentMeetings.map((m) => (
              <div key={m.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={meetingType[m.type].tone}>{meetingType[m.type].label}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {fmtDateShort(m.date)} · {m.time}
                  </span>
                </div>
                <p className="mt-2 text-sm">{m.summary}</p>
              </div>
            ))}
            {recentMeetings.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Nenhuma reunião registrada.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <CondoDialog
        open={editing}
        onClose={() => setEditing(false)}
        initial={condo}
        onSubmit={(input) => updateCondo(condo.id, input)}
      />
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className={`truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
      </div>
    </div>
  );
}

function NextItem({ label, value, has }: { label: string; value: string; has: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={has ? "font-medium" : "text-muted-foreground"}>{value}</span>
    </div>
  );
}
