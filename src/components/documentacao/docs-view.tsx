"use client";

import * as React from "react";
import {
  Search,
  FolderOpen,
  ExternalLink,
  FileText,
  Star,
  Info,
} from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documents, dropboxFolders } from "@/lib/mock-data";
import { useCondos } from "@/lib/condo-store";
import { docCategory, fmtDate } from "@/lib/domain";
import type { DocCategory } from "@/lib/types";

const allCats = Object.keys(docCategory) as DocCategory[];

export function DocsView() {
  const condos = useCondos();
  const condoName = (id: string) => condos.find((c) => c.id === id)?.name ?? "—";
  const [q, setQ] = React.useState("");
  const [condoFilter, setCondoFilter] = React.useState("");
  const [cat, setCat] = React.useState("");

  const docs = documents.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (condoFilter && d.condoId !== condoFilter) return false;
    if (cat && d.category !== cat) return false;
    return true;
  });

  const folders = dropboxFolders.filter((f) => !condoFilter || f.condoId === condoFilter);

  return (
    <div className="space-y-6">
      {/* Integration note */}
      <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info-soft/50 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p className="text-sm text-foreground/80">
          O <strong>Dropbox</strong> é a fonte oficial dos arquivos. O sistema guarda apenas{" "}
          <strong>referências</strong> e abre os documentos direto no Dropbox. A arquitetura já está
          preparada para a <strong>Dropbox API</strong> (listar, buscar e sincronizar metadados automaticamente).
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar documento…"
            className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <select aria-label="Filtrar por condomínio" value={condoFilter} onChange={(e) => setCondoFilter(e.target.value)} className={filterCls}>
          <option value="">Todos os condomínios</option>
          {condos.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select aria-label="Filtrar por categoria" value={cat} onChange={(e) => setCat(e.target.value)} className={filterCls}>
          <option value="">Todas as categorias</option>
          {allCats.map((c) => (
            <option key={c} value={c}>{docCategory[c].label}</option>
          ))}
        </select>
      </div>

      {/* Pastas Dropbox */}
      <div>
        <div className="eyebrow mb-3">Pastas vinculadas no Dropbox</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((f) => (
            <a
              key={f.id}
              href={f.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-info-soft text-info">
                <FolderOpen className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{f.name}</span>
                  {f.isPrimary && <Star className="size-3 shrink-0 fill-copper text-copper" />}
                </span>
                <span className="truncate text-xs text-muted-foreground">{condoName(f.condoId)}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </a>
          ))}
          {folders.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma pasta vinculada.</p>
          )}
        </div>
      </div>

      {/* Documentos */}
      <Panel className="overflow-hidden p-0">
        <PanelHeader
          eyebrow="Referências"
          title="Documentos"
          action={<span className="font-mono text-xs text-muted-foreground">{docs.length} documentos</span>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <Th className="pl-5">Documento</Th>
                <Th>Categoria</Th>
                <Th>Condomínio</Th>
                <Th className="text-center">Atualizado</Th>
                <Th className="pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {docs.map((d) => (
                <tr key={d.id} className="group transition-colors hover:bg-muted/40">
                  <td className="py-3 pl-5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4"><Badge tone={docCategory[d.category].tone}>{docCategory[d.category].label}</Badge></td>
                  <td className="px-4 text-muted-foreground">{condoName(d.condoId)}</td>
                  <td className="px-4 text-center font-mono text-xs text-muted-foreground">{fmtDate(d.updatedAt)}</td>
                  <td className="pr-5 text-right">
                    <a
                      href={d.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Abrir <ExternalLink className="size-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {docs.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhum documento encontrado.</div>
        )}
      </Panel>
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
