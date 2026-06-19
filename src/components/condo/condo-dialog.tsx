"use client";

import * as React from "react";
import { X, Building2, CheckCircle2, Plus, Trash2, ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { condoStatus, contactRole, coverage } from "@/lib/domain";
import { useCatalogs } from "@/lib/catalog-store";
import type {
  Condominium,
  Contact,
  ContactRole,
  ContractedService,
  CondoStatus,
  Coverage,
} from "@/lib/types";
import type { CondoInput } from "@/lib/condo-store";
import { compressImage } from "@/lib/image";
import { serviceColor, serviceDot } from "@/lib/service-color";
import { cn } from "@/lib/utils";

const STATUSES = Object.keys(condoStatus) as CondoStatus[];
const ROLES = Object.keys(contactRole) as ContactRole[];

function blankContact(): Contact {
  return { id: `ct-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, role: "sindico", name: "", phone: "", email: "" };
}

export function CondoDialog({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CondoInput) => void;
  /** Quando presente, o diálogo está em modo edição. */
  initial?: Condominium;
}) {
  const editing = !!initial;
  const cat = useCatalogs();

  const [form, setForm] = React.useState({
    name: "",
    cnpj: "",
    address: "",
    administrator: "",
    contractStart: "",
    contractEnd: "",
    notes: "",
  });
  const [status, setStatus] = React.useState<CondoStatus>("ativo");
  const [responsibleId, setResponsibleId] = React.useState("");
  const [services, setServices] = React.useState<ContractedService[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [customService, setCustomService] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState<string | undefined>(undefined);

  // Recarrega o formulário sempre que abrir (novo) ou trocar o alvo (edição).
  React.useEffect(() => {
    if (!open) return;
    setForm({
      name: initial?.name ?? "",
      cnpj: initial?.cnpj ?? "",
      address: initial?.address ?? "",
      administrator: initial?.administrator ?? "",
      contractStart: initial?.contractStart ?? "",
      contractEnd: initial?.contractEnd ?? "",
      notes: initial?.notes ?? "",
    });
    setStatus(initial?.status ?? "ativo");
    setResponsibleId(initial?.responsibleId ?? cat.responsibles[0]?.id ?? "");
    setServices(initial?.services ?? []);
    setContacts(initial?.contacts ?? []);
    setCustomService("");
    setPhotoUrl(initial?.photoUrl);
  }, [open, initial, cat.responsibles]);

  if (!open) return null;

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPhotoUrl(compressed);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const hasService = (name: string) => services.some((s) => s.name === name);

  function toggleService(name: string) {
    setServices((prev) =>
      prev.some((s) => s.name === name)
        ? prev.filter((s) => s.name !== name)
        : [...prev, { name, coverage: "contrato" }],
    );
  }

  function addCustomService() {
    const name = customService.trim();
    if (!name || hasService(name)) {
      setCustomService("");
      return;
    }
    setServices((prev) => [...prev, { name, coverage: "contrato" }]);
    setCustomService("");
  }

  function setServiceCoverage(name: string, cov: Coverage) {
    setServices((prev) => prev.map((s) => (s.name === name ? { ...s, coverage: cov } : s)));
  }

  function updateContact(id: string, patch: Partial<Contact>) {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleSubmit() {
    const input: CondoInput = {
      name: form.name.trim(),
      cnpj: form.cnpj.trim() || undefined,
      photoUrl,
      address: form.address.trim(),
      administrator: form.administrator.trim() || undefined,
      responsibleId,
      contractStart: form.contractStart || undefined,
      contractEnd: form.contractEnd || undefined,
      notes: form.notes.trim() || undefined,
      status,
      services,
      contacts: contacts
        .filter((c) => c.name.trim())
        .map((c) => ({
          ...c,
          name: c.name.trim(),
          phone: c.phone?.trim() || undefined,
          email: c.email?.trim() || undefined,
          customRole: c.role === "outro" ? c.customRole?.trim() || undefined : undefined,
        })),
    };
    onSubmit(input);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold leading-tight">
              {editing ? "Editar condomínio" : "Novo condomínio"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Cadastro, contatos e escopo de serviços
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted" aria-label="Fechar">
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-[72vh] overflow-y-auto px-5 py-5">
        {/* Identificação */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do condomínio" className="sm:col-span-2">
            <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Ex.: Condomínio Hit High" />
          </Field>
          <Field label="CNPJ">
            <input value={form.cnpj} onChange={set("cnpj")} className={inputCls} placeholder="00.000.000/0000-00" />
          </Field>
          <Field label="Administradora">
            <input value={form.administrator} onChange={set("administrator")} list="adm-list" className={inputCls} placeholder="Selecione ou digite" />
            <datalist id="adm-list">
              {cat.administrators.map((a) => <option key={a} value={a} />)}
            </datalist>
          </Field>
          <Field label="Endereço" className="sm:col-span-2">
            <input value={form.address} onChange={set("address")} className={inputCls} placeholder="Rua, número — bairro, cidade/UF" />
          </Field>
          <Field label="Responsável Assyst">
            <select aria-label="Responsável Assyst" value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)} className={inputCls}>
              {cat.responsibles.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                    status === st ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {condoStatus[st].label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Início do contrato">
            <input type="date" value={form.contractStart} onChange={set("contractStart")} className={inputCls} />
          </Field>
          <Field label="Fim do contrato">
            <input type="date" value={form.contractEnd} onChange={set("contractEnd")} className={inputCls} />
          </Field>
        </div>

        {/* Foto da fachada */}
        <Section title="Foto da fachada" hint="Imagem de capa do condomínio" />
        <div className="flex items-center gap-4">
          <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted/40">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Fachada do condomínio" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="inline-flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-md border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted">
              <ImagePlus className="size-4" /> {photoUrl ? "Trocar foto" : "Enviar foto"}
              <input type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
            </label>
            {photoUrl && (
              <button type="button" onClick={() => setPhotoUrl(undefined)} className="w-fit text-xs font-medium text-muted-foreground hover:text-danger">
                Remover foto
              </button>
            )}
          </div>
        </div>

        {/* Serviços */}
        <Section title="Escopo de serviços" hint="Marque os serviços prestados neste condomínio" />
        <div className="flex flex-wrap gap-1.5">
          {cat.services.map((name) => {
            const active = hasService(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleService(name)}
                style={active ? serviceColor(name) : undefined}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  active ? "" : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={customService}
            onChange={(e) => setCustomService(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomService(); } }}
            placeholder="Outro serviço…"
            className={cn(inputCls, "flex-1")}
          />
          <button type="button" onClick={addCustomService} className="inline-flex h-9 items-center gap-1 rounded-md border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted">
            <Plus className="size-4" /> Adicionar
          </button>
        </div>
        {services.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {services.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: serviceDot(s.name) }} />
                  <span className="truncate">{s.name}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {(Object.keys(coverage) as Coverage[]).map((cov) => (
                    <button
                      key={cov}
                      type="button"
                      onClick={() => setServiceCoverage(s.name, cov)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[0.6875rem] font-medium transition-colors",
                        s.coverage === cov ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {coverage[cov].label}
                    </button>
                  ))}
                  <button type="button" onClick={() => toggleService(s.name)} className="ml-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-danger" aria-label={`Remover ${s.name}`}>
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Contatos */}
        <Section
          title="Contatos"
          hint="Síndico, zelador, gerente predial, conselho…"
          action={
            <button type="button" onClick={() => setContacts((p) => [...p, blankContact()])} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="size-3.5" /> Adicionar contato
            </button>
          }
        />
        {contacts.length === 0 && (
          <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            Nenhum contato cadastrado.
          </p>
        )}
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-2 flex items-center gap-2">
                <select
                  value={c.role}
                  onChange={(e) => updateContact(c.id, { role: e.target.value as ContactRole })}
                  className={cn(inputCls, "h-8 max-w-[12rem]")}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{contactRole[r].label}</option>
                  ))}
                </select>
                {c.role === "outro" && (
                  <input
                    value={c.customRole ?? ""}
                    onChange={(e) => updateContact(c.id, { customRole: e.target.value })}
                    placeholder="Função"
                    className={cn(inputCls, "h-8 flex-1")}
                  />
                )}
                <button type="button" onClick={() => setContacts((p) => p.filter((x) => x.id !== c.id))} className="ml-auto rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-danger" aria-label="Remover contato">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <input value={c.name} onChange={(e) => updateContact(c.id, { name: e.target.value })} placeholder="Nome" className={cn(inputCls, "h-8")} />
                <input value={c.phone ?? ""} onChange={(e) => updateContact(c.id, { phone: e.target.value })} placeholder="Telefone" className={cn(inputCls, "h-8")} />
                <input value={c.email ?? ""} onChange={(e) => updateContact(c.id, { email: e.target.value })} placeholder="E-mail" className={cn(inputCls, "h-8")} />
              </div>
            </div>
          ))}
        </div>

        {/* Observações */}
        <Section title="Observações" />
        <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Notas internas (opcional)" className={cn(inputCls, "h-auto py-2")} />
      </div>

      <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
        <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-md border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" /> {editing ? "Salvar alterações" : "Cadastrar condomínio"}
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

function Section({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-6 flex items-end justify-between gap-3 border-t pt-4">
      <div>
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
