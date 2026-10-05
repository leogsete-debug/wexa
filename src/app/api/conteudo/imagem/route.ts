import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { logAgentRun } from "@/lib/agent-log";

export const maxDuration = 60;

// Geração de imagens com FLUX.1 Schnell na Cloudflare Workers AI (cota gratuita diária;
// quando acaba, a Cloudflare bloqueia em vez de cobrar).
export async function POST(request: NextRequest) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "image_ai_not_configured" }, { status: 503 });
  }

  const admin = await getAdminUser(request);
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 1500) : "";
  if (!prompt) return NextResponse.json({ error: "missing_prompt" }, { status: 400 });

  const startedAt = Date.now();

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, steps: 8, seed: Math.floor(Math.random() * 1_000_000) }),
      signal: AbortSignal.timeout(50_000),
    });

    const data = await response.json().catch(() => null);
    const image = data?.result?.image;

    if (!response.ok || typeof image !== "string") {
      const reason = data?.errors?.[0]?.message || `HTTP ${response.status}`;
      await logAgentRun({ agent: "conteudo", task: "imagem_ia", status: "erro", provider: "cloudflare", durationMs: Date.now() - startedAt, detail: reason });
      return NextResponse.json({ error: "image_failed", detail: reason }, { status: 502 });
    }

    await logAgentRun({ agent: "conteudo", task: "imagem_ia", status: "ok", provider: "cloudflare", durationMs: Date.now() - startedAt });
    return NextResponse.json({ image: `data:image/jpeg;base64,${image}` });
  } catch (error) {
    await logAgentRun({
      agent: "conteudo",
      task: "imagem_ia",
      status: "erro",
      provider: "cloudflare",
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : "Falha",
    });
    return NextResponse.json({ error: "image_failed" }, { status: 502 });
  }
}
