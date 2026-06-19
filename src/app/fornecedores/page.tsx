import { PageHeader } from "@/components/page-header";
import { SuppliersView } from "@/components/fornecedores/suppliers-view";

export default function FornecedoresPage() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Suprimentos"
        title="Fornecedores"
        description="Cadastro e homologação de fornecedores, categorias de atuação, histórico de convites e propostas, e avaliação interna."
      />
      <div className="px-4 py-6 md:px-8">
        <SuppliersView />
      </div>
    </div>
  );
}
