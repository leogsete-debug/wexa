import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const CATALOG_API_URL =
  process.env.CATALOG_API_URL ||
  "https://script.google.com/macros/s/AKfycbyhDBXCjtSfVaKYMdq6MMTO-ieirPkiSVai62IYEBdDguzt7QlcUYgojZIqUYR0xDNQhw/exec";

export type OrderSummaryItem = {
  numero: string;
  cliente: string;
  vendedor: string;
  data: string;
  etapa: string;
  rotulo: string;
  proximo: string;
  itens: number;
  pecas: number;
  registradoEm: string;
  atualizadoEm: string;
  diasParado: number;
  retiradoEm: string;
};

export type OrdersSummary = {
  geradoEm: string;
  contagem: Record<string, number>;
  rotulos: Record<string, string>;
  pedidos: OrderSummaryItem[];
};

let cache: { at: number; value: OrdersSummary } | null = null;

// Resumo dos pedidos do sistema próprio (Apps Script, rota pedResumo).
// Só para quem está logado no painel; o segredo fica só no servidor (variável PEDIDOS_RESUMO_SEGREDO).
export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const secret = process.env.PEDIDOS_RESUMO_SEGREDO;
  if (!secret) return NextResponse.json({ configured: false });

  if (cache && Date.now() - cache.at < 60_000) {
    return NextResponse.json({ configured: true, summary: cache.value });
  }

  try {
    const response = await fetch(CATALOG_API_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ fn: "pedResumo", args: [secret] }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    const json = await response.json();

    if (!json?.ok) {
      const message = String(json?.error ?? "");
      return NextResponse.json({
        configured: true,
        error: /desligado/i.test(message)
          ? "A rota de pedidos ainda está desligada no Apps Script (falta cadastrar o segredo ou publicar a nova versão)."
          : /inv[aá]lido/i.test(message)
            ? "O segredo da Vercel não confere com o do Apps Script."
            : /desconhecida/i.test(message)
              ? "A nova versão do Apps Script (com pedResumo) ainda não foi publicada."
              : "Não foi possível ler os pedidos agora.",
      });
    }

    cache = { at: Date.now(), value: json.data as OrdersSummary };
    return NextResponse.json({ configured: true, summary: cache.value });
  } catch {
    return NextResponse.json({ configured: true, error: "O sistema de pedidos não respondeu. Tente de novo em instantes." });
  }
}
