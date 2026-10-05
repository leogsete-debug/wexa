"use client";

// Calendário de conteúdo: o agente transforma a estratégia em posts prontos
// (arte ou vídeo + legenda), salva a mídia no Storage e agenda cada dia.
// Roda no navegador (as artes e vídeos são desenhados em <canvas>).

import { drawArt, drawIdeaCard, formatSizes, loadImage, renderVideo, type ArtSlide, type StudioFormat } from "@/lib/studio-render";
import { supabase } from "@/lib/supabase";

export type ContentStatus = "rascunho" | "agendado" | "postado";

export type ContentItem = {
  id: string;
  scheduled_for: string | null;
  status: ContentStatus;
  kind: "arte" | "video" | "texto";
  format: string | null;
  title: string | null;
  pillar: string | null;
  hook: string | null;
  product_name: string | null;
  caption: string | null;
  media_url: string | null;
  media_path: string | null;
  strategy_day: number | null;
  source: "manual" | "agente";
  posted_at: string | null;
  created_at: string;
};

export type StrategyPost = {
  dia: number;
  formato: string;
  pilar: string;
  tema: string;
  gancho: string;
  produto: string | null;
  objetivo: string;
  chamada: string;
};

export type StrategySummary = {
  posicionamento?: string;
  persona?: string;
  tom_de_voz?: string;
  calendario: StrategyPost[];
};

export type CatalogItemLite = {
  key: string;
  name: string;
  piecesPerBale: number;
  balesAvailable: number;
  suggestedPrice: number;
  isNew: boolean;
  isFeatured: boolean;
  photoCount: number;
};

const BUCKET = "media-library";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const photoUrl = (key: string, index = 1) => `/api/catalogo/foto?k=${encodeURIComponent(key)}${index > 1 ? `&n=${index}` : ""}`;

export function toDateKey(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function slug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
}

