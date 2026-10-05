import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { logAgentRun } from "@/lib/agent-log";
import { generateChatReply } from "@/lib/ai";
import { getCatalogSnapshot } from "@/lib/catalog-api";
import {
  checkPackingList,
  matchStockProduct,
  normalizePackingList,
  PACKING_LIST_PROMPT,
  type PackingCheck,
  type PackingList,
} from "@/lib/packing-list";
import { extractPdfLayout } from "@/lib/pdf-layout";

export const maxDuration = 60;

function parseJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("resposta sem JSON");
  return JSON.parse(text.slice(start, end + 1));
}

// Lê o PDF do packing list, extrai com IA e confere a matemática.
// Modelo rápido primeiro; se a conferência acusar diferença, o modelo maior refaz e fica o melhor resultado.
export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const base64 = typeof body?.pdf === "string" ? body.pdf.replace(/^data:application\/pdf;base64,/, "") : "";
  if (!base64 || base64.length > 6_000_000) {
    return NextResponse.json({ error: "Envie um PDF de até 4 MB." }, { status: 400 });
  }

  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  if (String.fromCharCode(...bytes.slice(0, 4)) !== "%PDF") {
    return NextResponse.json({ error: "O arquivo não é um PDF." }, { status: 400 });
  }

  const startedAt = Date.now();

  try {
    const { text } = await extractPdfLayout(bytes);
    if (text.replace(/\s/g, "").length < 80) {
      return NextResponse.json(
        { error: "Este PDF não tem texto (é uma imagem escaneada). Envie o PDF original do fornecedor." },
        { status: 422 },
      );
    }

    const snapshot = await getCatalogSnapshot();
    const names = (snapshot?.items ?? []).map((item) => `${item.name} (${item.piecesPerBale} pç/fardo)`);
    const userContent = `PRODUTOS_DO_ESTOQUE:\n${names.join("\n")}\n\nDOCUMENTO:\n${text.slice(0, 16000)}`;

    const attempts: Array<{ list: PackingList; check: PackingCheck; provider: string }> = [];
    const models = [undefined, process.env.GERENTE_NVIDIA_MODEL || "nvidia/nemotron-3-super-120b-a12b"];

    for (const model of models) {
      if (Date.now() - startedAt > 30_000 && attempts.length) break;
      try {
        const reply = await generateChatReply(
          [
            { role: "system", content: PACKING_LIST_PROMPT },
            { role: "user", content: userContent },
          ],
          {
            maxTokens: 8000,
            temperature: 0,
            timeoutMs: 26_000,
            reasoningEffort: "low",
            ...(model ? { modelOverrides: { nvidia: model } } : {}),
          },
        );
        const list = normalizePackingList(parseJson(reply.text));
        const check = checkPackingList(list);
        attempts.push({ list, check, provider: model ? `${reply.provider}:${model}` : reply.provider });
        if (check.ok) break;
      } catch {
        // tenta o próximo modelo
      }
    }

    if (!attempts.length) throw new Error("A IA não conseguiu ler o documento");

    const best = attempts.sort((a, b) => a.check.issues.length - b.check.issues.length)[0];

    // Produto do estoque: regra fixa (mesmas peças por fardo + tamanho/tipo). A sugestão da IA só vale se passar nela.
    const stock = (snapshot?.items ?? []).map((item) => ({ name: item.name, piecesPerBale: item.piecesPerBale }));
    best.list.itens = best.list.itens.map((item) => {
      const byRule = matchStockProduct(item, stock);
      const aiPick = stock.find((product) => item.produto_sugerido?.toUpperCase().startsWith(product.name.toUpperCase()));
      const aiValid = aiPick && aiPick.piecesPerBale === item.qtd_por_volume ? aiPick.name : null;
      return { ...item, produto_sugerido: byRule ?? (aiValid && matchStockProduct(item, [aiPick!]) ? aiValid : null) };
    });

    await logAgentRun({
      agent: "armazem",
      task: "conferir_packing_list",
      status: best.check.ok ? "ok" : "aviso",
      provider: best.provider,
      durationMs: Date.now() - startedAt,
      detail: `${best.list.invoice ?? "?"} / ${best.list.conteiner ?? "?"}: ${best.check.ok ? "conferido" : best.check.issues.slice(0, 3).join(" | ")}`,
    });

    return NextResponse.json({ list: best.list, check: best.check, attempts: attempts.length });
  } catch (error) {
    await logAgentRun({
      agent: "armazem",
      task: "conferir_packing_list",
      status: "erro",
      durationMs: Date.now() - startedAt,
      detail: error instanceof Error ? error.message : "Falha",
    });
    return NextResponse.json({ error: "Não foi possível ler o packing list agora. Tente de novo em instantes." }, { status: 503 });
  }
}
