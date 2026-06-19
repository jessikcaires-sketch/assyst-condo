"use client";

import * as React from "react";
import {
  Plus,
  Users,
  CheckCircle2,
  ArrowRightCircle,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { getMeetings } from "@/lib/mock-data";
import { useCondos } from "@/lib/condo-store";
import { meetingType, fmtDate, TODAY } from "@/lib/domain";
import type { Meeting, MeetingType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MeetingsView() {
  const condos = useCondos();
  const condoName = (id: string) => condos.find((c) => c.id === id)?.name ?? "—";
  const [meetings, setMeetings] = React.useState<Meeting[]>(() => getMeetings());
  const [condoFilter, setCondoFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [converted, setConverted] = React.useState<Set<string>>(new Set());

  const visible = meetings
    .filter((m) => (condoFilter ? m.condoId === condoFilter : true))
    .filter((m) => (typeFilter ? m.type === typeFilter : true))
    .sort((a, b) => b.date.localeCompare(a.date));

  function convert(key: string) {
    setConverted((prev) => new Set(prev).add(key));
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select value={condoFilter} onChange={(e) => setCondoFilter(e.target.value)} className={filterCls}>
            <option value="">Todos os condomínios</option>
            {condos.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterCls}>
            <option value="">Todos os tipos</option>
            {Object.entries(meetingType).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> Nova reunião
        </button>
      </div>

      {/* Meetings */}
      <div className="space-y-4">
        {visible.map((m) => (
          <MeetingCard key={m.id} meeting={m} condoName={condoName(m.condoId)} converted={converted} onConvert={convert} />
        ))}
        {visible.length === 0 && (
          <Panel className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nenhuma reunião encontrada para os filtros.
          </Panel>
        )}
      </div>

      <p className="font-mono text-xs text-muted-foreground">{visible.length} reuniões</p>

      <NewMeetingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(meeting) => setMeetings((prev) => [meeting, ...prev])}
        condos={condos}
        defaultDateISO={TODAY}
      />
    </div>
  );
}

function MeetingCard({
  meeting,
  condoName,
  converted,
  onConvert,
}: {
  meeting: Meeting;
  condoName: string;
  converted: Set<string>;
  onConvert: (key: string) => void;
}) {
  const [ataOpen, setAtaOpen] = React.useState(false);
  const mt = meetingType[meeting.type];

  return (
    <Panel className="overflow-hidden p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold leading-tight">{condoName}</h3>
            <Badge tone={mt.tone}>{mt.label}</Badge>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {fmtDate(meeting.date)} · {meeting.time}
          </p>
        </div>
        {meeting.participants.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {meeting.participants.join(" · ")}
          </div>
        )}
      </div>

      <div className="grid gap-5 px-5 py-4 lg:grid-cols-2">
        {/* Resumo + decisões */}
        <div className="space-y-4">
          <div>
            <div className="eyebrow mb-1.5">Resumo</div>
            <p className="text-sm leading-relaxed">{meeting.summary}</p>
          </div>
          {meeting.decisions.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5">Decisões</div>
              <ul className="space-y-1.5">
                {meeting.decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {meeting.ata && (
            <div>
              <button
                type="button"
                onClick={() => setAtaOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <FileText className="size-3.5" />
                {ataOpen ? "Ocultar ata" : "Ver ata completa"}
                <ChevronDown className={cn("size-3.5 transition-transform", ataOpen && "rotate-180")} />
              </button>
              {ataOpen && (
                <p className="mt-2 whitespace-pre-line rounded-md border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
                  {meeting.ata}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Próximos passos — conversão em pendências */}
        <div>
          <div className="eyebrow mb-1.5">Próximos passos</div>
          {meeting.nextSteps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum próximo passo registrado.</p>
          ) : (
            <ul className="space-y-2">
              {meeting.nextSteps.map((s, i) => {
                const key = `${meeting.id}:${i}`;
                const done = converted.has(key);
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                  >
                    <span className="min-w-0 text-sm">{s}</span>
                    {done ? (
                      <Badge tone="success" className="shrink-0">
                        <CheckCircle2 className="size-3" /> Pendência criada
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onConvert(key)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        title="Converter em pendência no Plano de Ação"
                      >
                        <ArrowRightCircle className="size-3.5" /> Criar pendência
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}

const filterCls =
  "h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
