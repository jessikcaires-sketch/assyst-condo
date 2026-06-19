"use client";

import * as React from "react";
import { X, CalendarPlus, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { meetingType } from "@/lib/domain";
import type { Condominium, Meeting, MeetingType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: MeetingType[] = ["semanal", "mensal", "extraordinaria"];

export function NewMeetingDialog({
  open,
  onClose,
  onCreate,
  condos,
  defaultDateISO,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (meeting: Meeting) => void;
  condos: Condominium[];
  defaultDateISO: string;
}) {
  const [condoId, setCondoId] = React.useState(condos[0]?.id ?? "");
  const [date, setDate] = React.useState(defaultDateISO);
  const [time, setTime] = React.useState("10:00");
  const [type, setType] = React.useState<MeetingType>("semanal");
  const [participants, setParticipants] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [ata, setAta] = React.useState("");
  const [decisions, setDecisions] = React.useState<string[]>([""]);
  const [nextSteps, setNextSteps] = React.useState<string[]>([""]);

  React.useEffect(() => {
    if (open) setDate(defaultDateISO);
  }, [open, defaultDateISO]);

  if (!open) return null;

  function handleCreate() {
    const meeting: Meeting = {
      id: `m-${Date.now()}`,
      condoId,
      date,
      time,
      type,
      participants: participants.split(",").map((p) => p.trim()).filter(Boolean),
      summary,
      ata: ata || undefined,
      decisions: decisions.map((d) => d.trim()).filter(Boolean),
      nextSteps: nextSteps.map((s) => s.trim()).filter(Boolean),
    };
    onCreate(meeting);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
              <CalendarPlus className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold leading-tight">Nova reunião</h2>
              <p className="text-xs text-muted-foreground">Registre a ata, decisões e próximos passos</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Condomínio" className="sm:col-span-2">
              <select value={condoId} onChange={(e) => setCondoId(e.target.value)} className={inputCls}>
                {condos.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Data">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Horário">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Tipo" className="sm:col-span-2">
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      type === t ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {meetingType[t].label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Participantes (separados por vírgula)" className="sm:col-span-2">
              <input type="text" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Ex.: Rafael Tavares, Carlos Menezes" className={inputCls} />
            </Field>

            <Field label="Resumo" className="sm:col-span-2">
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={cn(inputCls, "h-auto py-2")} />
            </Field>

            <Field label="Ata (opcional)" className="sm:col-span-2">
              <textarea value={ata} onChange={(e) => setAta(e.target.value)} rows={3} placeholder="Texto completo da ata…" className={cn(inputCls, "h-auto py-2")} />
            </Field>

            <ListEditor label="Decisões" items={decisions} setItems={setDecisions} placeholder="Decisão tomada…" className="sm:col-span-2" />
            <ListEditor label="Próximos passos" items={nextSteps} setItems={setNextSteps} placeholder="Ação a executar…" className="sm:col-span-2" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted">
            Cancelar
          </button>
          <button type="button" onClick={handleCreate} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            <CheckCircle2 className="size-4" /> Registrar reunião
          </button>
        </div>
    </Modal>
  );
}

const inputCls =
  "h-9 w-full rounded-md border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ListEditor({
  label,
  items,
  setItems,
  placeholder,
  className,
}: {
  label: string;
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => setItems((prev) => prev.map((p, idx) => (idx === i ? e.target.value : p)))}
              placeholder={placeholder}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : [""]))}
              className="shrink-0 rounded-md border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
              aria-label="Remover"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, ""])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="size-3.5" /> Adicionar
      </button>
    </div>
  );
}
