import { PageHeader } from "@/components/page-header";
import { AgendaView } from "@/components/agenda/agenda-view";

export default function AgendaPage() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Operação"
        title="Agenda de visitas"
        description="Visitas dos profissionais da Assyst nas visões dia, semana e mês. Agende visitas avulsas ou recorrentes (semanal, quinzenal, mensal) distribuídas automaticamente em dias úteis."
      />
      <div className="px-4 py-6 md:px-8">
        <AgendaView />
      </div>
    </div>
  );
}
