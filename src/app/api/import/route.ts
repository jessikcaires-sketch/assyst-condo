import {
  dbUpsertCondos,
  dbAddResponsible,
  dbAddService,
  dbAddAdministrator,
  dbGetCatalogs,
  dbListCondos,
} from "@/lib/db";
import type { Condominium, User } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Migração: recebe os dados que estavam salvos no navegador (localStorage)
 * e grava no banco. Condomínios são upsert por id; catálogos são mesclados.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      condos?: Condominium[];
      responsibles?: User[];
      services?: string[];
      administrators?: string[];
    };

    if (Array.isArray(body.condos) && body.condos.length > 0) {
      await dbUpsertCondos(body.condos);
    }
    if (Array.isArray(body.responsibles)) {
      for (const r of body.responsibles) await dbAddResponsible(r);
    }
    if (Array.isArray(body.services)) {
      for (const s of body.services) await dbAddService(s);
    }
    if (Array.isArray(body.administrators)) {
      for (const a of body.administrators) await dbAddAdministrator(a);
    }

    const [condos, catalogs] = await Promise.all([dbListCondos(), dbGetCatalogs()]);
    return Response.json({ ok: true, condos, catalogs });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
