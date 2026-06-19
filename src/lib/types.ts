/**
 * Domain types for Assyst Gestão Condominial.
 * These mirror the planned Supabase schema 1:1 so the mock-data layer in
 * `mock-data.ts` can be swapped for real queries without touching the UI.
 */

export type ID = string;
export type ISODate = string; // "2026-06-12"
export type ISODateTime = string; // "2026-06-12T14:30:00"

/* ----- enums ----- */

export type CondoStatus = "ativo" | "inativo" | "encerrado";
export type GeneralStatus = "em_dia" | "atencao" | "critico";

/** Whether an activity/service is in-contract or a courtesy (value-add). */
export type Coverage = "contrato" | "cortesia";

export type ActionCategory =
  | "gestao"
  | "reforma"
  | "orcamento"
  | "laudo"
  | "reuniao"
  | "documentacao"
  | "juridico"
  | "outros";

export type ResponsibleKind = "assyst" | "condominio" | "fornecedor";

export type Priority = "baixa" | "media" | "alta" | "critica";

export type ActionStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "aguardando_cliente"
  | "aguardando_fornecedor"
  | "concluido"
  | "cancelado";

export type ActionOrigin = "reuniao" | "visita" | "email" | "interno";

export type MeetingType = "semanal" | "mensal" | "extraordinaria";

export type VisitType =
  | "orcamento"
  | "visita_tecnica"
  | "reuniao"
  | "vistoria"
  | "inspecao_predial"
  | "inspecao_fachada"
  | "acompanhamento";
export type VisitStatus = "agendada" | "realizada" | "cancelada";

/** Contact roles on a condo's registry — beyond the síndico. */
export type ContactRole =
  | "sindico"
  | "subsindico"
  | "zelador"
  | "gerente_predial"
  | "conselheiro"
  | "administradora"
  | "outro";

/** Periodicity for recurring visits. */
export type Periodicity = "unica" | "semanal" | "quinzenal" | "mensal";

export type BidStatus =
  | "preparando_escopo"
  | "solicitando_propostas"
  | "recebendo_propostas"
  | "equalizacao"
  | "aguardando_aprovacao"
  | "contratado"
  | "cancelado";

export type SupplierStatus = "homologado" | "em_avaliacao" | "bloqueado";

export type InviteStatus =
  | "nao_enviado"
  | "enviado"
  | "respondido"
  | "proposta_recebida"
  | "desclassificado"
  | "contratado";

export type DocCategory =
  | "contrato"
  | "art"
  | "ata"
  | "laudo"
  | "relatorio"
  | "proposta"
  | "orcamento"
  | "equalizacao"
  | "projeto"
  | "fotos"
  | "outros";

/* ----- entities ----- */

export interface User {
  id: ID;
  name: string;
  email: string;
  role: "gestor" | "engenheiro" | "admin";
  initials: string;
}

/** Recorrente (segue em andamento) ou pontual (tem entrega — ex.: inspeção predial). */
export type ServiceKind = "recorrente" | "pontual";

/** Andamento de um serviço/projeto. */
export type ServiceProgress = "liberado" | "em_andamento" | "entregue";

/** De quem é a pendência de uma etapa. */
export type ActivityResponsible = "assyst" | "condominio";

/** Uma etapa/atividade dentro de um serviço pontual (laudo). */
export interface ServiceActivity {
  id: ID;
  label: string;
  done: boolean;
  dueDate?: ISODate; // prazo da etapa
  responsible?: ActivityResponsible; // de quem depende
  completedAt?: ISODate; // data em que foi concluída
}

/** Entrada da timeline/histórico de um serviço pontual. */
export interface ServiceLogEntry {
  id: ID;
  at: ISODate; // data do registro
  text: string;
  auto?: boolean; // gerado pelo sistema (mudança de status/etapa)
}

/** A service line from the contract, flagged in-contract or courtesy. */
export interface ContractedService {
  name: string;
  coverage: Coverage;
  kind?: ServiceKind; // recorrente (padrão) | pontual
  progress?: ServiceProgress; // andamento do serviço pontual
  /** Checklist de etapas — serviço pontual. */
  activities?: ServiceActivity[];
  /** Valor da proposta (R$) — serviço pontual. */
  value?: number;
  /** Previsão de entrega (data) — serviço pontual. */
  dueDate?: ISODate;
  /** Data de liberação (início do prazo). */
  releasedAt?: ISODate;
  /** Data de entrega final. */
  deliveredAt?: ISODate;
  /** Timeline/histórico do laudo. */
  history?: ServiceLogEntry[];
}

