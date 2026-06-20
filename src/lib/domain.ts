import type {
  ActionCategory,
  ActionStatus,
  BidStatus,
  ActivityResponsible,
  CondoStatus,
  ContactRole,
  Coverage,
  ServiceKind,
  ServiceProgress,
  DocCategory,
  GeneralStatus,
  InviteStatus,
  MeetingType,
  Priority,
  SupplierStatus,
  VisitStatus,
  VisitType,
  ISODate,
} from "./types";

/** Deterministic "today" so mock due-dates / overdue logic stay stable. */
export const TODAY: ISODate = "2026-06-10";

export type Tone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "copper"
  | "muted";

interface Label {
  label: string;
  tone: Tone;
}

export const coverage: Record<Coverage, Label> = {
  contrato: { label: "Contrato", tone: "info" },
  cortesia: { label: "Cortesia", tone: "copper" },
};

export const serviceKind: Record<ServiceKind, { label: string }> = {
  recorrente: { label: "Recorrente" },
  pontual: { label: "Pontual" },
};

export const serviceProgress: Record<ServiceProgress, Label> = {
  aguardando_liberacao: { label: "Aguardando liberação", tone: "muted" },
  liberado: { label: "Liberado", tone: "neutral" },
  em_andamento: { label: "Em andamento", tone: "info" },
  entregue: { label: "Entregue", tone: "success" },
};

/** Ordem das colunas no quadro de serviços pontuais. */
export const projectFlow: ServiceProgress[] = ["aguardando_liberacao", "liberado", "em_andamento", "entregue"];

/** Tags de situação atual de um laudo (sugestões; também aceita texto livre). */
export const SITUACOES: string[] = [
  "Aguardando documentação",
  "Documentação solicitada",
  "Vistoria agendada",
  "Organização do material",
  "Elaboração do laudo",
  "Revisão do laudo",
  "Pronto para entrega",
];

export const activityResponsible: Record<ActivityResponsible, Label> = {
  assyst: { label: "Assyst", tone: "info" },
  condominio: { label: "Condomínio", tone: "copper" },
};

/** Modelo de etapa padrão (label + responsável). */
export interface DefaultActivity {
  label: string;
  responsible: ActivityResponsible;
}

/** Etapas-padrão de um laudo pontual (na ordem do fluxo). */
export const LAUDO_ACTIVITIES: DefaultActivity[] = [
  { label: "Coleta de documentação", responsible: "condominio" },
  { label: "Anamnese", responsible: "assyst" },
  { label: "Vistoria / Inspeção", responsible: "assyst" },
  { label: "Elaboração do laudo", responsible: "assyst" },
  { label: "Apresentação", responsible: "assyst" },
  { label: "Entrega final", responsible: "assyst" },
];

/** Tipo predefinido de cada serviço (pode ser alterado por condomínio). */
export const SERVICE_DEFAULT_KIND: Record<string, ServiceKind> = {
  "Assessoria técnica condominial": "recorrente",
  "Gestão da manutenção": "recorrente",
  "Gestão dos planos de reforma": "recorrente",
  "Fiscalização de fachada": "recorrente",
  "Acompanhamento de obras": "recorrente",
  "Fiscalização técnica e elaboração de parecer": "pontual",
  "Inspeção predial": "pontual",
  "Vistoria técnica": "pontual",
  "Inspeção de fachada": "pontual",
  "Laudo técnico": "pontual",
  "Parecer Técnico": "pontual",
  "Laudo Especializado": "pontual",
  "Parecer Técnico de Vícios Construtivos": "pontual",
};

export function serviceDefaultKind(name: string): ServiceKind {
  return SERVICE_DEFAULT_KIND[name] ?? "recorrente";
}

/**
 * Etapas-padrão de um serviço pontual. Hoje todos os pontuais são laudos e
 * usam o mesmo fluxo; o usuário pode editar as etapas em cada condomínio.
 */
export function serviceDefaultActivities(_name: string): DefaultActivity[] {
  return LAUDO_ACTIVITIES;
}

export const condoStatus: Record<CondoStatus, Label> = {
  ativo: { label: "Ativo", tone: "success" },
  inativo: { label: "Inativo", tone: "muted" },
  encerrado: { label: "Encerrado", tone: "neutral" },
};

export const generalStatus: Record<GeneralStatus, Label & { dot: string }> = {
  em_dia: { label: "Em dia", tone: "success", dot: "bg-success" },
  atencao: { label: "Atenção", tone: "warning", dot: "bg-warning" },
  critico: { label: "Crítico", tone: "danger", dot: "bg-danger" },
};

