import { dbListCondos, dbCreateCondo } from "@/lib/db";
import type { Condominium } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const condos = await dbListCondos();
    return Response.json({ condos });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Omit<Condominium, "id" | "valueMetrics">;
    const condo = await dbCreateCondo(input);
    return Response.json({ condo }, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
