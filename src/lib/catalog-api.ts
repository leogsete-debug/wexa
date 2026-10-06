// Integração com o sistema operacional da TOP MAX (catálogo / pedidos / vendas),
// que roda em Google Apps Script + Planilhas. É a fonte da verdade de produtos,
// estoque e preço sugerido. Só usamos as funções públicas do catálogo.
//
// Nunca exponha campos internos (ex.: preço mínimo de negociação).

const CATALOG_API_URL =
  process.env.CATALOG_API_URL ||
  "https://script.google.com/macros/s/AKfycbyhDBXCjtSfVaKYMdq6MMTO-ieirPkiSVai62IYEBdDguzt7QlcUYgojZIqUYR0xDNQhw/exec";

export type CatalogItem = {
  key: string;
  name: string;
  piecesPerBale: number;
  balesAvailable: number;
  piecesAvailable: number;
  suggestedPrice: number;
  isNew: boolean;
  isFeatured: boolean;
  photoCount: number;
  // "estoque" = pronta entrega; "chegando" = em carga a caminho; "encomenda" = abaixo do mínimo/sob encomenda
  status: "estoque" | "chegando" | "encomenda";
  incomingBales: number;
  forecast: string | null;
};

export type CatalogSnapshot = {
  stockDate: string | null;
  items: CatalogItem[];
};

type RawCatalogProduct = {
  chave?: unknown;
  nome?: unknown;
  pcs?: unknown;
  fardos?: unknown;
  pecas?: unknown;
  preco?: unknown;
  novidade?: unknown;
  destaque?: unknown;
  nFotos?: unknown;
  status?: unknown;
  chegando?: unknown;
  previsao?: unknown;
};

const dataTtlMs = 5 * 60 * 1000;
const photosTtlMs = 30 * 60 * 1000;

let dataCache: { at: number; value: CatalogSnapshot } | null = null;

async function callCatalog<T>(fn: string, timeoutMs: number, args: unknown[] = []): Promise<T> {
  const response = await fetch(CATALOG_API_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ fn, args }),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const json = await response.json();

  if (!json?.ok) {
    throw new Error(`catalog_api_${fn}_failed`);
  }

  return json.data as T;
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function getCatalogSnapshot(): Promise<CatalogSnapshot | null> {
  if (dataCache && Date.now() - dataCache.at < dataTtlMs) {
    return dataCache.value;
  }

  try {
    const data = await callCatalog<{ estoqueData?: unknown; produtos?: RawCatalogProduct[] }>("catDados", 15_000);

    const value: CatalogSnapshot = {
      stockDate: typeof data.estoqueData === "string" ? data.estoqueData : null,
      items: (data.produtos ?? [])
        .filter((product) => typeof product.chave === "string" && typeof product.nome === "string")
        .map((product) => ({
          key: String(product.chave),
          name: String(product.nome),
          piecesPerBale: toNumber(product.pcs),
          balesAvailable: toNumber(product.fardos),
          piecesAvailable: toNumber(product.pecas),
          suggestedPrice: toNumber(product.preco),
          isNew: product.novidade === true,
          isFeatured: product.destaque === true,
          photoCount: toNumber(product.nFotos),
          status: product.status === "chegando" || product.status === "encomenda" ? product.status : "estoque",
          incomingBales: toNumber(product.chegando),
          forecast: typeof product.previsao === "string" && product.previsao ? product.previsao : null,
        })),
    };

    dataCache = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("[catalog-api] catDados falhou:", error instanceof Error ? error.message : error);
    // Melhor mostrar dados de alguns minutos atrás do que nada.
    return dataCache?.value ?? null;
  }
}

const photoCache = new Map<string, { at: number; dataUrl: string | null }>();

// Uma foto por vez (rota catFoto do Apps Script, ~2 s). Guarda em memória por 30 min;
// a CDN da Vercel guarda a resposta por 24 h.
export async function getCatalogPhoto(key: string, index = 1) {
  const cacheKey = `${key}#${index}`;
  const cached = photoCache.get(cacheKey);
  let dataUrl: string | null;

  if (cached && Date.now() - cached.at < photosTtlMs) {
    dataUrl = cached.dataUrl;
  } else {
    try {
      dataUrl = await callCatalog<string | null>("catFoto", 30_000, [key, index]);
    } catch (error) {
      console.error("[catalog-api] catFoto falhou:", error instanceof Error ? error.message : error);
      if (cached) {
        dataUrl = cached.dataUrl;
      } else {
        // Falha temporária (não é "foto inexistente")
        throw new Error("catalog_photos_unavailable");
      }
    }
    photoCache.set(cacheKey, { at: Date.now(), dataUrl });
    if (photoCache.size > 400) photoCache.delete(photoCache.keys().next().value as string);
  }

  const match = typeof dataUrl === "string" ? dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/) : null;
  if (!match) return null;

  return { contentType: match[1], bytes: Buffer.from(match[2], "base64") };
}

export function catalogPhotoUrl(key: string, index = 1) {
  return `/api/catalogo/foto?k=${encodeURIComponent(key)}${index > 1 ? `&n=${index}` : ""}`;
}

export type CatalogHealth =
  | {
      online: true;
      latencyMs: number;
      stockDate: string | null;
      products: number;
      featured: number;
      productNames: string[];
      lowStock: string[];
      outOfStock: string[];
    }
  | { online: false; latencyMs: number; error: string };

// Checagem ao vivo (sem cache) usada pela Central de Comando.
export async function checkCatalogHealth(): Promise<CatalogHealth> {
  const startedAt = Date.now();

  try {
    const data = await callCatalog<{ estoqueData?: unknown; produtos?: RawCatalogProduct[] }>("catDados", 20_000);
    const all = data.produtos ?? [];
    // Desde a versão 22 o catDados traz também produtos chegando e sob encomenda
    const products = all.filter((product) => !product.status || product.status === "estoque");

    return {
      online: true,
      latencyMs: Date.now() - startedAt,
      stockDate: typeof data.estoqueData === "string" ? data.estoqueData : null,
      products: products.length,
      featured: products.filter((product) => product.destaque === true).length,
      productNames: products.map((product) => String(product.nome)),
      lowStock: products
        .filter((product) => toNumber(product.fardos) > 0 && toNumber(product.fardos) <= 50)
        .map((product) => String(product.nome)),
      outOfStock: products.filter((product) => toNumber(product.fardos) <= 0).map((product) => String(product.nome)),
    };
  } catch (error) {
    return { online: false, latencyMs: Date.now() - startedAt, error: error instanceof Error ? error.message : "erro" };
  }
}
