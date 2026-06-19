"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, Gavel } from "lucide-react";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBids } from "@/lib/mock-data";
import { useCondos } from "@/lib/condo-store";
import { bidStatus, category, fmtDateShort, fmtMoney, daysFromToday } from "@/lib/domain";
import type { BidStatus } from "@/lib/types";

export function BidsView() {
  const condos = useCondos();
  const condoName = (id: string) => condos.find((c) => c.id === id)?.name ?? "—";
  const bids = getBids();
  const [status, setStatus] = React.useState("");
  const [condoFilter, setCondoFilter] = React.useState("");

  const filtered = bids.filter((b) => {
    if (status && b.status !== status) return false;
    if (condoFilter && b.condoId !== condoFilter) return false;
    return true;
  });

  const active = bids.filter((b) => b.status !== "contratado" && b.status !== "cancelado").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select aria-label="Filtrar por status" value={status} onChange={(e) => setStatus(e.target.value)} className={filterCls}>
            <option value="">Todos os status</option>
            {Object.entries(bidStatus).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select aria-label="Filtrar por condomínio" value={condoFilter} onChange={(e) => setCondoFilter(e.target.value)} className={filterCls}>
            <option value="">Todos os condomínios</option>
            {condos.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="button" className="inline-flex h-9 items-center gap-1.5 self-start rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
          <Plus className="size-4" /> Nova demanda
        </button>
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <Th className="pl-5">Demanda</Th>
                <Th>Status</Th>
                <Th className="text-center">Prazo</Th>
                <Th className="text-center">Propostas</Th>
                <Th className="text-right">Valor estim.</Th>
                <Th className="pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((b) => {
                const st = bidStatus[b.status];
                const overdue =
                  daysFromToday(b.deadline) < 0 && b.status !== "contratado" && b.status !== "cancelado";
                return (
                  <tr key={b.id} className="group transition-colors hover:bg-muted/40">
                    <td className="py-3 pl-5 pr-4">
                      <Link href={`/bid/${b.id}`} className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground">
                          <Gavel className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium leading-tight group-hover:text-primary">{b.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {condoName(b.condoId)} · {category[b.category].label}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4"><Badge tone={st.tone} dot>{st.label}</Badge></td>
                    <td className="px-4 text-center font-mono text-xs">
                      <span className={overdue ? "font-medium text-danger" : "text-muted-foreground"}>
                        {fmtDateShort(b.deadline)}
                      </span>
                    </td>
                    <td className="px-4 text-center font-mono tabular-nums">{b.proposalCount}</td>
                    <td className="px-4 text-right font-mono text-xs tabular-nums">
                      {b.estimatedValue ? fmtMoney(b.estimatedValue) : "—"}
                    </td>
                    <td className="pr-5 text-right">
                      <Link href={`/bid/${b.id}`} className="inline-flex items-center text-muted-foreground transition-colors group-hover:text-primary" aria-label={`Abrir ${b.title}`}>
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
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhuma demanda encontrada.</div>
        )}
      </Panel>

      <p className="font-mono text-xs text-muted-foreground">
        {filtered.length} de {bids.length} demandas · {active} em andamento
      </p>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-2.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground ${className}`}>
      {children}
    </th>
  );
}

const filterCls =
  "h-9 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";
