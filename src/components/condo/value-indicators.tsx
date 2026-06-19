import {
  MapPin,
  HardHat,
  Building,
  ScanLine,
  Gavel,
  FileText,
  Zap,
  PencilLine,
} from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/card";
import type { ValueMetrics } from "@/lib/types";

/** Where each indicator is fed from: auto = computed from a module, manual = captured during the activity. */
type Source = { label: string; auto: boolean };

export function ValueIndicators({ metrics }: { metrics: ValueMetrics }) {
  const tiles: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    hint?: string;
    copper?: boolean;
    source: Source;
  }[] = [
    { label: "Visitas realizadas", value: metrics.visitsDone, icon: MapPin, source: { label: "Agenda", auto: true } },
    { label: "Obras fiscalizadas", value: metrics.worksSupervised, icon: HardHat, hint: "em andamento", source: { label: "Plano de ação", auto: true } },
    { label: "Unidades visitadas", value: metrics.unitsVisited, icon: Building, hint: "privativas · somadas das visitas", source: { label: "Agenda", auto: true } },
    {
      label: "Diagnósticos de engenharia",
      value: metrics.diagnostics,
      icon: ScanLine,
      hint: metrics.diagnosticsCourtesy > 0 ? `${metrics.diagnosticsCourtesy} cortesia · drone/termografia` : "drone/termografia",
      copper: metrics.diagnosticsCourtesy > 0,
      source: { label: "Agenda", auto: true },
    },
    { label: "Orçamentos (BID)", value: metrics.bids, icon: Gavel, source: { label: "Módulo BID", auto: true } },
    { label: "Relatórios emitidos", value: metrics.reports, icon: FileText, source: { label: "Safety Culture · externo", auto: true } },
  ];

  return (
    <Panel>
      <PanelHeader
        eyebrow="Valor agregado · apresentação ao síndico"
        title="Indicadores de valor"
        action={
          <span className="inline-flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Zap className="size-3 text-success" /> automático</span>
            <span className="inline-flex items-center gap-1"><PencilLine className="size-3 text-copper" /> informado</span>
          </span>
        }
      />
      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" />
                <span className="font-mono text-[0.625rem] uppercase tracking-wide">{t.label}</span>
              </div>
              <div className="mt-2 font-display text-2xl font-semibold tabular-nums">{t.value}</div>
              {t.hint && (
                <div className={`mt-0.5 text-xs ${t.copper ? "font-medium text-copper" : "text-muted-foreground"}`}>{t.hint}</div>
              )}
              <div className="mt-2 inline-flex items-center gap-1 border-t pt-2 font-mono text-[0.5625rem] uppercase tracking-wide text-muted-foreground/80">
                {t.source.auto ? (
                  <Zap className="size-2.5 text-success" />
                ) : (
                  <PencilLine className="size-2.5 text-copper" />
                )}
                {t.source.label}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
