import { NextResponse, type NextRequest } from "next/server";
import { getCatalogPhoto } from "@/lib/catalog-api";

export const maxDuration = 60;

// Serve uma foto do catálogo de pedidos. A CDN da Vercel guarda a resposta por 24h,
// então o pacote completo de fotos do Apps Script (~13 MB) quase nunca é baixado.
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("k")?.slice(0, 200);
  const index = Math.min(Math.max(Number(request.nextUrl.searchParams.get("n")) || 1, 1), 20);

  if (!key) {
    return NextResponse.json({ error: "missing_key" }, { status: 400 });
  }

  try {
    const photo = await getCatalogPhoto(key, index);

    if (!photo) {
      return NextResponse.json({ error: "not_found" }, { status: 404, headers: { "Cache-Control": "public, s-maxage=600" } });
    }

    return new NextResponse(new Uint8Array(photo.bytes), {
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    // Falha temporária ao buscar as fotos: o navegador tenta de novo; nada fica em cache.
    return NextResponse.json({ error: "temporarily_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "5" } });
  }
}
