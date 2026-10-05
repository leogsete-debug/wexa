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
};

const dataTtlMs = 5 * 60 * 1000;
const photosTtlMs = 30 * 60 * 1000;

let dataCache: { at: number; value: CatalogSnapshot } | null = null;
let photosCache: { at: number; value: Record<string, string> } | null = null;
let photosRequest: Promise<Record<string, string>> | null = null;

async function callCatalog<T>(fn: string, timeoutMs: number): Promise<T> {
  const response = await fetch(CATALOG_API_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ fn, args: [] }),
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

async function getAllPhotos(): Promise<Record<string, string>> {
  if (photosCache && Date.now() - photosCache.at < photosTtlMs) {
    return photosCache.value;
  }

  // Todas as fotos vêm numa resposta só (~13 MB); evita buscar em paralelo.
  photosRequest ??= callCatalog<Record<string, string>>("catFotos", 45_000)
    .then((value) => {
      photosCache = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      photosRequest = null;
    });

  try {
    return await photosRequest;
  } catch (error) {
    console.error("[catalog-api] catFotos falhou:", error instanceof Error ? error.message : error);
    return photosCache?.value ?? {};
  }
}

export async function getCatalogPhoto(key: string, index = 1) {
  const photos = await getAllPhotos();
  const dataUrl = photos[index > 1 ? `${key}#${index}` : key];
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
      lowStock: string[];
      outOfStock: string[];
    }
  | { online: false; latencyMs: number; error: string };

// Checagem ao vivo (sem cache) usada pela Central de Comando.
export async function checkCatalogHealth(): Promise<CatalogHealth> {
  const startedAt = Date.now();

  try {
    const data = await callCatalog<{ estoqueData?: unknown; produtos?: RawCatalogProduct[] }>("catDados", 20_000);
    const products = data.produtos ?? [];

    return {
      online: true,
      latencyMs: Date.now() - startedAt,
      stockDate: typeof data.estoqueData === "string" ? data.estoqueData : null,
      products: products.length,
      featured: products.filter((product) => product.destaque === true).length,
      lowStock: products
        .filter((product) => toNumber(product.fardos) > 0 && toNumber(product.fardos) <= 50)
        .map((product) => String(product.nome)),
      outOfStock: products.filter((product) => toNumber(product.fardos) <= 0).map((product) => String(product.nome)),
    };
  } catch (error) {
    return { online: false, latencyMs: Date.now() - startedAt, error: error instanceof Error ? error.message : "erro" };
  }
}
