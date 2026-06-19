import { PageHeader } from "@/components/page-header";
import { ActionPlan } from "@/components/action-plan";
import { getActionItems, getCondos } from "@/lib/mock-data";

export default function PlanoDeAcaoPage() {
  const items = getActionItems();
  const condoNames = Object.fromEntries(getCondos().map((c) => [c.id, c.name]));

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Operação"
        title="Plano de ação"
        description="Todas as entregas, atividades e pendências da carteira. Alterne entre lista, kanban e calendário."
      />
      <div className="px-4 py-6 md:px-8">
        <ActionPlan items={items} condoNames={condoNames} showCondo />
      </div>
    </div>
  );
}
