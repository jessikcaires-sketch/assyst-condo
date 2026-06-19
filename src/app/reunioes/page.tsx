import { PageHeader } from "@/components/page-header";
import { MeetingsView } from "@/components/reunioes/meetings-view";

export default function ReunioesPage() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Operação"
        title="Reuniões"
        description="Registro de reuniões semanais, mensais e extraordinárias — com resumo, ata, decisões e próximos passos. Converta próximos passos em pendências do Plano de Ação."
      />
      <div className="px-4 py-6 md:px-8">
        <MeetingsView />
      </div>
    </div>
  );
}
