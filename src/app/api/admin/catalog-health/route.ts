import { NextResponse } from "next/server";
import { checkCatalogHealth } from "@/lib/catalog-api";

export const dynamic = "force-dynamic";

// Só expõe dados que o catálogo já mostra publicamente (nunca preço mínimo).
export async function GET() {
  return NextResponse.json(await checkCatalogHealth(), { headers: { "Cache-Control": "no-store" } });
}
