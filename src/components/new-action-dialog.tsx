"use client";

import * as React from "react";
import { X, ListPlus, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { users } from "@/lib/mock-data";
import { category, priority, actionStatus, coverage, TODAY } from "@/lib/domain";
import type {
  ActionItem,
  ActionCategory,
  Priority,
  ActionStatus,
  ActionOrigin,
  ResponsibleKind,
  Coverage,
  Condominium,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const ORIGINS: { value: ActionOrigin; label: string }[] = [
  { value: "interno", label: "Interno" },
  { value: "reuniao", label: "Reunião" },
  { value: "visita", label: "Visita" },
  { value: "email", label: "E-mail" },
];

const KINDS: { value: ResponsibleKind; label: string }[] = [
  { value: "assyst", label: "Assyst" },
  { value: "condominio", label: "Condomínio" },
  { value: "fornecedor", label: "Fornecedor" },
];

/** Pre-registered actions for fast logging of common / unplanned tasks. */
const TEMPLATES: {
  label: string;
  title: string;
  cat: ActionCategory;
  origin: ActionOrigin;
  kind?: ResponsibleKind;
}[] = [
  { label: "Reunião com fornecedor", title: "Reunião com fornecedor", cat: "reuniao", origin: "interno" },
  { label: "Verificar Manuhelp", title: "Verificar se o app de manutenção (Manuhelp) está sendo alimentado", cat: "gestao", origin: "interno" },
  { label: "Solicitar 3 orçamentos", title: "Solicitar 3 orçamentos", cat: "orcamento", origin: "interno" },
  { label: "Vistoria técnica", title: "Realizar vistoria técnica", cat: "laudo", origin: "visita" },
  { label: "Demanda do síndico", title: "Demanda do síndico: ", cat: "gestao", origin: "reuniao" },
  { label: "Cobrar documentação", title: "Cobrar documentação pendente", cat: "documentacao", origin: "email", kind: "condominio" },
  { label: "Acompanhar obra", title: "Acompanhar andamento da obra", cat: "reforma", origin: "visita" },
];

export function NewActionDialog({
  open,
  onClose,
  onCreate,
  condos,
  fixedCondoId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (item: ActionItem) => void;
  condos: Condominium[];
  fixedCondoId?: string;
}) {
  const [condoId, setCondoId] = React.useState(fixedCondoId ?? condos[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [cat, setCat] = React.useState<ActionCategory>("gestao");
  const [prio, setPrio] = React.useState<Priority>("media");
  const [status, setStatus] = React.useState<ActionStatus>("nao_iniciado");
  const [origin, setOrigin] = React.useState<ActionOrigin>("interno");
  const [kind, setKind] = React.useState<ResponsibleKind>("assyst");
  const [userId, setUserId] = React.useState(users[0]?.id ?? "");
  const [respName, setRespName] = React.useState("");
  const [dueDate, setDueDate] = React.useState(TODAY);
  const [cov, setCov] = React.useState<Coverage | "">("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open && fixedCondoId) setCondoId(fixedCondoId);
  }, [open, fixedCondoId]);

  if (!open) return null;

  function handleCreate() {
    const responsibleName =
      kind === "assyst" ? users.find((u) => u.id === userId)?.name : respName;
    const item: ActionItem = {
      id: `act-${Date.now()}`,
      condoId,
      title: title.trim(),
      description: description.trim() || undefined,
      category: cat,
      responsibleKind: kind,
      responsibleId: kind === "assyst" ? userId : undefined,
      responsibleName: responsibleName || undefined,
      dueDate,
      priority: prio,
      status,
      origin,
      coverage: cov || undefined,
      notes: notes.trim() || undefined,
      createdAt: TODAY,
      updatedAt: TODAY,
    };
    onCreate(item);
    reset();
    onClose();
  }

  function reset() {
    setTitle("");
    setDescription("");
    setCat("gestao");
    setPrio("media");
    setStatus("nao_iniciado");
    setOrigin("interno");
    setCov("");
    setNotes("");
  }

  function applyTemplate(t: (typeof TEMPLATES)[number]) {
    setTitle(t.title);
    setCat(t.cat);
    setOrigin(t.origin);
    if (t.kind) setKind(t.kind);
  }

  return (
    <Modal open={open} onClose={onClose}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
              <ListPlus className="size-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold leading-tight">Nova pendência</h2>
              <p className="text-xs text-muted-foreground">Cria um item no Plano de Ação</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {/* Modelos rápidos — ações pré-cadastradas */}
          <div className="mb-4">
            <div className="eyebrow mb-2">Modelos rápidos</div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" className="sm:col-span-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="O que precisa ser feito?" className={inputCls} autoFocus />
            </Field>

            <Field label="Condomínio">
              <select value={condoId} onChange={(e) => setCondoId(e.target.value)} disabled={!!fixedCondoId} className={cn(inputCls, fixedCondoId && "opacity-60")}>
                {condos.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Categoria">
              <select value={cat} onChange={(e) => setCat(e.target.value as ActionCategory)} className={inputCls}>
                {Object.entries(category).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Responsável (tipo)">
              <div className="grid grid-cols-3 gap-1.5">
                {KINDS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKind(k.value)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                      kind === k.value ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Responsável">
              {kind === "assyst" ? (
                <select value={userId} onChange={(e) => setUserId(e.target.value)} className={inputCls}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              ) : (
                <input value={respName} onChange={(e) => setRespName(e.target.value)} placeholder="Nome do responsável" className={inputCls} />
              )}
            </Field>

            <Field label="Prazo">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </Field>

            <Field label="Origem">
              <select value={origin} onChange={(e) => setOrigin(e.target.value as ActionOrigin)} className={inputCls}>
                {ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Prioridade" className="sm:col-span-2">
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(priority) as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrio(p)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-sm font-medium transition-colors",
                      prio === p ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {priority[p].label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as ActionStatus)} className={inputCls}>
                {Object.entries(actionStatus).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Cobertura">
              <div className="grid grid-cols-3 gap-1.5">
                <button type="button" onClick={() => setCov("")} className={cn("rounded-md border px-2 py-1.5 text-xs font-medium transition-colors", cov === "" ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted")}>—</button>
                {(Object.keys(coverage) as Coverage[]).map((c) => (
                  <button key={c} type="button" onClick={() => setCov(c)} className={cn("rounded-md border px-2 py-1.5 text-xs font-medium transition-colors", cov === c ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted")}>
                    {coverage[c].label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Descrição / observações" className="sm:col-span-2">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={cn(inputCls, "h-auto py-2")} placeholder="Opcional" />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
          <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!title.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" /> Criar pendência
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
