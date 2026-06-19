"use client";

import * as React from "react";
import type { Condominium } from "./types";
import { seedCondominiums } from "./mock-data";

/**
 * Registro de condomínios — agora persistido no banco (Postgres) via /api.
 * Mantém a mesma API de hooks que a UI já usa. A renderização inicial mostra
 * a seed (igual ao SSR) e em seguida sincroniza com o banco.
 */

export type CondoInput = Omit<Condominium, "id" | "valueMetrics">;

interface CondoStore {
  condos: Condominium[];
  getCondo: (id: string) => Condominium | undefined;
  addCondo: (input: CondoInput) => Promise<Condominium | null>;
  updateCondo: (id: string, patch: Partial<CondoInput>) => Promise<void>;
  removeCondo: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  hydrated: boolean;
  /** true quando o banco não respondeu (ex.: DATABASE_URL ausente). */
  offline: boolean;
}

const Ctx = React.createContext<CondoStore | null>(null);

export function CondoStoreProvider({ children }: { children: React.ReactNode }) {
  const [condos, setCondos] = React.useState<Condominium[]>(seedCondominiums);
  const [hydrated, setHydrated] = React.useState(false);
  const [offline, setOffline] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/condos", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { condos: Condominium[] };
      setCondos(data.condos);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const api = React.useMemo<CondoStore>(() => ({
    condos,
    hydrated,
    offline,
    refresh,
    getCondo: (id) => condos.find((c) => c.id === id),

    addCondo: async (input) => {
      try {
        const res = await fetch("/api/condos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { condo } = (await res.json()) as { condo: Condominium };
        setCondos((prev) => [...prev, condo]);
        return condo;
      } catch {
        setOffline(true);
        return null;
      }
    },

    updateCondo: async (id, patch) => {
      // Otimista: aplica já na tela, depois confirma no banco.
      setCondos((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      try {
        const res = await fetch(`/api/condos/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { condo } = (await res.json()) as { condo: Condominium };
        setCondos((prev) => prev.map((c) => (c.id === id ? condo : c)));
      } catch {
        setOffline(true);
      }
    },

    removeCondo: async (id) => {
      const snapshot = condos;
      setCondos((prev) => prev.filter((c) => c.id !== id));
      try {
        const res = await fetch(`/api/condos/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        setCondos(snapshot); // reverte se falhar
        setOffline(true);
      }
    },
  }), [condos, hydrated, offline, refresh]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCondoStore(): CondoStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCondoStore deve ser usado dentro de <CondoStoreProvider>");
  return ctx;
}

export function useCondos(): Condominium[] {
  return useCondoStore().condos;
}
