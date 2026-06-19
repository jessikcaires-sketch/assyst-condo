"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, LayoutGrid, List as ListIcon, Building2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CondoTable, type CondoRow } from "@/components/condo-table";
import { CondoDialog } from "@/components/condo/condo-dialog";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCondoStore } from "@/lib/condo-store";
import { useCatalogs } from "@/lib/catalog-store";
import { getCondoStats } from "@/lib/mock-data";
import { condoStatus, contractSignal } from "@/lib/domain";
import { serviceColor } from "@/lib/service-color";
import { cn } from "@/lib/utils";

type View = "lista" | "cards";

export function CondosView() {
  const { condos, addCondo } = useCondoStore();
  const cat = useCatalogs();
  const [openNew, setOpenNew] = React.useState(false);
  const [view, setView] = React.useState<View>("cards");
  const [nature, setNature] = React.useState<"" | "recorrente" | "pontual">("");

  const respName = (id: string) => cat.getResponsible(id)?.name ?? "—";
  const respInitials = (id: string) => cat.getResponsible(id)?.initials ?? "—";

  const shown = condos.filter((c) => {
    if (!nature) return true;
    const hasRec = c.services.some((s) => (s.kind ?? "recorrente") === "recorrente");
    const hasPon = c.services.some((s) => s.kind === "pontual");
    return nature === "recorrente" ? hasRec : hasPon;
  });

  const rows: CondoRow[] = shown.map((c) => {
    const stats = getCondoStats(c.id);
    return {
      id: c.id,
      name: c.name,
      address: c.address,
      responsibleName: respName(c.responsibleId),
      responsibleInitials: respInitials(c.responsibleId),
      administrator: c.administrator ?? "—",
      nextMeeting: stats.nextMeeting?.date,
      openItems: stats.openItems,
      overdueItems: stats.overdueItems,
      status: c.status,
      general: stats.general,
    };
  });

  const responsibles = [...new Set(rows.map((r) => r.responsibleName))].sort();
  const administrators = [...new Set(rows.map((r) => r.administrator))].sort();

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Operação"
        title="Condomínios"
        description="Carteira de condomínios sob gestão da Assyst. Filtre por responsável, administradora ou status e abra o painel de cada um."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border bg-card p-0.5 text-sm">
              <NatureBtn active={nature === ""} onClick={() => setNature("")}>Todos</NatureBtn>
              <NatureBtn active={nature === "recorrente"} onClick={() => setNature("recorrente")}>Recorrentes</NatureBtn>
              <NatureBtn active={nature === "pontual"} onClick={() => setNature("pontual")}>Pontuais</NatureBtn>
            </div>
            <div className="inline-flex rounded-md border bg-card p-0.5">
              <ViewBtn active={view === "cards"} onClick={() => setView("cards")} icon={LayoutGrid} label="Cards" />
              <ViewBtn active={view === "lista"} onClick={() => setView("lista")} icon={ListIcon} label="Lista" />
            </div>
            <button
              type="button"
              onClick={() => setOpenNew(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Novo condomínio
            </button>
          </div>
        }
      />
      <div className="px-4 py-6 md:px-8">
        {view === "lista" ? (
          <CondoTable rows={rows} responsibles={responsibles} administrators={administrators} />
        ) : (
          <CardsGrid />
        )}
      </div>

      <CondoDialog open={openNew} onClose={() => setOpenNew(false)} onSubmit={addCondo} />
    </div>
  );

  function CardsGrid() {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {shown.map((c) => {
          const stats = getCondoStats(c.id);
          const cs = condoStatus[c.status];
          const contract = contractSignal(c.contractEnd);
          const hasRec = c.services.some((s) => (s.kind ?? "recorrente") === "recorrente");
          const hasPon = c.services.some((s) => s.kind === "pontual");
          return (
            <Link key={c.id} href={`/condominios/${c.id}`} className="group">
              <Panel className="flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {c.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photoUrl} alt={`Fachada — ${c.name}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <Building2 className="size-10" />
                    </div>
                  )}
                  <div className="absolute left-2.5 top-2.5">
                    <Badge tone={contract.tone} dot>
                      {contract.state === "sem_data" ? "Sem contrato" : contract.label}
                    </Badge>
                  </div>
                  <div className="absolute right-2.5 top-2.5">
                    <Badge tone={cs.tone}>{cs.label}</Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold leading-snug tracking-tight group-hover:text-primary">
                      {c.name}
                    </h3>
                    {hasRec && <Badge tone="info">Recorrente</Badge>}
                    {hasPon && <Badge tone="copper">Pontual</Badge>}
                  </div>
                  <p className="flex items-start gap-1.5 text-xs uppercase leading-relaxed tracking-wide text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span>{c.address || "Endereço não informado"}</span>
                  </p>
                  {c.cnpj && (
                    <p className="font-mono text-xs text-muted-foreground">
                      CNPJ: <span className="text-foreground/80">{c.cnpj}</span>
                    </p>
                  )}
                  {c.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {c.services.map((s) => (
                        <span key={s.name} style={serviceColor(s.name, cat.services)} className="w-fit rounded border px-2 py-0.5 text-xs font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="grid size-5 place-items-center rounded-full bg-secondary font-mono text-[0.5625rem] font-semibold">
                        {respInitials(c.responsibleId)}
                      </span>
                      {respName(c.responsibleId)}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {stats.openItems} pend.
                      {stats.overdueItems > 0 && <span className="text-danger"> · {stats.overdueItems} atr.</span>}
                    </span>
                  </div>
                </div>
              </Panel>
            </Link>
          );
        })}
      </div>
    );
  }
}

function ViewBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}

function NatureBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded px-2.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
