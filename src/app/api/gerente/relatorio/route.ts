import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { logAgentRun } from "@/lib/agent-log";
import { generateChatReply } from "@/lib/ai";

export const maxDuration = 60;

const kinds = new Set(["semanal", "mensal", "anual"]);

const systemPrompt = `Você é o Gerente, agente de análise da TOP MAX, importadora B2B brasileira que vende em fardos (cama, mesa, banho, mantas, tapetes) para lojistas, atacadistas e redes.

O ecossistema: o site é a vitrine; a Sofia (assistente virtual) atende no site e leva ao catálogo; no catálogo o cliente escolhe fardos e faz proposta de preço; pedidos e estoque ficam no sistema próprio do dono (Apps Script). O dono quer focar em vender e escalar o negócio.

Sua tarefa: analisar os números do período comparando com o período anterior e escrever um relatório curto, direto e acionável, em português do Brasil.

Formato OBRIGATÓRIO (texto simples, use exatamente estes títulos com "## " e itens com "- "):
## Resumo
2 ou 3 frases com o principal do período.
## O que funcionou
- até 3 itens
## Problemas
- até 3 itens (se não houver, diga que não houve)
## Oportunidades
- até 4 itens (produtos acabando, produtos que clientes pedem e não temos, canais com mais conversão)
## Ações da semana
- exatamente 3 ações priorizadas, cada uma começando com quem faz: "Você:" (o dono) ou "Agentes:" (automação)

Como ler os dados:
- catalogo.produtos_no_catalogo: lista do que JÁ vendemos. Ao analisar as perguntas dos clientes, só sugira "incluir no catálogo" o que NÃO está nessa lista.
- catalogo.ultimos_fardos: produtos com 50 fardos ou menos = estoque ACABANDO (oportunidade de campanha "últimas unidades" ou de reposição), não significa que estão em alta.
- catalogo.sem_estoque: produtos zerados.
- perguntas_recentes_dos_clientes: o que os visitantes perguntaram à Sofia.

Regras: use só os dados fornecidos; cite números e variações (ex.: "visitantes +40%"); se houver poucos dados, diga isso e recomende ações para gerar tráfego; nunca invente números; sem markdown além de "## " e "- ".`;

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!token || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Só quem está logado no painel gera relatórios (evita uso da IA por terceiros).
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData } = await supabase.auth.getUser(token);

  if (!userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || !kinds.has(body.kind) || !body.periodStart || !body.periodEnd || typeof body.current !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const input = {
    tipo_relatorio: body.kind,
    periodo: { inicio: body.periodStart, fim: body.periodEnd },
    periodo_atual: body.current,
    periodo_anterior: body.previous ?? null,
    catalogo: body.catalog ?? null,
    perguntas_recentes_dos_clientes: Array.isArray(body.questions)
      ? body.questions.slice(0, 60).map((question: unknown) => String(question).slice(0, 200))
      : [],
    alertas_do_painel: Array.isArray(body.alerts) ? body.alerts.slice(0, 12).map((alert: unknown) => String(alert).slice(0, 300)) : [],
  };

  const startedAt = Date.now();

  try {
    const reply = await generateChatReply(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Dados do período (JSON):\n${JSON.stringify(input).slice(0, 12000)}` },
      ],
      {
        maxTokens: 6000,
        timeoutMs: 50_000,
        temperature: 0.3,
        reasoningEffort: "low",
        // Relatório pede precisão mais que velocidade: modelo maior que o da Sofia.
        modelOverrides: { nvidia: process.env.GERENTE_NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b" },
      },
    );

    const { data: saved, error } = await supabase
      .from("manager_reports")
      .insert({
        kind: body.kind,
        period_start: body.periodStart,
        period_end: body.periodEnd,
        metrics: input,
        analysis: reply.text,
        provider: reply.provider,
      })
      .select("*")
      .single();

    await logAgentRun({
      agent: "gerente",
      task: `relatorio_${body.kind}`,
      status: error ? "aviso" : "ok",
      provider: reply.provider,
      durationMs: Date.now() - startedAt,
      detail: error ? `Análise gerada, mas não foi salva: ${error.message}` : null,
    });

    return NextResponse.json({ report: saved ?? { analysis: reply.text, kind: body.kind, created_at: new Date().toISOString() } });
  } catch (error) {
    await logAgentRun({
      agent: "gerente",
      task: `relatorio_${body.kind}`,
      status: "erro",
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : "Falha desconhecida",
    });

    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
