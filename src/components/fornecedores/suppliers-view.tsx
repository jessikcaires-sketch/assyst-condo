"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Star,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
} from "lucide-react";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewSupplierDialog } from "./new-supplier-dialog";
import { suppliers as seedSuppliers } from "@/lib/mock-data";
import { supplierStatus, category } from "@/lib/domain";
import type { Supplier, SupplierStatus, ActionCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const allCategories = Object.keys(category) as ActionCategory[];

export function SuppliersView() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(seedSuppliers);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [cat, setCat] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = suppliers.filter((s) => {
    if (q && !`${s.tradeName} ${s.legalName}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (status && s.status !== status) return false;
    if (cat && !s.categories.includes(cat as ActionCategory)) return false;
    return true;
  });

  const homologados = suppliers.filter((s) => s.status === "homologado").length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar fornecedor…"
              className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select aria-label="Filtrar por status" value={status} onChange={(e) => setStatus(e.target.value)} className={filterCls}>
            <option value="">Todos os status</option>
            {Object.entries(supplierStatus).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select aria-label="Filtrar por categoria" value={cat} onChange={(e) => setCat(e.target.value)} className={filterCls}>
            <option value="">Todas as categorias</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>{category[c].label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 self-start rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> Novo fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filtered.map((s) => (
          <SupplierCard key={s.id} supplier={s} />
        ))}
      </div>
      {filtered.length === 0 && (
        <Panel className="px-5 py-12 text-center text-sm text-muted-foreground">
          Nenhum fornecedor encontrado.
        </Panel>
      )}

      <p className="font-mono text-xs text-muted-foreground">
        {filtered.length} de {suppliers.length} fornecedores · {homologados} homologados
      </p>

      <NewSupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(s) => setSuppliers((prev) => [s, ...prev])}
      />
    </div>
  );
}

function SupplierCard({ supplier: s }: { supplier: Supplier }) {
  const st = supplierStatus[s.status];
  const total = s.contractsWon + s.contractsLost;
  const winRate = total > 0 ? Math.round((s.contractsWon / total) * 100) : null;

  return (
    <Panel className="flex flex-col overflow-hidden p-0">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold leading-tight">{s.tradeName}</h3>
          <p className="truncate text-xs text-muted-foreground">{s.legalName}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Stars value={s.rating} />
            <span className="font-mono text-xs text-muted-foreground">{s.rating.toFixed(1)}</span>
          </div>
        </div>
        <Badge tone={st.tone} dot>{st.label}</Badge>
      </div>

      <div className="grid gap-x-4 gap-y-2.5 px-5 py-4 sm:grid-cols-2">
        <Info icon={User} value={s.contact} />
        <Info icon={Phone} value={s.whatsapp ? `${s.phone} · ${s.whatsapp}` : s.phone} mono />
        <Info icon={Mail} value={s.email} />
        <Info icon={MapPin} value={`${s.city}/${s.state}`} />
        <Info icon={Building2} value={s.cnpj} mono className="sm:col-span-2" />
      </div>

      <div className="flex flex-wrap gap-1.5 px-5 pb-4">
        {s.categories.map((c) => (
          <span key={c} className="rounded-md border bg-secondary px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wide text-secondary-foreground">
            {category[c].label}
          </span>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-4 divide-x border-t bg-muted/30 text-center">
        <Metric label="Convites" value={s.invitesSent} />
        <Metric label="Propostas" value={s.proposalsSent} />
        <Metric label="Ganhos" value={s.contractsWon} tone="success" />
        <Metric label="Aprov." value={winRate !== null ? `${winRate}%` : "—"} tone="info" />
      </div>
    </Panel>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < full ? "fill-primary text-primary" : "fill-transparent text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

function Info({
  icon: Icon,
  value,
  mono = false,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className={cn("truncate", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "success" | "info";
}) {
  return (
    <div className="px-2 py-2.5">
      <div
        className={cn(
          "font-display text-base font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "info" && "text-info",
        )}
      >
        {value}
      </div>
      <div className="font-mono text-[0.5625rem] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

const filterCls =
  "h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
