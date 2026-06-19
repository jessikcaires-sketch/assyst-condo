"use client";

import * as React from "react";
import { DatabaseZap, Check, X, Loader2 } from "lucide-react";
import { useCondoStore } from "@/lib/condo-store";
import { useCatalogs } from "@/lib/catalog-store";
import type { Condominium } from "@/lib/types";

const CONDO_KEY = "assyst.condos";
const CATALOG_KEY = "assyst.catalogs";
const DONE_KEY = "assyst.imported";

interface LocalData {
  condos: Condominium[];
  responsibles: { id: string; name: string; email: string; role: string; initials: string }[];
  services: string[];
  administrators: string[];
}

function readLocal(): LocalData | null {
  try {
    const condosRaw = window.localStorage.getItem(CONDO_KEY);
    const catRaw = window.localStorage.getItem(CATALOG_KEY);
    if (!condosRaw && !catRaw) return null;
    const condos = condosRaw ? (JSON.parse(condosRaw).condos ?? []) : [];
    const cat = catRaw ? JSON.parse(catRaw).catalogs ?? {} : {};
    return {
      condos,
      responsibles: cat.responsibles ?? [],
      services: cat.services ?? [],
      administrators: cat.administrators ?? [],
    };
  } catch {
    return null;
  }
}

export function ImportBanner() {
  const condoStore = useCondoStore();
  const catalogStore = useCatalogs();
  const [local, setLocal] = React.useState<LocalData | null>(null);
  const [state, setState] = React.useState<"idle" | "running" | "done" | "error">("idle");

  React.useEffect(() => {
    // Só oferece importar quando o banco está acessível e há dados locais ainda não migrados.
    if (!condoStore.hydrated || condoStore.offline) return;
    if (window.localStorage.getItem(DONE_KEY)) return;
    const data = readLocal();
    if (data && data.condos.length > 0) setLocal(data);
  }, [condoStore.hydrated, condoStore.offline]);

  if (!local || state === "done") return null;

  async function runImport() {
    if (!local) return;
    setState("running");
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.localStorage.setItem(DONE_KEY, "1");
      await Promise.all([condoStore.refresh(), catalogStore.refresh()]);
      setState("done");
    } catch {
      setState("error");
    }
  }

  function dismiss() {
    window.localStorage.setItem(DONE_KEY, "1");
    setLocal(null);
  }

  return (
    <div className="border-b border-info/30 bg-info-soft px-4 py-2.5 md:px-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <DatabaseZap className="size-4 shrink-0 text-info" />
        <span className="text-info">
          {state === "error" ? (
            <>Não consegui importar agora. Tente novamente.</>
          ) : (
            <>
              Encontramos <strong>{local.condos.length} condomínios</strong> salvos neste navegador.
              Enviar para o banco de dados?
            </>
          )}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={runImport}
            disabled={state === "running"}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-info px-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {state === "running" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            {state === "running" ? "Enviando…" : "Importar para o banco"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex size-8 items-center justify-center rounded-md text-info/70 transition-colors hover:bg-info/10"
            aria-label="Dispensar"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
