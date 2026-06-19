import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export function ComingSoon({
  eyebrow,
  title,
  description,
  note,
}: {
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <div className="animate-rise">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="px-4 py-6 md:px-8">
        <Panel className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-lg border border-dashed border-border-strong bg-muted/50 text-copper">
            <Hammer className="size-5" />
          </div>
          <div>
            <div className="eyebrow mb-1.5">Módulo em construção</div>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              {note ??
                "Este módulo faz parte do MVP e será conectado ao Supabase na sequência. A estrutura de dados já está modelada."}
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
