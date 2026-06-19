import { FileSignature, Gift, ScrollText } from "lucide-react";
import { Panel } from "@/components/ui/card";
import { serviceColor } from "@/lib/service-color";
import type { ContractedService } from "@/lib/types";

export function ServiceScope({
  services,
  catalogServices,
}: {
  services: ContractedService[];
  catalogServices?: string[];
}) {
  const contrato = services.filter((s) => s.coverage === "contrato");
  const cortesia = services.filter((s) => s.coverage === "cortesia");

  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex items-center gap-2.5 border-b bg-muted/30 px-5 py-3">
        <ScrollText className="size-4 text-primary" />
        <div>
          <div className="font-display text-sm font-semibold leading-tight">Escopo de serviço</div>
          <div className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
            Extraído do contrato
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        {/* Inclusos no contrato */}
        <div className="bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-info-soft text-info">
              <FileSignature className="size-3.5" />
            </span>
            <span className="text-sm font-semibold">Inclusos no contrato</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{contrato.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {contrato.map((s, i) => (
              <span
                key={i}
                style={serviceColor(s.name, catalogServices)}
                className="inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium"
              >
                {s.name}
              </span>
            ))}
            {contrato.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
          </div>
        </div>

        {/* Cortesias */}
        <div className="bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-[oklch(0.95_0.04_40)] text-copper">
              <Gift className="size-3.5" />
            </span>
            <span className="text-sm font-semibold">Cortesias</span>
            <span className="text-xs text-muted-foreground">· valor agregado</span>
            <span className="ml-auto font-mono text-xs text-muted-foreground">{cortesia.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cortesia.map((s, i) => (
              <span
                key={i}
                style={serviceColor(s.name, catalogServices)}
                className="inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-medium"
              >
                {s.name}
              </span>
            ))}
            {cortesia.length === 0 && <span className="text-sm text-muted-foreground">Nenhuma cortesia registrada</span>}
          </div>
        </div>
      </div>
    </Panel>
  );
}
