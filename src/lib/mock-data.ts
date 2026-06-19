import type {
  ActionItem,
  Bid,
  BidInvite,
  Condominium,
  ContractedService,
  DocumentRef,
  DropboxFolder,
  GeneralStatus,
  Meeting,
  Proposal,
  Supplier,
  User,
  Visit,
} from "./types";
import { daysFromToday, isOverdue } from "./domain";

/* ============================================================
   Seed data — stands in for Supabase tables. On the client, the
   condo registry is layered with a localStorage store (see
   condo-store.tsx) so cadastros feitos pelo sistema persistem.
   Selector functions below are the only surface the UI touches.
   ============================================================ */

export const users: User[] = [
  { id: "u1", name: "Rodrigo Toledo", email: "rodrigo@assyst.eng.br", role: "gestor", initials: "RT" },
];

export const currentUser = users[0];

/** Zeroed value metrics — preenchidos automaticamente conforme a operação roda. */
const zeroMetrics = (): Condominium["valueMetrics"] => ({
  visitsDone: 0,
  worksSupervised: 0,
  unitsVisited: 0,
  diagnostics: 0,
  diagnosticsCourtesy: 0,
  bids: 0,
  reports: 0,
});

const svc = (name: string): ContractedService[] => [{ name, coverage: "contrato" }];

/**
 * Carteira real de condomínios sob gestão da Assyst. Demais dados de cadastro
 * (CNPJ, endereço, contatos, datas de contrato) são preenchidos pelo sistema.
 */