export const actionStatus: Record<ActionStatus, Label> = {
  nao_iniciado: { label: "Não iniciado", tone: "neutral" },
  em_andamento: { label: "Em andamento", tone: "info" },
  aguardando_cliente: { label: "Aguardando cliente", tone: "warning" },
  aguardando_fornecedor: { label: "Aguardando fornecedor", tone: "copper" },
  concluido: { label: "Concluído", tone: "success" },
  cancelado: { label: "Cancelado", tone: "muted" },
};

/** Kanban column order for the action plan board. */
export const kanbanColumns: ActionStatus[] = [
  "nao_iniciado",
  "em_andamento",
  "aguardando_cliente",
  "aguardando_fornecedor",
  "concluido",
];

export const priority: Record<Priority, Label> = {
  baixa: { label: "Baixa", tone: "muted" },
  media: { label: "Média", tone: "info" },
  alta: { label: "Alta", tone: "warning" },
  critica: { label: "Crítica", tone: "danger" },
};

export const category: Record<ActionCategory, { label: string }> = {
  gestao: { label: "Gestão" },
  reforma: { label: "Reforma" },
  orcamento: { label: "Orçamento" },
  laudo: { label: "Laudo" },
  reuniao: { label: "Reunião" },
  documentacao: { label: "Documentação" },
  juridico: { label: "Jurídico" },
  outros: { label: "Outros" },
};

export const meetingType: Record<MeetingType, Label> = {
  semanal: { label: "Semanal", tone: "info" },
  mensal: { label: "Mensal", tone: "copper" },
  extraordinaria: { label: "Extraordinária", tone: "warning" },
};

export const visitType: Record<VisitType, { label: string }> = {
  orcamento: { label: "Visita p/ orçamento" },
  visita_tecnica: { label: "Visita técnica" },
  reuniao: { label: "Reunião" },
  vistoria: { label: "Vistoria" },
  inspecao_predial: { label: "Inspeção predial" },
  inspecao_fachada: { label: "Inspeção de fachada" },
  acompanhamento: { label: "Acompanhamento" },
};

export const contactRole: Record<ContactRole, { label: string }> = {
  sindico: { label: "Síndico(a)" },
  subsindico: { label: "Subsíndico(a)" },
  zelador: { label: "Zelador(a)" },
  gerente_predial: { label: "Gerente predial" },
  conselheiro: { label: "Conselheiro(a)" },
  administradora: { label: "Administradora" },
  outro: { label: "Outro" },
};

/**
 * Catálogo de serviços do segmento condominial — usado no cadastro para marcar
 * o que a Assyst presta em cada condomínio. Lista de sugestões; o cadastro
 * também aceita serviço com nome livre.
 */
export const SERVICE_CATALOG: string[] = [
  "Assessoria técnica condominial",
  "Gestão da manutenção",
  "Gestão dos planos de reforma",
  "Fiscalização de fachada",
  "Fiscalização técnica e elaboração de parecer",
  "Inspeção predial",
  "Vistoria técnica",
  "Inspeção de fachada",
  "Laudo técnico",
  "Acompanhamento de obras",
  "Parecer Técnico",
  "Laudo Especializado",
  "Parecer Técnico de Vícios Construtivos",
];

export const visitStatus: Record<VisitStatus, Label> = {
  agendada: { label: "Agendada", tone: "info" },
  realizada: { label: "Realizada", tone: "success" },
  cancelada: { label: "Cancelada", tone: "muted" },
};

export const bidStatus: Record<BidStatus, Label> = {
  preparando_escopo: { label: "Preparando escopo", tone: "neutral" },
  solicitando_propostas: { label: "Solicitando propostas", tone: "info" },
  recebendo_propostas: { label: "Recebendo propostas", tone: "info" },
  equalizacao: { label: "Equalização", tone: "copper" },
  aguardando_aprovacao: { label: "Aguardando aprovação", tone: "warning" },
  contratado: { label: "Contratado", tone: "success" },
  cancelado: { label: "Cancelado", tone: "muted" },
};

/** Ordered BID lifecycle for the status stepper (cancelado is off-flow). */
export const bidFlow: BidStatus[] = [
  "preparando_escopo",
  "solicitando_propostas",
  "recebendo_propostas",
  "equalizacao",
  "aguardando_aprovacao",
  "contratado",
];

