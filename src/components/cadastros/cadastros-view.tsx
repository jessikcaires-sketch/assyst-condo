"use client";

import * as React from "react";
import { Plus, Trash2, Users2, Wrench, Building, Pencil, Check, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel, PanelHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCatalogs } from "@/lib/catalog-store";
import { serviceColorAt } from "@/lib/service-color";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const inputCls =
  "h-9 w-full rounded-md border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20";

const ROLES: { value: User["role"]; label: string }[] = [
  { value: "gestor", label: "Gestor" },
  { value: "engenheiro", label: "Engenheiro(a)" },
  { value: "admin", label: "Administrativo" },
];

export function CadastrosView() {
  const cat = useCatalogs();

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Configuração"
        title="Cadastros & listas"
        description="Listas dinâmicas que alimentam os seletores do sistema. Edite responsáveis, serviços e administradoras — tudo reflete no cadastro dos condomínios."
      />
      <div className="grid gap-6 px-4 py-6 md:px-8 lg:grid-cols-2">
        <ResponsiblesPanel />
        <div className="space-y-6">
          <StringListPanel
            icon={Wrench}
            title="Serviços"
            hint="Escopo prestado nos condomínios"
            items={cat.services}
            onAdd={cat.addService}
            onRemove={cat.removeService}
            placeholder="Ex.: Inspeção predial"
            colored
          />
          <StringListPanel
            icon={Building}
            title="Administradoras"
            hint="Administradoras parceiras"
            items={cat.administrators}
            onAdd={cat.addAdministrator}
            onRemove={cat.removeAdministrator}
            placeholder="Ex.: Lello Condomínios"
          />
        </div>
      </div>
    </div>
  );
}

/* ----- Responsáveis (lista de objetos) ----- */

function ResponsiblesPanel() {
  const cat = useCatalogs();
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<User["role"]>("engenheiro");
  const [email, setEmail] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");

  function add() {
    if (!name.trim()) return;
    cat.addResponsible({ name, role, email });
    setName("");
    setEmail("");
    setRole("engenheiro");
  }

  return (
    <Panel>
      <PanelHeader eyebrow="Equipe Assyst" title="Responsáveis" />
      <div className="border-b px-5 py-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do responsável" className={inputCls}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
          <select value={role} onChange={(e) => setRole(e.target.value as User["role"])} className={inputCls}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail (opcional)" className={cn(inputCls, "sm:col-span-2")}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
          <button type="button" onClick={add} disabled={!name.trim()}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:col-span-2">
            <Plus className="size-4" /> Adicionar responsável
          </button>
        </div>
      </div>
      <ul className="divide-y">
        {cat.responsibles.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-5 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[0.6875rem] font-semibold">
              {r.initials}
            </span>
            {editingId === r.id ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={cn(inputCls, "h-8 flex-1")} />
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="E-mail" className={cn(inputCls, "h-8 flex-1")} />
                <button type="button" onClick={() => { cat.updateResponsible(r.id, { name: editName.trim() || r.name, email: editEmail.trim() }); setEditingId(null); }}
                  className="rounded p-1.5 text-success hover:bg-muted" aria-label="Salvar"><Check className="size-4" /></button>
                <button type="button" onClick={() => setEditingId(null)} className="rounded p-1.5 text-muted-foreground hover:bg-muted" aria-label="Cancelar"><X className="size-4" /></button>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.name}</span>
                    <Badge tone="neutral">{ROLES.find((x) => x.value === r.role)?.label ?? r.role}</Badge>
                  </div>
                  {r.email && <span className="truncate text-xs text-muted-foreground">{r.email}</span>}
                </div>
                <button type="button" onClick={() => { setEditingId(r.id); setEditName(r.name); setEditEmail(r.email ?? ""); }}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Editar ${r.name}`}><Pencil className="size-3.5" /></button>
                <button type="button" onClick={() => cat.removeResponsible(r.id)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-danger" aria-label={`Remover ${r.name}`}><Trash2 className="size-3.5" /></button>
              </>
            )}
          </li>
        ))}
        {cat.responsibles.length === 0 && (
          <li className="flex flex-col items-center gap-2 px-5 py-8 text-center text-sm text-muted-foreground">
            <Users2 className="size-5" /> Nenhum responsável cadastrado.
          </li>
        )}
      </ul>
    </Panel>
  );
}

/* ----- Lista de strings genérica (serviços, administradoras…) ----- */

function StringListPanel({
  icon: Icon,
  title,
  hint,
  items,
  onAdd,
  onRemove,
  placeholder,
  colored = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  placeholder: string;
  colored?: boolean;
}) {
  const [value, setValue] = React.useState("");
  function add() {
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  }
  return (
    <Panel>
      <PanelHeader eyebrow={hint} title={title} />
      <div className="border-b px-5 py-4">
        <div className="flex gap-2">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className={cn(inputCls, "flex-1")}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
          <button type="button" onClick={add} disabled={!value.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
            <Plus className="size-4" /> Adicionar
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-8 text-center text-sm text-muted-foreground">
          <Icon className="size-5" /> Lista vazia.
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2 px-5 py-4">
          {items.map((it, i) => (
            <li
              key={it}
              style={colored ? serviceColorAt(i) : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border py-1 pl-3 pr-1.5 text-sm",
                !colored && "bg-muted/30",
              )}
            >
              {it}
              <button type="button" onClick={() => onRemove(it)} className="rounded p-0.5 opacity-70 hover:opacity-100" aria-label={`Remover ${it}`}>
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
