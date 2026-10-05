import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-api";

export const dynamic = "force-dynamic";

// Lista pública dos produtos do catálogo (mesmos dados que o catálogo já mostra).
export async function GET() {
  const snapshot = await getCatalogSnapshot();
  return NextResponse.json(snapshot ?? { stockDate: null, items: [] }, { headers: { "Cache-Control": "no-store" } });
}
