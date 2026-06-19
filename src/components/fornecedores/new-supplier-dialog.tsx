"use client";

import * as React from "react";
import { X, Building2, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { supplierStatus, category } from "@/lib/domain";
import type { Supplier, SupplierStatus, ActionCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const allCategories = Object.keys(category) as ActionCategory[];
const STATUSES = Object.keys(supplierStatus) as SupplierStatus[];

export function NewSupplierDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (s: Supplier) => void;
}) {
  const [form, setForm] = React.useState({
    legalName: "",
    tradeName: "",
    cnpj: "",
    contact: "",
    phone: "",
    whatsapp: "",
    email: "",
    site: "",
    city: "",
    state: "",
    notes: "",
  });
  const [cats, setCats] = React.useState<ActionCategory[]>([]);
  const [status, setStatus] = React.useState<SupplierStatus>("em_avaliacao");

  if (!open) return null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function toggleCat(c: ActionCategory) {
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function handleCreate() {
    const s: Supplier = {
      id: `sup-${Date.now()}`,
      legalName: form.legalName || form.tradeName,
      tradeName: form.tradeName || form.legalName,
      cnpj: form.cnpj,
      contact: form.contact,
      phone: form.phone,
      whatsapp: form.whatsapp || undefined,
      email: form.email,
      site: form.site || undefined,
      city: form.city,
      state: form.state,
      categories: cats,
      notes: form.notes || undefined,
      status,
      rating: 0,
      invitesSent: 0,
      proposalsSent: 0,
      contractsWon: 0,
      contractsLost: 0,
    };
    onCreate(s);
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
              <h2 className="font-display text-base font-semibold leading-tight">Novo fornecedor</h2>
              <p className="text-xs text-muted-foreground">Cadastro e homologação de fornecedor</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted" aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Razão social"><input value={form.legalName} onChange={set("legalName")} className={inputCls} /></Field>
            <Field label="Nome fantasia"><input value={form.tradeName} onChange={set("tradeName")} className={inputCls} /></Field>
            <Field label="CNPJ"><input value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" className={inputCls} /></Field>
            <Field label="Responsável"><input value={form.contact} onChange={set("contact")} className={inputCls} /></Field>
            <Field label="Telefone"><input value={form.phone} onChange={set("phone")} className={inputCls} /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} /></Field>
            <Field label="E-mail"><input type="email" value={form.email} onChange={set("email")} className={inputCls} /></Field>
            <Field label="Site"><input value={form.site} onChange={set("site")} placeholder="Opcional" className={inputCls} /></Field>
            <Field label="Cidade"><input value={form.city} onChange={set("city")} className={inputCls} /></Field>
            <Field label="Estado (UF)"><input value={form.state} onChange={set("state")} maxLength={2} className={inputCls} /></Field>

            <Field label="Categorias" className="sm:col-span-2">
              <div className="flex flex-wrap gap-1.5">
                {allCategories.map((c) => {
                  const active = cats.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCat(c)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        active ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {category[c].label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Status" className="sm:col-span-2">
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.map((stt) => (
                  <button
                    key={stt}
                    type="button"
                    onClick={() => setStatus(stt)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      status === stt ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {supplierStatus[stt].label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Observações" className="sm:col-span-2">
              <input value={form.notes} onChange={set("notes")} placeholder="Opcional" className={inputCls} />
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
            disabled={!form.tradeName && !form.legalName}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" /> Cadastrar fornecedor
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
