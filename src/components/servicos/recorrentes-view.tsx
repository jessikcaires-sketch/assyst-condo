"use client";

import Link from "next/link";
import { Repeat, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCondoStore } from "@/lib/condo-store";
import { useCatalogs } from "@/lib/catalog-store";
import { coverage } from "@/lib/domain";
import { serviceColor } from "@/lib/service-color";

export function RecorrentesView() {
  const { condos } = useCondoStore();
  const cat = useCatalogs();

  const groups = condos
    .map((c) => ({
      condo: c,
      services: c.services.filter((s) => (s.kind ?? "recorrente") === "recorrente"),
    }))
    .filter((g) => g.services.length > 0);

  const total = groups.reduce((n, g) => n + g.services.length, 0);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Operação"
        title="Serviços Recorrentes"
        description="Serviços de contrato em andamento (assessoria, gestão, fiscalização…) por condomínio."
      />

      <div className="px-4 py-6 md:px-8">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Repeat className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum serviço recorrente. Abra um condomínio, edite e adicione um serviço do tipo
              <strong> Recorrente</strong>.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 font-mono text-xs text-muted-foreground">
              {total} serviço{total === 1 ? "" : "s"} recorrente{total === 1 ? "" : "s"} em {groups.length} condomínio{groups.length === 1 ? "" : "s"}
            </p>
            <Panel className="divide-y p-0">
              {groups.map(({ condo, services }) => (
                <div key={condo.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/condominios/${condo.id}`} className="group flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground">
                      <Building2 className="size-4" />
                    </span>
                    <span className="font-medium leading-tight group-hover:text-primary">{condo.name}</span>
                  </Link>
                  <div className="flex flex-wrap gap-1.5 sm:justify-end">
                    {services.map((s) => (
                      <span key={s.name} className="inline-flex items-center gap-1.5">
                        <span style={serviceColor(s.name, cat.services)} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                          {s.name}
                        </span>
                        {s.coverage === "cortesia" && <Badge tone="copper">{coverage.cortesia.label}</Badge>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
