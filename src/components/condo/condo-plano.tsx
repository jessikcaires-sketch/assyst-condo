"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ActionPlan } from "@/components/action-plan";
import { useCondoStore } from "@/lib/condo-store";
import { getActionItems } from "@/lib/mock-data";

export function CondoPlano() {
  const params = useParams<{ id: string }>();
  const { getCondo, hydrated } = useCondoStore();
  const condo = getCondo(params.id);

  if (!condo) {
    return (
      <div className="animate-rise px-4 py-16 text-center md:px-8">
        <p className="text-sm text-muted-foreground">
          {hydrated ? "Condomínio não encontrado." : "Carregando…"}
        </p>
        <Link href="/condominios" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="size-3.5" /> Voltar para condomínios
        </Link>
      </div>
    );
  }

  const items = getActionItems(condo.id);

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={
          <Link
            href={`/condominios/${condo.id}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {condo.name}
          </Link>
        }
        title="Plano de ação"
        description="Entregas, atividades e pendências deste condomínio."
      />
      <div className="px-4 py-6 md:px-8">
        <ActionPlan
          items={items}
          condoNames={{ [condo.id]: condo.name }}
          fixedCondoId={condo.id}
        />
      </div>
    </div>
  );
}
