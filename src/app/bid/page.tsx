import { PageHeader } from "@/components/page-header";
import { BidsView } from "@/components/bid/bids-view";

export default function BidPage() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Suprimentos"
        title="BID & Orçamentos"
        description="Demandas de orçamento da carteira — do escopo ao contrato. Acompanhe o disparo aos fornecedores, o recebimento de propostas e a equalização técnica."
      />
      <div className="px-4 py-6 md:px-8">
        <BidsView />
      </div>
    </div>
  );
}
