import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { generateChatReply, isAiConfigured, type ChatMessage } from "@/lib/ai";
import { findMentionedProducts, getSalesAgentKnowledge } from "@/lib/sales-agent";

const maxHistory = 12;
const maxMessageLength = 1000;
const rateWindowMs = 10 * 60 * 1000;
const rateLimitPerWindow = 20;

// Limite por IP em memória: barra abuso simples. Em serverless cada instância
// tem seu contador; o teto de histórico abaixo também limita o custo por conversa.
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < rateWindowMs);
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [entryKey, times] of hits) {
      if (times.every((at) => now - at >= rateWindowMs)) hits.delete(entryKey);
    }
  }

  return recent.length > rateLimitPerWindow;
}

async function logMessages(sessionId: string, locale: string, rows: Array<{ role: string; content: string; provider?: string }>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("chat_messages").insert(
    rows.map((row) => ({
      session_id: sessionId,
      locale,
      role: row.role,
      content: row.content,
      provider: row.provider ?? null,
    })),
  );

  if (error) console.error("[chat] falha ao registrar conversa:", error.message);
}

export async function POST(request: NextRequest) {
  if (!isAiConfigured()) {
    return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { sessionId?: unknown; locale?: unknown; messages?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : "";
  const locale = body.locale === "zh" ? "zh" : "pt";
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];

  const history: ChatMessage[] = rawMessages
    .filter(
      (message): message is { role: "user" | "assistant"; content: string } =>
        typeof message === "object" &&
        message !== null &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .slice(-maxHistory)
    .map((message) => ({ role: message.role, content: message.content.slice(0, maxMessageLength) }));

  const lastMessage = history.at(-1);

  if (!sessionId || !lastMessage || lastMessage.role !== "user" || !lastMessage.content.trim()) {
    return NextResponse.json({ error: "invalid_messages" }, { status: 400 });
  }

  const knowledge = await getSalesAgentKnowledge();

  try {
    // O modelo da NVIDIA é fraco em chinês: em /zh o Gemini (se configurado) responde primeiro.
    const reply = await generateChatReply([{ role: "system", content: knowledge.systemPrompt[locale] }, ...history], {
      providerOrder: locale === "zh" ? ["gemini", "groq", "nvidia"] : undefined,
    });

    await logMessages(sessionId, locale, [
      { role: "user", content: lastMessage.content },
      { role: "assistant", content: reply.text, provider: reply.provider },
    ]);

    return NextResponse.json({
      reply: reply.text,
      products: findMentionedProducts(reply.text, knowledge.products),
    });
  } catch {
    await logMessages(sessionId, locale, [{ role: "user", content: lastMessage.content }]);
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
