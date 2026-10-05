import { createClient } from "@supabase/supabase-js";
import { catalogPhotoUrl, getCatalogSnapshot } from "@/lib/catalog-api";

export type FeaturedProduct = {
  key: string;
  name: string;
  image: string;
  badge: string | null;
  stockLine: string | null;
  priceLine: string | null;
};

const text = {
  pt: {
    newBadge: "Novidade",
    lastBales: (bales: number) => `Últimos ${bales} fardos`,
    stock: (pieces: number, bales: number) => `${pieces} pç/fardo · ${bales.toLocaleString("pt-BR")} fardos`,
    price: (price: string) => `Sugerido ${price}/peça`,
  },
  zh: {
    newBadge: "新品",
    lastBales: (bales: number) => `仅剩 ${bales} 包`,
    stock: (pieces: number, bales: number) => `每包 ${pieces} 件 · ${bales.toLocaleString("pt-BR")} 包`,
    price: (price: string) => `建议价 ${price}/件`,
  },
};

// Destaques da vitrine = produtos marcados como destaque no catálogo de pedidos.
// Se o catálogo estiver fora do ar ou sem destaques, usa os produtos publicados no CMS.
export async function getFeaturedProducts(locale: "pt" | "zh"): Promise<FeaturedProduct[]> {
  const labels = text[locale];
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const snapshot = await getCatalogSnapshot();

  const fromCatalog = (snapshot?.items ?? [])
    .filter((item) => item.isFeatured && item.balesAvailable > 0)
    .map((item) => ({
      key: item.key,
      name: item.name,
      image: item.photoCount > 0 ? catalogPhotoUrl(item.key) : "/images/produto-1.jpeg",
      badge: item.balesAvailable <= 50 ? labels.lastBales(item.balesAvailable) : item.isNew ? labels.newBadge : null,
      stockLine: labels.stock(item.piecesPerBale, item.balesAvailable),
      priceLine: item.suggestedPrice > 0 ? labels.price(money.format(item.suggestedPrice)) : null,
    }));

  if (fromCatalog.length > 0) return fromCatalog;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data } = await supabase
    .from("products")
    .select("id, name, name_zh, main_image_url, featured")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(12);

  return (data ?? [])
    .filter((product) => product.name && product.main_image_url)
    .map((product) => ({
      key: product.id,
      name: locale === "zh" ? product.name_zh || product.name : product.name,
      image: product.main_image_url,
      badge: null,
      stockLine: null,
      priceLine: null,
    }));
}
