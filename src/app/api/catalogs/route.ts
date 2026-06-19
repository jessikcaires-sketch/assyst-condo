import {
  dbGetCatalogs,
  dbAddResponsible,
  dbUpdateResponsible,
  dbRemoveResponsible,
  dbAddService,
  dbRemoveService,
  dbAddAdministrator,
  dbRemoveAdministrator,
} from "@/lib/db";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await dbGetCatalogs());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

/**
 * Mutações de catálogo num único endpoint, por ação:
 * { kind: "responsible"|"service"|"administrator", op: "add"|"update"|"remove", ... }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    switch (body.kind) {
      case "responsible":
        if (body.op === "add") await dbAddResponsible(body.value as User);
        else if (body.op === "update") await dbUpdateResponsible(body.id as string, body.patch as Partial<User>);
        else if (body.op === "remove") await dbRemoveResponsible(body.id as string);
        break;
      case "service":
        if (body.op === "add") await dbAddService(body.name as string);
        else if (body.op === "remove") await dbRemoveService(body.name as string);
        break;
      case "administrator":
        if (body.op === "add") await dbAddAdministrator(body.name as string);
        else if (body.op === "remove") await dbRemoveAdministrator(body.name as string);
        break;
      default:
        return Response.json({ error: "kind inválido" }, { status: 400 });
    }
    return Response.json(await dbGetCatalogs());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
