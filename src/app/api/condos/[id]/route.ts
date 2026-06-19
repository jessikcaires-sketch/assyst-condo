import { dbUpdateCondo, dbDeleteCondo } from "@/lib/db";
import type { Condominium } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const patch = (await request.json()) as Partial<Condominium>;
    const condo = await dbUpdateCondo(id, patch);
    if (!condo) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ condo });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await dbDeleteCondo(id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
