"use client";

import * as React from "react";
import type { User } from "./types";
import { users as seedUsers } from "./mock-data";
import { SERVICE_CATALOG } from "./domain";

/**
 * Catálogos dinâmicos (responsáveis, serviços, administradoras) — agora no
 * banco via /api/catalogs. Mantém a mesma API de hooks da UI.
 */

export type Responsible = User;

export interface Catalogs {
  responsibles: Responsible[];
  services: string[];
  administrators: string[];
}

function seed(): Catalogs {
  return { responsibles: seedUsers, services: [...SERVICE_CATALOG], administrators: [] };
}

export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface CatalogStore extends Catalogs {
  hydrated: boolean;
  offline: boolean;
  refresh: () => Promise<void>;
  getResponsible: (id: string) => Responsible | undefined;
  addResponsible: (input: { name: string; role?: User["role"]; email?: string }) => Promise<Responsible | null>;
  updateResponsible: (id: string, patch: Partial<Omit<Responsible, "id">>) => Promise<void>;
  removeResponsible: (id: string) => Promise<void>;
  addService: (name: string) => Promise<void>;
  removeService: (name: string) => Promise<void>;
  addAdministrator: (name: string) => Promise<void>;
  removeAdministrator: (name: string) => Promise<void>;
}

const Ctx = React.createContext<CatalogStore | null>(null);

async function mutate(body: unknown): Promise<Catalogs | null> {
  try {
    const res = await fetch("/api/catalogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Catalogs;
  } catch {
    return null;
  }
}

export function CatalogStoreProvider({ children }: { children: React.ReactNode }) {
  const [catalogs, setCatalogs] = React.useState<Catalogs>(seed);
  const [hydrated, setHydrated] = React.useState(false);
  const [offline, setOffline] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/catalogs", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCatalogs((await res.json()) as Catalogs);
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

  const apply = (c: Catalogs | null) => {
    if (c) setCatalogs(c);
    else setOffline(true);
  };

  const api = React.useMemo<CatalogStore>(() => ({
    ...catalogs,
    hydrated,
    offline,
    refresh,
    getResponsible: (id) => catalogs.responsibles.find((r) => r.id === id),

    addResponsible: async (input) => {
      const r: Responsible = {
        id: `resp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        name: input.name.trim(),
        email: input.email?.trim() ?? "",
        role: input.role ?? "engenheiro",
        initials: initialsFrom(input.name),
      };
      apply(await mutate({ kind: "responsible", op: "add", value: r }));
      return r;
    },
    updateResponsible: async (id, patch) => {
      const next = patch.name ? { ...patch, initials: initialsFrom(patch.name) } : patch;
      apply(await mutate({ kind: "responsible", op: "update", id, patch: next }));
    },
    removeResponsible: async (id) => {
      apply(await mutate({ kind: "responsible", op: "remove", id }));
    },
    addService: async (name) => {
      const n = name.trim();
      if (!n || catalogs.services.includes(n)) return;
      apply(await mutate({ kind: "service", op: "add", name: n }));
    },
    removeService: async (name) => {
      apply(await mutate({ kind: "service", op: "remove", name }));
    },
    addAdministrator: async (name) => {
      const n = name.trim();
      if (!n || catalogs.administrators.includes(n)) return;
      apply(await mutate({ kind: "administrator", op: "add", name: n }));
    },
    removeAdministrator: async (name) => {
      apply(await mutate({ kind: "administrator", op: "remove", name }));
    },
  }), [catalogs, hydrated, offline, refresh]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCatalogs(): CatalogStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCatalogs deve ser usado dentro de <CatalogStoreProvider>");
  return ctx;
}