export const seedCondominiums: Condominium[] = [
  { id: "c1", name: "Condomínio Hit High", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Gestão da manutenção"), valueMetrics: zeroMetrics() },
  { id: "c2", name: "Bonnaire Business — Setor Mall", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Assessoria técnica condominial"), valueMetrics: zeroMetrics() },
  { id: "c3", name: "Bonnaire Business — Setor Office", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Assessoria técnica condominial"), valueMetrics: zeroMetrics() },
  { id: "c4", name: "Bonnaire — Setor Residencial Verde Morumbi", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Assessoria técnica condominial"), valueMetrics: zeroMetrics() },
  { id: "c5", name: "Edifício Cena Golf Residence", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Assessoria técnica condominial"), valueMetrics: zeroMetrics() },
  { id: "c6", name: "Terrazza Marina Reserva Speciale", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Assessoria técnica condominial"), valueMetrics: zeroMetrics() },
  { id: "c7", name: "Vivaz Penha", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Gestão dos planos de reforma"), valueMetrics: zeroMetrics() },
  { id: "c8", name: "Samoa", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Gestão da manutenção"), valueMetrics: zeroMetrics() },
  { id: "c9", name: "Condomínio de Edifícios Paradiso", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Fiscalização de fachada"), valueMetrics: zeroMetrics() },
  { id: "c10", name: "Vila Nova Sabará — Praça Alvorada", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Fiscalização de fachada"), valueMetrics: zeroMetrics() },
  { id: "c11", name: "Condomínio On Vila Olímpia", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Gestão dos planos de reforma"), valueMetrics: zeroMetrics() },
  { id: "c12", name: "Condomínio Everest Tower", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Gestão dos planos de reforma"), valueMetrics: zeroMetrics() },
  { id: "c13", name: "Condomínio Flórida Penthouses Landmark", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Assessoria técnica condominial"), valueMetrics: zeroMetrics() },
  { id: "c14", name: "Vibe Vila Olímpia", responsibleId: "u1", status: "ativo", address: "", contacts: [], services: svc("Fiscalização técnica e elaboração de parecer"), valueMetrics: zeroMetrics() },
];

export const condominiums: Condominium[] = seedCondominiums;

/* Operação inicia zerada — cadastrada pelo sistema conforme o trabalho avança. */
export const actionItems: ActionItem[] = [];
export const meetings: Meeting[] = [];
export const visits: Visit[] = [];
export const bids: Bid[] = [];
export const bidInvites: BidInvite[] = [];
export const proposals: Proposal[] = [];
export const suppliers: Supplier[] = [];
export const dropboxFolders: DropboxFolder[] = [];
export const documents: DocumentRef[] = [];

/* ============================================================
   Selectors — the UI's data API. Swap bodies for Supabase calls.
   ============================================================ */

export function getCondos(): Condominium[] {
  return condominiums;
}

export function getCondo(id: string): Condominium | undefined {
  return condominiums.find((c) => c.id === id);
}

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getActionItems(condoId?: string): ActionItem[] {
  return condoId ? actionItems.filter((a) => a.condoId === condoId) : actionItems;
}

export function getMeetings(condoId?: string): Meeting[] {
  return (condoId ? meetings.filter((m) => m.condoId === condoId) : meetings).sort(
    (a, b) => b.date.localeCompare(a.date),
  );
}

export function getVisits(condoId?: string): Visit[] {
  return (condoId ? visits.filter((v) => v.condoId === condoId) : visits).sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}

export function getBids(condoId?: string): Bid[] {
  return condoId ? bids.filter((b) => b.condoId === condoId) : bids;
}

export function getBid(id: string): Bid | undefined {
  return bids.find((b) => b.id === id);
}

export function getSupplier(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getBidInvites(bidId: string): BidInvite[] {
  return bidInvites.filter((i) => i.bidId === bidId);
}

export function getProposals(bidId: string): Proposal[] {
  return proposals.filter((p) => p.bidId === bidId);
}

export function getDocuments(condoId: string): DocumentRef[] {
  return documents.filter((d) => d.condoId === condoId);
}

export function getFolders(condoId: string): DropboxFolder[] {
  return dropboxFolders.filter((f) => f.condoId === condoId);
}

const inMonth = (d: string, ym: string) => d.startsWith(ym);

export interface CondoStats {
  openItems: number;
  overdueItems: number;
  doneItems: number;
  bidsInProgress: number;
  visitsThisMonth: number;
  meetingsThisMonth: number;
  nextVisit?: Visit;
  nextMeeting?: Meeting;
  general: GeneralStatus;
}

export function getCondoStats(condoId: string, ym = "2026-06"): CondoStats {
  const items = getActionItems(condoId);
  const open = items.filter((i) => i.status !== "concluido" && i.status !== "cancelado");
  const overdue = open.filter((i) => isOverdue(i.dueDate, i.status));
  const done = items.filter((i) => i.status === "concluido");
  const condoBids = getBids(condoId).filter(
    (b) => b.status !== "contratado" && b.status !== "cancelado",
  );
  const condoVisits = getVisits(condoId);
  const condoMeetings = getMeetings(condoId);

  const nextVisit = condoVisits
    .filter((v) => v.status === "agendada" && daysFromToday(v.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const upcomingMeeting = condoMeetings
    .filter((m) => daysFromToday(m.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const general: GeneralStatus =
    overdue.length >= 2 ? "critico" : overdue.length === 1 || open.length >= 4 ? "atencao" : "em_dia";

  return {
    openItems: open.length,
    overdueItems: overdue.length,
    doneItems: done.length,
    bidsInProgress: condoBids.length,
    visitsThisMonth: condoVisits.filter((v) => inMonth(v.date, ym)).length,
    meetingsThisMonth: condoMeetings.filter((m) => inMonth(m.date, ym)).length,
    nextVisit,
    nextMeeting: upcomingMeeting ?? condoMeetings[0],
    general,
  };
}

export interface GlobalStats {
  activeCondos: number;
  openItems: number;
  overdueItems: number;
  visitsThisWeek: number;
  meetingsThisWeek: number;
  bidsInProgress: number;
  awaitingClient: number;
  awaitingSupplier: number;
  topResponsibles: { user: User; count: number }[];
  topCondos: { condo: Condominium; count: number }[];
}

export function getGlobalStats(): GlobalStats {
  const active = condominiums.filter((c) => c.status === "ativo");
  const open = actionItems.filter((i) => i.status !== "concluido" && i.status !== "cancelado");
  const overdue = open.filter((i) => isOverdue(i.dueDate, i.status));

  const thisWeek = (d: string) => {
    const n = daysFromToday(d);
    return n >= 0 && n <= 6;
  };

  const responsibleCounts = users
    .map((user) => ({
      user,
      count: open.filter((i) => i.responsibleKind === "assyst" && i.responsibleId === user.id).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const condoCounts = condominiums
    .map((condo) => ({ condo, count: open.filter((i) => i.condoId === condo.id).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    activeCondos: active.length,
    openItems: open.length,
    overdueItems: overdue.length,
    visitsThisWeek: visits.filter((v) => v.status === "agendada" && thisWeek(v.date)).length,
    meetingsThisWeek: meetings.filter((m) => thisWeek(m.date)).length,
    bidsInProgress: bids.filter((b) => b.status !== "contratado" && b.status !== "cancelado").length,
    awaitingClient: open.filter((i) => i.status === "aguardando_cliente").length,
    awaitingSupplier: open.filter((i) => i.status === "aguardando_fornecedor").length,
    topResponsibles: responsibleCounts,
    topCondos: condoCounts,
  };
}
