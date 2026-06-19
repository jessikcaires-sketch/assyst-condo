"use client";

import * as React from "react";
import type { User } from "./types";
import { users as seedUsers } from "./mock-data";
import { SERVICE_CATALOG } from "./domain";

/**
 * Catálogos dinâmicos — listas editáveis pelo sistema que alimentam os
 * seletores (responsáveis, serviços, administradoras…). Persistidas em
 * localStorage; trocáveis por tabelas do Supabase mantendo a mesma API.
 */

const STORAGE_KEY = "assyst.catalogs";
const STORAGE_VERSION = 1;

export type Responsible = User;

export interface Catalogs {
  responsibles: Responsible[];
  services: string[];
  administrators: string[];
}

function seed(): Catalogs {
  return {
    responsibles: seedUsers,
    services: [...SERVICE_CATALOG],
    administrators: [],
  };
}

export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface CatalogStore extends Catalogs {
  hydrated: boolean;
  getResponsible: (id: string) => Responsible | undefined;
  addResponsible: (input: { name: string; role?: User["role"]; email?: string }) => Responsible;
  updateResponsible: (id: string, patch: Partial<Omit<Responsible, "id">>) => void;
  removeResponsible: (id: string) => void;
  addService: (name: string) => void;
  removeService: (name: string) => void;
  addAdministrator: (name: string) => void;
  removeAdministrator: (name: string) => void;
}

const Ctx = React.createContext<CatalogStore | null>(null);

interface Persisted {
  version: number;
  catalogs: Catalogs;
}

function load(): Catalogs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.version !== STORAGE_VERSION) return null;
    const c = parsed.catalogs;
    if (!c || !Array.isArray(c.responsibles) || !Array.isArray(c.services) || !Array.isArray(c.administrators)) return null;
    return c;
  } catch {
    return null;
  }
}

function save(catalogs: Catalogs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, catalogs } satisfies Persisted));
  } catch {
    /* ignore */
  }
}

export function CatalogStoreProvider({ children }: { children: React.ReactNode }) {
  const [catalogs, setCatalogs] = React.useState<Catalogs>(seed);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const stored = load();
    if (stored) setCatalogs(stored);
    else save(seed());
    setHydrated(true);
  }, []);

  const persist = React.useCallback((next: Catalogs) => {
    setCatalogs(next);
    save(next);
  }, []);

  const api = React.useMemo<CatalogStore>(() => ({
    ...catalogs,
    hydrated,
    getResponsible: (id) => catalogs.responsibles.find((r) => r.id === id),
    addResponsible: (input) => {
      const r: Responsible = {
        id: `resp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        name: input.name.trim(),
        email: input.email?.trim() ?? "",
        role: input.role ?? "engenheiro",
        initials: initialsFrom(input.name),
      };
      persist({ ...catalogs, responsibles: [...catalogs.responsibles, r] });
      return r;
    },
    updateResponsible: (id, patch) => {
      persist({
        ...catalogs,
        responsibles: catalogs.responsibles.map((r) =>
          r.id === id ? { ...r, ...patch, initials: patch.name ? initialsFrom(patch.name) : r.initials } : r,
        ),
      });
    },
    removeResponsible: (id) => {
      persist({ ...catalogs, responsibles: catalogs.responsibles.filter((r) => r.id !== id) });
    },
    addService: (name) => {
      const n = name.trim();
      if (!n || catalogs.services.includes(n)) return;
      persist({ ...catalogs, services: [...catalogs.services, n] });
    },
    removeService: (name) => {
      persist({ ...catalogs, services: catalogs.services.filter((s) => s !== name) });
    },
    addAdministrator: (name) => {
      const n = name.trim();
      if (!n || catalogs.administrators.includes(n)) return;
      persist({ ...catalogs, administrators: [...catalogs.administrators, n] });
    },
    removeAdministrator: (name) => {
      persist({ ...catalogs, administrators: catalogs.administrators.filter((a) => a !== name) });
    },
  }), [catalogs, hydrated, persist]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCatalogs(): CatalogStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCatalogs deve ser usado dentro de <CatalogStoreProvider>");
  return ctx;
}
