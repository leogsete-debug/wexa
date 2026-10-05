import { NextResponse, type NextRequest } from "next/server";
import { getCatalogPhoto } from "@/lib/catalog-api";

// Serve uma foto do catálogo de pedidos. A CDN da Vercel guarda a resposta, então
// o pacote completo de fotos do Apps Script quase nunca é baixado.
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("k")?.slice(0, 200);
  const index = Math.min(Math.max(Number(request.nextUrl.searchParams.get("n")) || 1, 1), 20);

  if (!key) {
    return NextResponse.json({ error: "missing_key" }, { status: 400 });
  }

  const photo = await getCatalogPhoto(key, index);

  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: { "Cache-Control": "public, s-maxage=300" } });
  }

  return new NextResponse(new Uint8Array(photo.bytes), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=21600, stale-while-revalidate=604800",
    },
  });
}
