"use client";

import * as React from "react";
import type { Condominium } from "./types";
import { seedCondominiums } from "./mock-data";

/**
 * Registro de condomínios com persistência local (localStorage). Permite
 * cadastrar/editar pelo próprio sistema sem backend; ao plugar o Supabase,
 * troca-se este provider por chamadas reais mantendo a mesma API.
 */

const STORAGE_KEY = "assyst.condos";
const STORAGE_VERSION = 1; // bump para re-semear a carteira

const zeroMetrics = (): Condominium["valueMetrics"] => ({
  visitsDone: 0,
  worksSupervised: 0,
  unitsVisited: 0,
  diagnostics: 0,
  diagnosticsCourtesy: 0,
  bids: 0,
  reports: 0,
});

export type CondoInput = Omit<Condominium, "id" | "valueMetrics">;

interface CondoStore {
  condos: Condominium[];
  getCondo: (id: string) => Condominium | undefined;
  addCondo: (input: CondoInput) => Condominium;
  updateCondo: (id: string, patch: Partial<CondoInput>) => void;
  removeCondo: (id: string) => void;
  hydrated: boolean;
}

const Ctx = React.createContext<CondoStore | null>(null);

interface Persisted {
  version: number;
  condos: Condominium[];
}

function load(): Condominium[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.condos)) return null;
    return parsed.condos;
  } catch {
    return null;
  }
}

function save(condos: Condominium[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: Persisted = { version: STORAGE_VERSION, condos };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function CondoStoreProvider({ children }: { children: React.ReactNode }) {
  // Primeira renderização usa a seed (igual ao SSR) para evitar hydration mismatch.
  const [condos, setCondos] = React.useState<Condominium[]>(seedCondominiums);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = load();
    if (stored) setCondos(stored);
    else save(seedCondominiums);
    setHydrated(true);
  }, []);

  const persist = React.useCallback((next: Condominium[]) => {
    setCondos(next);
    save(next);
  }, []);

  const api = React.useMemo<CondoStore>(() => ({
    condos,
    hydrated,
    getCondo: (id) => condos.find((c) => c.id === id),
    addCondo: (input) => {
      const condo: Condominium = {
        ...input,
        id: `condo-${Date.now()}-${Math.floor(performance.now())}`,
        valueMetrics: zeroMetrics(),
      };
      persist([...condos, condo]);
      return condo;
    },
    updateCondo: (id, patch) => {
      persist(condos.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    removeCondo: (id) => {
      persist(condos.filter((c) => c.id !== id));
    },
  }), [condos, hydrated, persist]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCondoStore(): CondoStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCondoStore deve ser usado dentro de <CondoStoreProvider>");
  return ctx;
}

/** Açúcar para listar a carteira. */
export function useCondos(): Condominium[] {
  return useCondoStore().condos;
}
