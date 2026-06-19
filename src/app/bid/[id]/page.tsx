import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Award,
  CheckCircle2,
  Paperclip,
  Trophy,
  Building2,
  CalendarClock,
  Tag,
} from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getBid,
  getCondo,
  getSupplier,
  getBidInvites,
  getProposals,
} from "@/lib/mock-data";
import {
  bidStatus,
  bidFlow,
  inviteStatus,
  category,
  fmtMoney,
  fmtDate,
  fmtDateShort,
} from "@/lib/domain";
import { cn } from "@/lib/utils";

export default async function BidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bid = getBid(id);
  if (!bid) notFound();

  const condo = getCondo(bid.condoId);
  const invites = getBidInvites(bid.id);
  const proposals = getProposals(bid.id);
  const st = bidStatus[bid.status];

  const currentStep = bidFlow.indexOf(bid.status);
  const minValue = Math.min(...proposals.map((p) => p.value), Infinity);

  // Equalization rows sorted cheapest-first, classified by invite status.
  const inviteStatusOf = (sid: string) => invites.find((i) => i.supplierId === sid)?.status;
  const rows = [...proposals].sort((a, b) => a.value - b.value);

  return (
    <div className="animate-rise">
      {/* Header */}
      <div className="border-b bg-background/60 px-4 py-6 md:px-8 md:py-7">
        <Link
          href="/bid"
          className="mb-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> BID & Orçamentos
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-[1.75rem]">{bid.title}</h1>
              <Badge tone={st.tone} dot>{st.label}</Badge>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Building2 className="size-3.5" /> {condo?.name}</span>
              <span className="inline-flex items-center gap-1.5"><Tag className="size-3.5" /> {category[bid.category].label}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5" /> prazo {fmtDate(bid.deadline)}</span>
            </p>
            {bid.description && <p className="mt-2 max-w-2xl text-sm">{bid.description}</p>}
          </div>
          <button className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            <Send className="size-4" /> Disparar BID
          </button>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6 md:px-8">
        {/* Stepper */}
        <Panel className="px-5 py-5">
          <div className="eyebrow mb-4">Fluxo da demanda</div>
          <ol className="flex flex-wrap gap-y-3">
            {bidFlow.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <li key={step} className="flex flex-1 items-center gap-2" style={{ minWidth: "8rem" }}>
                  <div
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border text-[0.625rem] font-semibold tabular-nums",
                      done && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary bg-primary/10 text-primary",
                      !done && !active && "border-border-strong text-muted-foreground",
                    )}
                  >
                    {done ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </div>
                  <span className={cn("text-xs leading-tight", active ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {bidStatus[step].label}
                  </span>
                  {i < bidFlow.length - 1 && <span className="mx-1 hidden h-px flex-1 bg-border lg:block" />}
                </li>
              );
            })}
          </ol>
        </Panel>

        {/* Disparo / convites */}
        <Panel className="overflow-hidden p-0">
          <PanelHeader
            eyebrow="Módulo de disparo"
            title="Fornecedores convidados"
            action={<span className="font-mono text-xs text-muted-foreground">{invites.length} convites</span>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <Th className="pl-5">Fornecedor</Th>
                  <Th>Status do convite</Th>
                  <Th className="text-center">Enviado</Th>
                  <Th className="text-center">Respondido</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invites.map((inv) => {
                  const sup = getSupplier(inv.supplierId);
                  const ist = inviteStatus[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="py-2.5 pl-5 pr-4 font-medium">{sup?.tradeName}</td>
                      <td className="px-4"><Badge tone={ist.tone}>{ist.label}</Badge></td>
                      <td className="px-4 text-center font-mono text-xs text-muted-foreground">{inv.sentAt ? fmtDateShort(inv.sentAt) : "—"}</td>
                      <td className="px-4 text-center font-mono text-xs text-muted-foreground">{inv.respondedAt ? fmtDateShort(inv.respondedAt) : "—"}</td>
                    </tr>
                  );
                })}
                {invites.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum fornecedor convidado ainda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Equalização */}
        <Panel className="overflow-hidden p-0">
          <PanelHeader eyebrow="Módulo de equalização" title="Quadro comparativo de propostas" />
          {proposals.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhuma proposta recebida ainda.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <Th className="pl-5">Fornecedor</Th>
                      <Th className="text-right">Valor</Th>
                      <Th className="text-center">Prazo</Th>
                      <Th>Garantia</Th>
                      <Th>Classificação</Th>
                      <Th className="pr-5">Obs.</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((p) => {
                      const sup = getSupplier(p.supplierId);
                      const isRecommended = bid.recommendedSupplierId === p.supplierId;
                      const isWinner = bid.decisionSupplierId === p.supplierId;
                      const isCheapest = p.value === minValue;
                      const disqualified = inviteStatusOf(p.supplierId) === "desclassificado";
                      return (
                        <tr key={p.id} className={cn("align-top", isWinner && "bg-success-soft/40")}>
                          <td className="py-3 pl-5 pr-4">
                            <div className="flex items-center gap-2 font-medium">
                              {sup?.tradeName}
                              {p.attachment && <Paperclip className="size-3.5 text-muted-foreground" />}
                            </div>
                          </td>
                          <td className="px-4 text-right">
                            <span className={cn("font-mono tabular-nums", disqualified && "text-muted-foreground line-through")}>
                              {fmtMoney(p.value)}
                            </span>
                            {isCheapest && !disqualified && (
                              <span className="ml-1.5 font-mono text-[0.625rem] uppercase text-success">menor</span>
                            )}
                          </td>
                          <td className="px-4 text-center font-mono text-xs tabular-nums">{p.deadlineDays}d</td>
                          <td className="px-4 text-xs">{p.warranty}</td>
                          <td className="px-4">
                            <div className="flex flex-wrap gap-1">
                              {isWinner && <Badge tone="success"><Trophy className="size-3" /> Contratado</Badge>}
                              {isRecommended && !isWinner && <Badge tone="info"><Award className="size-3" /> Recomendado</Badge>}
                              {disqualified && <Badge tone="muted">Desclassificado</Badge>}
                            </div>
                          </td>
                          <td className="max-w-[16rem] px-4 pr-5 text-xs text-muted-foreground">{p.notes ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Recomendação + decisão */}
              <div className="grid gap-px border-t bg-border sm:grid-cols-2">
                <div className="bg-card px-5 py-4">
                  <div className="eyebrow mb-1.5 flex items-center gap-1.5"><Award className="size-3.5 text-info" /> Recomendação técnica Assyst</div>
                  <p className="text-sm font-medium">
                    {bid.recommendedSupplierId ? getSupplier(bid.recommendedSupplierId)?.tradeName : "A definir após análise"}
                  </p>
                </div>
                <div className="bg-card px-5 py-4">
                  <div className="eyebrow mb-1.5 flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-success" /> Decisão do condomínio</div>
                  <p className="text-sm font-medium">
                    {bid.decisionSupplierId
                      ? `${getSupplier(bid.decisionSupplierId)?.tradeName}${bid.decisionDate ? ` · ${fmtDate(bid.decisionDate)}` : ""}`
                      : "Aguardando decisão"}
                  </p>
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>
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
