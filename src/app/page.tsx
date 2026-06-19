import Link from "next/link";
import {
  Building2,
  ClipboardList,
  AlertTriangle,
  CalendarRange,
  CalendarDays,
  Gavel,
  UserCheck,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Panel, PanelHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getGlobalStats,
  getVisits,
  getMeetings,
  getCondo,
  getUser,
} from "@/lib/mock-data";
import {
  fmtDate,
  fmtDateShort,
  relativeDays,
  visitType,
  meetingType,
  TODAY,
} from "@/lib/domain";

export default function DashboardPage() {
  const stats = getGlobalStats();

  const upcomingVisits = getVisits()
    .filter((v) => v.status === "agendada")
    .slice(0, 5);
  const recentMeetings = getMeetings().slice(0, 4);

  const cards = [
    { label: "Condomínios ativos", value: stats.activeCondos, icon: Building2, tone: "info" as const, hint: "sob gestão Assyst" },
    { label: "Pendências abertas", value: stats.openItems, icon: ClipboardList, tone: "neutral" as const, hint: "em todos os condomínios" },
    { label: "Pendências atrasadas", value: stats.overdueItems, icon: AlertTriangle, tone: "danger" as const, hint: "requerem ação imediata" },
    { label: "Orçamentos em andamento", value: stats.bidsInProgress, icon: Gavel, tone: "copper" as const, hint: "BIDs ativos" },
    { label: "Visitas da semana", value: stats.visitsThisWeek, icon: CalendarRange, tone: "info" as const, hint: "próximos 7 dias" },
    { label: "Reuniões da semana", value: stats.meetingsThisWeek, icon: CalendarDays, tone: "info" as const, hint: "próximos 7 dias" },
    { label: "Aguardando cliente", value: stats.awaitingClient, icon: UserCheck, tone: "warning" as const, hint: "pendentes do condomínio" },
    { label: "Aguardando fornecedor", value: stats.awaitingSupplier, icon: Truck, tone: "copper" as const, hint: "pendentes de terceiros" },
  ];

  const maxCondo = Math.max(...stats.topCondos.map((c) => c.count), 1);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Visão geral · Assyst Engenharia"
        title="Centro de Operações"
        description="Situação consolidada de todos os condomínios — pendências, agenda, reuniões e suprimentos em um único painel."
      />

      <div className="space-y-6 px-4 py-6 md:px-8">
        {/* Indicators */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((c, i) => (
            <StatCard
              key={c.label}
              {...c}
              style={{ animationDelay: `${i * 45}ms` }}
              className="animate-rise"
            />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Agenda da semana */}
          <Panel className="lg:col-span-2">
            <PanelHeader
              eyebrow="Próximos 7 dias"
              title="Agenda da semana"
              action={
                <Link
                  href="/agenda"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ver agenda <ArrowUpRight className="size-3.5" />
                </Link>
              }
            />
            <ul className="divide-y">
              {upcomingVisits.map((v) => {
                const condo = getCondo(v.condoId);
                const pro = getUser(v.professionalId);
                return (
                  <li
                    key={v.id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-md border bg-card py-1.5">
                      <span className="font-mono text-[0.625rem] uppercase text-muted-foreground">
                        {fmtDateShort(v.date)}
                      </span>
                      <span className="font-display text-sm font-semibold">
                        {v.start}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {condo?.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {visitType[v.type].label} · {pro?.name}
                      </div>
                    </div>
                    <Badge tone="info" dot>
                      {relativeDays(v.date)}
                    </Badge>
                  </li>
                );
              })}
              {upcomingVisits.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma visita agendada para a semana.
                </li>
              )}
            </ul>
          </Panel>

          {/* Top condomínios */}
          <Panel>
            <PanelHeader
              eyebrow="Carga de trabalho"
              title="Top condomínios"
            />
            <div className="space-y-4 px-5 py-4">
              {stats.topCondos.map((row) => (
                <Link
                  key={row.condo.id}
                  href={`/condominios/${row.condo.id}`}
                  className="block"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{row.condo.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/80"
                      style={{ width: `${(row.count / maxCondo) * 100}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Reuniões recentes */}
          <Panel className="lg:col-span-2">
            <PanelHeader
              eyebrow="Registro"
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
            <ul className="divide-y">
              {recentMeetings.map((m) => {
                const condo = getCondo(m.condoId);
                return (
                  <li key={m.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {condo?.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.summary}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge tone={meetingType[m.type].tone}>
                          {meetingType[m.type].label}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground">
                          {fmtDateShort(m.date)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {/* Top responsáveis */}
          <Panel>
            <PanelHeader eyebrow="Equipe" title="Top responsáveis" />
            <ul className="divide-y">
              {stats.topResponsibles.map((row) => (
                <li
                  key={row.user.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold">
                    {row.user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {row.user.name}
                    </div>
                    <div className="truncate font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                      {row.user.role}
                    </div>
                  </div>
                  <span className="font-display text-lg font-semibold tabular-nums">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <p className="pt-2 text-center font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground/70">
          Dados de demonstração · {fmtDate(TODAY)}
        </p>
      </div>
    </div>
  );
}
