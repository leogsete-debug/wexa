import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { logAgentRun } from "@/lib/agent-log";
import { generateChatReply } from "@/lib/ai";
import { CATALOG_STORE_URL } from "@/lib/catalog-store";

export const maxDuration = 60;

const catalogLink = CATALOG_STORE_URL.replace(/^https?:\/\//, "").replace(/\?.*$/, "");

const goals: Record<string, string> = {
  venda: "vender o produto agora (foco em preço sugerido por peça e disponibilidade em fardos)",
  ultimas: "criar urgência: últimos fardos disponíveis",
  novidade: "apresentar uma novidade que acabou de chegar",
  autoridade: "gerar autoridade e confiança na Top Max como importadora (qualidade, volume, experiência)",
  colecao: "apresentar vários produtos juntos como uma coleção para lojistas",
};

export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const products = Array.isArray(body?.products) ? body.products.slice(0, 8) : [];
  const goal = goals[body?.goal] ? body.goal : "venda";
  const format = body?.format === "reels" ? "Reels/Stories (vídeo vertical)" : "post de feed";

  if (products.length === 0) {
    return NextResponse.json({ error: "missing_products" }, { status: 400 });
  }

  const system = `Você é o agente de Conteúdo da TOP MAX, importadora B2B brasileira que vende em FARDOS para lojistas, atacadistas e redes (cama, mesa, banho, mantas, tapetes). Público: donos de loja e compradores, não consumidor final.

Escreva uma legenda de Instagram em português do Brasil para um ${format}. Objetivo: ${goals[goal]}.

Regras:
- Gancho forte na primeira linha (até 8 palavras).
- Corpo curto (3 a 5 linhas), falando a língua do lojista: margem, giro, pronta entrega, compra em fardos.
- Use só os dados fornecidos (nome, peças por fardo, fardos disponíveis, preço SUGERIDO por peça). Nunca invente preço, prazo, frete, pedido mínimo ou características.
- Se citar preço, diga que é "preço sugerido" e que o lojista faz a proposta no catálogo.
- Chamada final: pedir para acessar o catálogo pelo link da bio (${catalogLink}).
- No máximo 3 emojis.
- Depois da legenda, uma linha em branco e 8 a 12 hashtags relevantes (nicho atacado/varejo de cama, mesa e banho, Brasil).
Responda só com a legenda e as hashtags, sem títulos.`;

  const startedAt = Date.now();

  try {
    const reply = await generateChatReply(
      [
        { role: "system", content: system },
        { role: "user", content: `Produtos:\n${JSON.stringify(products).slice(0, 4000)}` },
      ],
      { maxTokens: 1500, temperature: 0.7 },
    );

    await logAgentRun({ agent: "conteudo", task: "legenda", status: "ok", provider: reply.provider, durationMs: Date.now() - startedAt });
    return NextResponse.json({ caption: reply.text });
  } catch (error) {
    await logAgentRun({
      agent: "conteudo",
      task: "legenda",
      status: "erro",
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : "Falha",
    });
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