/** A person tied to the condo (síndico, zelador, gerente predial, etc.). */
export interface Contact {
  id: ID;
  role: ContactRole;
  /** Free-text label when role === "outro". */
  customRole?: string;
  name: string;
  phone?: string;
  email?: string;
}

/** Value-demonstration metrics for client (síndico) presentations. */
export interface ValueMetrics {
  visitsDone: number;
  worksSupervised: number; // obras fiscalizadas em andamento
  unitsVisited: number; // unidades privativas visitadas
  diagnostics: number; // drone / termografia
  diagnosticsCourtesy: number; // quantos dos diagnósticos foram cortesia
  bids: number;
  reports: number;
}

export interface Condominium {
  id: ID;
  name: string;
  cnpj?: string;
  /** Foto da fachada — data URL (base64) ou link. */
  photoUrl?: string;
  address: string;
  /** People at the condo — síndico, zelador, gerente predial, conselho… */
  contacts: Contact[];
  administrator?: string;
  responsibleId: ID; // Assyst user
  contractStart?: ISODate;
  contractEnd?: ISODate;
  notes?: string;
  status: CondoStatus;
  services: ContractedService[];
  valueMetrics: ValueMetrics;
}

export interface ActionItem {
  id: ID;
  condoId: ID;
  title: string;
  description?: string;
  category: ActionCategory;
  responsibleKind: ResponsibleKind;
  responsibleId?: ID; // user or supplier
  responsibleName?: string;
  dueDate: ISODate;
  priority: Priority;
  status: ActionStatus;
  origin: ActionOrigin;
  coverage?: Coverage; // dentro do contrato ou cortesia
  notes?: string;
  attachments?: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Meeting {
  id: ID;
  condoId: ID;
  date: ISODate;
  time: string;
  type: MeetingType;
  participants: string[];
  summary: string;
  ata?: string;
  decisions: string[];
  nextSteps: string[];
}

export interface Visit {
  id: ID;
  condoId: ID;
  professionalId: ID;
  type: VisitType;
  date: ISODate;
  start: string;
  end: string;
  notes?: string;
  status: VisitStatus;
  /** Recurrence metadata — occurrences in a series share a seriesId. */
  periodicity?: Periodicity;
  seriesId?: ID;
  /** Capture for value indicators (alimenta os indicadores automaticamente). */
  units?: number; // unidades privativas visitadas
  diagnostic?: "drone" | "termografia"; // diagnóstico de engenharia realizado
  diagnosticCourtesy?: boolean; // se o diagnóstico foi cortesia
}

export interface Bid {
  id: ID;
  condoId: ID;
  title: string;
  description?: string;
  category: ActionCategory;
  deadline: ISODate;
  status: BidStatus;
  proposalCount: number;
  estimatedValue?: number;
  /** Equalização — recomendação técnica da Assyst e decisão do condomínio. */
  recommendedSupplierId?: ID;
  decisionSupplierId?: ID;
  decisionDate?: ISODate;
}

/** A supplier invited to a BID (Módulo 8 — disparo). */
export interface BidInvite {
  id: ID;
  bidId: ID;
  supplierId: ID;
  status: InviteStatus;
  sentAt?: ISODate;
  respondedAt?: ISODate;
}

/** A proposal submitted for a BID (Módulos 8/9). */
export interface Proposal {
  id: ID;
  bidId: ID;
  supplierId: ID;
  value: number;
  deadlineDays: number; // prazo de execução
  warranty: string; // garantia
  submittedAt: ISODate;
  notes?: string;
  attachment?: boolean;
}

export interface Supplier {
  id: ID;
  legalName: string;
  tradeName: string;
  cnpj: string;
  contact: string;
  phone: string;
  whatsapp?: string;
  email: string;
  site?: string;
  city: string;
  state: string;
  categories: ActionCategory[];
  notes?: string;
  status: SupplierStatus;
  rating: number; // 0-5
  invitesSent: number;
  proposalsSent: number;
  contractsWon: number;
  contractsLost: number;
}

export interface DropboxFolder {
  id: ID;
  condoId: ID;
  name: string;
  link: string;
  folderId: string;
  isPrimary: boolean;
}

export interface DocumentRef {
  id: ID;
  condoId: ID;
  name: string;
  category: DocCategory;
  link: string;
  updatedAt: ISODate;
}
