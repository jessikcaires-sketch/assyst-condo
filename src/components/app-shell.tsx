"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarDays,
  Users2,
  Gavel,
  FolderOpen,
  FolderKanban,
  FileBarChart,
  CalendarRange,
  SlidersHorizontal,
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";
import { fmtDate, TODAY } from "@/lib/domain";
import { CondoStoreProvider } from "@/lib/condo-store";
import { CatalogStoreProvider } from "@/lib/catalog-store";
import { ImportBanner } from "@/components/import-banner";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const nav: NavGroup[] = [
  {
    label: "Visão geral",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operação",
    items: [
      { href: "/condominios", label: "Condomínios", icon: Building2 },
      { href: "/projetos", label: "Serviços Pontuais", icon: FolderKanban },
      { href: "/plano-de-acao", label: "Plano de ação", icon: ListChecks },
      { href: "/agenda", label: "Agenda de visitas", icon: CalendarRange },
      { href: "/reunioes", label: "Reuniões", icon: CalendarDays },
    ],
  },
  {
    label: "Suprimentos",
    items: [
      { href: "/bid", label: "BID & Orçamentos", icon: Gavel },
      { href: "/fornecedores", label: "Fornecedores", icon: Users2 },
    ],
  },
  {
    label: "Conhecimento",
    items: [
      { href: "/documentacao", label: "Documentação", icon: FolderOpen },
      { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
    ],
  },
  {
    label: "Configuração",
    items: [{ href: "/cadastros", label: "Cadastros & listas", icon: SlidersHorizontal }],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <CondoStoreProvider>
    <CatalogStoreProvider>
    <div className="min-h-dvh">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[15.5rem] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Brand onClose={() => setOpen(false)} />

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="px-3 pb-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-sidebar-muted">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/72 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary transition-opacity",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <Icon className="size-[1.05rem] shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <UserChip />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-[15.5rem]">
        <Topbar onMenu={() => setOpen(true)} />
        <ImportBanner />
        <main className="app-content bg-canvas min-h-[calc(100dvh-3.5rem)]">{children}</main>
      </div>
    </div>
    </CatalogStoreProvider>
    </CondoStoreProvider>
  );
}

function Brand({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
      <div className="grid size-7 place-items-center rounded-[5px] bg-sidebar-primary font-display text-[0.95rem] font-bold text-sidebar-primary-foreground">
        A
      </div>
      <div className="leading-none">
        <div className="font-display text-[0.95rem] font-bold tracking-tight">
          ASSYST
        </div>
        <div className="font-mono text-[0.5625rem] uppercase tracking-[0.22em] text-sidebar-muted">
          Console
        </div>
      </div>
      <button
        onClick={onClose}
        className="ml-auto rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-accent lg:hidden"
        aria-label="Fechar menu"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function UserChip() {
  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-accent font-mono text-xs font-semibold text-sidebar-accent-foreground">
          {currentUser.initials}
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-medium">{currentUser.name}</div>
          <div className="truncate font-mono text-[0.625rem] uppercase tracking-wide text-sidebar-muted">
            Gestor
          </div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Buscar condomínio, pendência, fornecedor…"
          className="h-9 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="mr-1 hidden font-mono text-xs text-muted-foreground md:block">
          {fmtDate(TODAY)}
        </div>
        <button
          type="button"
          className="relative rounded-md border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />
        </button>
      </div>
    </header>
  );
}