export async function uploadContentMedia(blob: Blob, extension: string, name: string) {
  const month = toDateKey(new Date()).slice(0, 7);
  const path = `conteudo/${month}/${Date.now()}-${slug(name) || "post"}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || (extension === "png" ? "image/png" : `video/${extension}`),
    upsert: false,
  });
  if (error) throw new Error(`Falha ao salvar a mídia: ${error.message}`);
  return { path, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function removeContentMedia(path: string | null) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Entre de novo no painel.");
  return { Authorization: `Bearer ${token}` };
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem"))), "image/png"),
  );
}

function findProduct(name: string | null, items: CatalogItemLite[]) {
  if (!name) return null;
  const target = name.trim().toLowerCase();
  return (
    items.find((item) => item.name.toLowerCase() === target) ??
    items.find((item) => item.name.toLowerCase().includes(target) || target.includes(item.name.toLowerCase())) ??
    null
  );
}

function badgeFor(objective: string, product: CatalogItemLite | null) {
  if (objective === "ultimas" || (product && product.balesAvailable <= 50)) return "Últimas unidades";
  if (objective === "novidade" || product?.isNew) return "Novidade";
  if (objective === "colecao") return "Coleção";
  if (product?.isFeatured) return "Destaque";
  return product ? "Pronta entrega" : null;
}

async function productSlide(product: CatalogItemLite, photoIndex: number, objective: string, cta: string): Promise<ArtSlide> {
  return {
    mode: "real",
    photos: [await loadImage(photoUrl(product.key, photoIndex))],
    name: product.name,
    stockLine: `${product.piecesPerBale} pç/fardo · ${product.balesAvailable.toLocaleString("pt-BR")} fardos`,
    priceLine: product.suggestedPrice > 0 ? `Sugerido ${money.format(product.suggestedPrice)}/peça` : null,
    badge: badgeFor(objective, product),
    cta,
    ctaHint: "link na bio",
  };
}

async function requestCaption(post: StrategyPost, product: CatalogItemLite | null, strategy: StrategySummary, vertical: boolean) {
  const response = await fetch("/api/conteudo/legenda", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({
      goal: ["venda", "ultimas", "novidade", "autoridade", "colecao"].includes(post.objetivo) ? post.objetivo : "venda",
      format: vertical ? "reels" : "post",
      products: product
        ? [
            {
              nome: product.name,
              pecas_por_fardo: product.piecesPerBale,
              fardos_disponiveis: product.balesAvailable,
              preco_sugerido_por_peca: product.suggestedPrice ? money.format(product.suggestedPrice) : null,
              novidade: product.isNew,
              ultimos_fardos: product.balesAvailable <= 50,
            },
          ]
        : [],
      strategy: {
        posicionamento: strategy.posicionamento,
        persona: strategy.persona,
        tom_de_voz: strategy.tom_de_voz,
        pilar: post.pilar,
        tema: post.tema,
        gancho: post.gancho,
        chamada: post.chamada,
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  return typeof data.caption === "string" ? data.caption : null;
}

export type GenerationStep = { done: number; total: number; label: string };

// Gera, salva e agenda os posts dos primeiros `days` dias da estratégia a partir de `startDate`.
export async function generateContentFromStrategy(options: {
  strategy: StrategySummary;
  catalog: CatalogItemLite[];
  startDate: string;
  days: number;
  onStep: (step: GenerationStep) => void;
}) {
  const posts = options.strategy.calendario.filter((post) => post.dia >= 1 && post.dia <= options.days).sort((a, b) => a.dia - b.dia);
  const created: string[] = [];
  const failures: string[] = [];
  // O Chrome só grava vídeo de um canvas que está na página: fica invisível fora da tela.
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;left:-99999px;top:0;width:10px;height:10px;opacity:0;pointer-events:none";
  document.body.appendChild(canvas);

  for (const [index, post] of posts.entries()) {
    const label = `Dia ${post.dia}: ${post.gancho}`;
    options.onStep({ done: index, total: posts.length, label });

    try {
      const product = findProduct(post.produto, options.catalog);
      const vertical = /reels|story/i.test(post.formato);
      const isReels = /reels/i.test(post.formato);
      const format: StudioFormat = vertical ? "story" : "post";
      const [w, h] = formatSizes[format];
      canvas.width = w;
      canvas.height = h;
      const cta = (post.chamada || "Peça pelo catálogo").slice(0, 28);

      let blob: Blob;
      let extension: string;
      let kind: ContentItem["kind"];

      if (isReels) {
        const slides: ArtSlide[] = [];
        if (product) {
          for (let photo = 1; photo <= Math.min(3, Math.max(1, product.photoCount)); photo += 1) {
            slides.push(await productSlide(product, photo, post.objetivo, cta));
          }
        }
        const video = await renderVideo(
          canvas,
          {
            slides,
            secondsPerSlide: 2.2,
            intro: { title: post.gancho, subtitle: post.tema },
            outro: { title: cta, subtitle: "link na bio" },
            footer: "topmax · atacado em fardos",
          },
          () => undefined,
        );
        blob = video.blob;
        extension = video.extension;
        kind = "video";
      } else {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas indisponível");
        if (product) {
          drawArt(ctx, await productSlide(product, 1, post.objetivo, cta), 0);
        } else {
          drawIdeaCard(ctx, { title: post.gancho, subtitle: post.tema, badge: post.pilar, cta, ctaHint: "link na bio" });
        }
        blob = await canvasToBlob(canvas);
        extension = "png";
        kind = "arte";
      }

      const caption = await requestCaption(post, product, options.strategy, vertical).catch(() => null);
      const media = await uploadContentMedia(blob, extension, post.gancho);

      const { data, error } = await supabase
        .from("content_items")
        .insert({
          scheduled_for: addDays(options.startDate, post.dia - 1),
          status: caption ? "agendado" : "rascunho",
          kind,
          format: post.formato,
          title: post.tema,
          pillar: post.pilar,
          hook: post.gancho,
          product_name: product?.name ?? null,
          caption,
          media_url: media.url,
          media_path: media.path,
          strategy_day: post.dia,
          source: "agente",
        })
        .select("id")
        .single();

      if (error || !data) throw new Error(error?.message ?? "Falha ao salvar o post");
      created.push(data.id);
    } catch (error) {
      failures.push(`${label} — ${error instanceof Error ? error.message : "erro"}`);
    }
  }

  canvas.remove();
  options.onStep({ done: posts.length, total: posts.length, label: "Concluído" });
  return { created, failures };
}
