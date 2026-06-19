"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowUpRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import { generalStatus, condoStatus, fmtDateShort } from "@/lib/domain";
import type { CondoStatus, GeneralStatus } from "@/lib/types";

export interface CondoRow {
  id: string;
  name: string;
  address: string;
  responsibleName: string;
  responsibleInitials: string;
  administrator: string;
  nextMeeting?: string;
  openItems: number;
  overdueItems: number;
  status: CondoStatus;
  general: GeneralStatus;
}

export function CondoTable({
  rows,
  responsibles,
  administrators,
}: {
  rows: CondoRow[];
  responsibles: string[];
  administrators: string[];
}) {
  const [q, setQ] = React.useState("");
  const [resp, setResp] = React.useState("");
  const [adm, setAdm] = React.useState("");
  const [status, setStatus] = React.useState("");

  const filtered = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (resp && r.responsibleName !== resp) return false;
    if (adm && r.administrator !== adm) return false;
    if (status && r.status !== status) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome…"
            className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <FilterSelect value={resp} onChange={setResp} label="Responsável" options={responsibles} />
        <FilterSelect value={adm} onChange={setAdm} label="Administradora" options={administrators} />
        <FilterSelect
          value={status}
          onChange={setStatus}
          label="Status"
          options={Object.keys(condoStatus)}
          render={(o) => condoStatus[o as CondoStatus].label}
        />
      </div>

      {/* Table */}
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <Th className="pl-5">Condomínio</Th>
                <Th>Responsável</Th>
                <Th className="text-center">Próx. reunião</Th>
                <Th className="text-center">Pendências</Th>
                <Th>Status geral</Th>
                <Th className="pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => {
                const gs = generalStatus[r.general];
                return (
                  <tr key={r.id} className="group transition-colors hover:bg-muted/40">
                    <td className="py-3 pl-5 pr-4">
                      <Link href={`/condominios/${r.id}`} className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground">
                          <Building2 className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium leading-tight group-hover:text-primary">
                            {r.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {r.administrator}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[0.625rem] font-semibold">
                          {r.responsibleInitials}
                        </span>
                        <span className="truncate text-[0.8125rem]">{r.responsibleName}</span>
                      </div>
                    </td>
                    <td className="px-4 text-center font-mono text-xs text-muted-foreground">
                      {r.nextMeeting ? fmtDateShort(r.nextMeeting) : "—"}
                    </td>
                    <td className="px-4 text-center">
                      <span className="font-mono font-medium tabular-nums">{r.openItems}</span>
                      {r.overdueItems > 0 && (
                        <span className="ml-1.5 font-mono text-xs text-danger">
                          ({r.overdueItems} atr.)
                        </span>
                      )}
                    </td>
                    <td className="px-4">
                      <Badge tone={gs.tone} dot>
                        {gs.label}
                      </Badge>
                    </td>
                    <td className="pr-5 text-right">
                      <Link
                        href={`/condominios/${r.id}`}
                        className="inline-flex items-center text-muted-foreground transition-colors group-hover:text-primary"
                        aria-label={`Abrir ${r.name}`}
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nenhum condomínio corresponde aos filtros.
          </div>
        )}
      </Panel>

      <p className="font-mono text-xs text-muted-foreground">
        {filtered.length} de {rows.length} condomínios
      </p>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-2.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
  render,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  render?: (o: string) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
    >
      <option value="">{label}: todos</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {render ? render(o) : o}
        </option>
      ))}
    </select>
  );
}