export const docCategory: Record<DocCategory, Label> = {
  contrato: { label: "Contrato", tone: "info" },
  art: { label: "ART", tone: "copper" },
  ata: { label: "Ata", tone: "neutral" },
  laudo: { label: "Laudo", tone: "warning" },
  relatorio: { label: "Relatório", tone: "success" },
  proposta: { label: "Proposta", tone: "info" },
  orcamento: { label: "Orçamento", tone: "copper" },
  equalizacao: { label: "Equalização", tone: "info" },
  projeto: { label: "Projeto", tone: "neutral" },
  fotos: { label: "Fotos", tone: "muted" },
  outros: { label: "Outros", tone: "muted" },
};

export const supplierStatus: Record<SupplierStatus, Label> = {
  homologado: { label: "Homologado", tone: "success" },
  em_avaliacao: { label: "Em avaliação", tone: "warning" },
  bloqueado: { label: "Bloqueado", tone: "danger" },
};

export const inviteStatus: Record<InviteStatus, Label> = {
  nao_enviado: { label: "Não enviado", tone: "neutral" },
  enviado: { label: "Enviado", tone: "info" },
  respondido: { label: "Respondido", tone: "info" },
  proposta_recebida: { label: "Proposta recebida", tone: "copper" },
  desclassificado: { label: "Desclassificado", tone: "muted" },
  contratado: { label: "Contratado", tone: "success" },
};

/* ----- formatters ----- */

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** Parse an ISO date as a calendar date (no timezone drift). */
function parse(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function fmtDate(d: ISODate): string {
  const date = parse(d);
  return `${String(date.getDate()).padStart(2, "0")} ${MESES[date.getMonth()]} ${date.getFullYear()}`;
}

export function fmtDateShort(d: ISODate): string {
  const date = parse(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function fmtMoney(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Whole-day difference target - today (negative = overdue). */
export function daysFromToday(d: ISODate): number {
  const ms = parse(d).getTime() - parse(TODAY).getTime();
  return Math.round(ms / 86_400_000);
}

export function isOverdue(d: ISODate, status: ActionStatus): boolean {
  if (status === "concluido" || status === "cancelado") return false;
  return daysFromToday(d) < 0;
}

/* ----- sinal de vigência de contrato ----- */

export type ContractState = "sem_data" | "vigente" | "a_vencer" | "vencido";

export interface ContractSignal {
  state: ContractState;
  label: string;
  tone: Tone;
  days?: number; // dias até o término (negativo = vencido)
}

/** Janela (em dias) antes do término que dispara o alerta "a vencer". */
export const CONTRACT_WARN_DAYS = 90;

export function contractSignal(contractEnd?: ISODate): ContractSignal {
  if (!contractEnd) return { state: "sem_data", label: "Sem data de término", tone: "muted" };
  const days = daysFromToday(contractEnd);
  if (days < 0)
    return { state: "vencido", label: `Vencido há ${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"}`, tone: "danger", days };
  if (days <= CONTRACT_WARN_DAYS)
    return { state: "a_vencer", label: days === 0 ? "Vence hoje" : `Vence em ${days} ${days === 1 ? "dia" : "dias"}`, tone: "warning", days };
  return { state: "vigente", label: "Vigente", tone: "success", days };
}

/** Human relative label, e.g. "em 3 dias", "hoje", "há 2 dias". */
export function relativeDays(d: ISODate): string {
  const n = daysFromToday(d);
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n === -1) return "ontem";
  if (n > 0) return `em ${n} dias`;
  return `há ${Math.abs(n)} dias`;
}

/* ----- dias úteis ----- */

function isWeekend(d: Date): boolean {
  const w = d.getDay();
  return w === 0 || w === 6;
}

function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Soma N dias úteis a uma data ISO (pula fins de semana). */
export function addBusinessDays(iso: ISODate, n: number): ISODate {
  const d = parse(iso);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) added++;
  }
  return toISO(d);
}

/** Dias úteis de `from` até `to` (negativo se `to` já passou). */
export function businessDaysBetween(fromIso: ISODate, toIso: ISODate): number {
  const a = parse(fromIso);
  const b = parse(toIso);
  if (a.getTime() === b.getTime()) return 0;
  const sign = b > a ? 1 : -1;
  let count = 0;
  while (a.getTime() !== b.getTime()) {
    a.setDate(a.getDate() + sign);
    if (!isWeekend(a)) count += sign;
  }
  return count;
}
