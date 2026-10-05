import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { logAgentRun } from "@/lib/agent-log";
import { generateChatReply } from "@/lib/ai";
import { getCatalogSnapshot } from "@/lib/catalog-api";

export const maxDuration = 60;

const strategySystemPrompt = `Você é o estrategista de conteúdo da TOP MAX, importadora B2B brasileira que vende em FARDOS (cama, mesa, banho, mantas, tapetes) para lojistas, atacadistas e redes. Quem compra é DONO DE LOJA ou comprador, não o consumidor final. O Instagram existe para gerar autoridade, confiança e levar o lojista ao catálogo online, onde ele escolhe os fardos e faz proposta de preço.

Crie uma estratégia de Instagram ESPECÍFICA para este perfil, usando os dados reais fornecidos (perfil, estoque, destaques, últimos fardos, novidades e perguntas reais dos clientes). Nada genérico: cada pilar e cada post precisa fazer sentido para a Top Max e para o lojista.

Responda SOMENTE com um JSON válido (sem texto antes ou depois, sem markdown), neste formato:
{
  "posicionamento": "1 frase de como a Top Max deve ser percebida",
  "persona": "quem é o cliente ideal, suas dores e o que ele quer ver (2-3 frases)",
  "tom_de_voz": "como escrever (1 frase)",
  "bio_sugerida": "bio do Instagram com até 150 caracteres, com chamada para o catálogo",
  "pilares": [{"nome": "...", "objetivo": "...", "porcentagem": 30, "ideias": ["...", "..."]}],
  "frequencia": "quantos posts, reels e stories por semana e melhores horários para lojistas",
  "calendario": [
    {"dia": 1, "formato": "reels|post|carrossel|story", "pilar": "nome do pilar", "tema": "...", "gancho": "primeira frase que prende (até 10 palavras)", "produto": "NOME EXATO de um produto da lista ou null", "objetivo": "venda|ultimas|novidade|autoridade|colecao", "chamada": "CTA curto"}
  ],
  "ganchos": ["10 ganchos prontos para usar"],
  "metricas": ["3 a 5 indicadores para acompanhar"]
}

Regras:
- 4 ou 5 pilares; a soma das porcentagens = 100. Inclua bastidores da importação (contêiner chegando, conferência de qualidade), prova social, educação do lojista (margem, giro, como vender o produto) e vendas com estoque real.
- Calendário de 14 dias (14 itens), misturando formatos; pelo menos 5 reels.
- Use produtos da lista com nome EXATO; priorize destaques, novidades e últimos fardos.
- Responda dúvidas reais que os clientes fizeram (ex.: pedido mínimo, como funciona a compra em fardos) com conteúdo educativo.
- Nunca invente preço, prazo, frete ou pedido mínimo; quando o tema for esses assuntos, a chamada é falar com a equipe/consultar o catálogo.`;

function parseStrategy(text: string) {
  const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não devolveu a estratégia no formato esperado.");
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed.calendario) || !Array.isArray(parsed.pilares)) {
    throw new Error("Estratégia incompleta.");
  }
  return parsed;
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const profile = body?.profile && typeof body.profile === "object" ? body.profile : {};
  const questions = Array.isArray(body?.questions) ? body.questions.slice(0, 40).map((question: unknown) => String(question).slice(0, 160)) : [];

  const snapshot = await getCatalogSnapshot();
  const products = (snapshot?.items ?? [])
    .filter((item) => item.balesAvailable > 0)
    .map((item) => ({
      nome: item.name,
      pecas_por_fardo: item.piecesPerBale,
      fardos: item.balesAvailable,
      destaque: item.isFeatured,
      novidade: item.isNew,
      ultimos_fardos: item.balesAvailable <= 50,
    }));

  const input = {
    perfil: profile,
    estoque_de: snapshot?.stockDate ?? null,
    produtos: products,
    perguntas_reais_dos_clientes: questions,
  };

  const startedAt = Date.now();

  try {
    const reply = await generateChatReply(
      [
        { role: "system", content: strategySystemPrompt },
        { role: "user", content: JSON.stringify(input).slice(0, 14000) },
      ],
      {
        maxTokens: 9000,
        timeoutMs: 55_000,
        temperature: 0.6,
        reasoningEffort: "low",
        modelOverrides: { nvidia: process.env.GERENTE_NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b" },
      },
    );

    const strategy = parseStrategy(reply.text);
    const { data: saved, error } = await admin.supabase
      .from("content_strategies")
      .insert({ profile, strategy, provider: reply.provider })
      .select("*")
      .single();

    await logAgentRun({
      agent: "conteudo",
      task: "estrategia",
      status: error ? "aviso" : "ok",
      provider: reply.provider,
      durationMs: Date.now() - startedAt,
      detail: error ? `Estratégia gerada, mas não salva: ${error.message}` : null,
    });

    return NextResponse.json({ strategy: saved ?? { profile, strategy, created_at: new Date().toISOString() } });
  } catch (error) {
    await logAgentRun({
      agent: "conteudo",
      task: "estrategia",
      status: "erro",
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : "Falha",
    });
    return NextResponse.json({ error: "strategy_failed" }, { status: 503 });
  }
}
