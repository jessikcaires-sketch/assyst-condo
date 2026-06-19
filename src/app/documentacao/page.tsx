import { PageHeader } from "@/components/page-header";
import { DocsView } from "@/components/documentacao/docs-view";

export default function DocumentacaoPage() {
  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Conhecimento"
        title="Documentação"
        description="Referências a documentos no Dropbox, vinculadas aos condomínios. Filtre por condomínio ou categoria e abra os arquivos direto no Dropbox."
      />
      <div className="px-4 py-6 md:px-8">
        <DocsView />
      </div>
    </div>
  );
}
