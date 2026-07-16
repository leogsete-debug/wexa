import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { SiteLocale } from "@/components/HomePage";
import TrackedWhatsappLink from "@/components/TrackedWhatsappLink";
import { sectionText } from "@/lib/site-content";
import type { SiteSection } from "@/types/content";

type PublicProduct = {
  id?: string | null;
  name: string;
  category: string;
  badge: string;
  description: string;
  image: string;
};

type SupabaseProduct = {
  id: string;
  name: string | null;
  name_zh?: string | null;
  category: string | null;
  category_zh?: string | null;
  short_description: string | null;
  short_description_zh?: string | null;
  main_image_url: string | null;
  featured: boolean | null;
};

const fallbackProducts: PublicProduct[] = [
  {
    name: "Linha cama, mesa e banho",
    category: "Produtos texteis",
    badge: "Importacao",
    description: "Produtos texteis importados para distribuidores, atacadistas, varejistas e grandes redes.",
    image: "/images/produto-1.jpeg",
  },
  {
    name: "Roupas de cama",
    category: "Cama",
    badge: "Fornecimento em escala",
    description: "Solucoes para cama com desenvolvimento de fornecedores, padronizacao e fornecimento continuo.",
    image: "/images/produto-2.jpeg",
  },
  {
    name: "Toalhas e banho",
    category: "Banho",
    badge: "Qualidade",
    description: "Produtos para banho desenvolvidos junto a fabricantes internacionais conforme demanda do mercado brasileiro.",
    image: "/images/produto-3.jpeg",
  },
  {
    name: "Tapetes e cobertores",
    category: "Casa",
    badge: "Portfolio",
    description: "Categorias texteis selecionadas para varejo, atacado e operacoes de grande volume.",
    image: "/images/produto-4.jpeg",
  },
  {
    name: "Produtos para marca própria",
    category: "Pronto para varejo",
    badge: "Marca própria",
    description: "Produtos com potencial para marca própria, atacado e redes de distribuição.",
    image: "/images/galeria-1.jpeg",
  },
  {
    name: "Desenvolvimento sob demanda",
    category: "Fornecimento global",
    badge: "Sob demanda",
    description: "Busca, negociacao e desenvolvimento de produtos com fabricantes internacionais para o Brasil.",
    image: "/images/galeria-2.jpeg",
  },
];

const fallbackProductsZh: PublicProduct[] = [
  {
    name: "床品、桌布和浴室纺织品",
    category: "纺织产品",
    badge: "进口供应",
    description: "面向分销商、批发商、零售商和大型连锁企业的进口纺织产品。",
    image: "/images/produto-1.jpeg",
  },
  {
    name: "床上用品",
    category: "床品",
    badge: "规模化供应",
    description: "通过供应商开发、标准化和持续供货提供床上用品解决方案。",
    image: "/images/produto-2.jpeg",
  },
  {
    name: "毛巾与浴室用品",
    category: "浴室纺织",
    badge: "质量控制",
    description: "根据巴西市场需求与国际制造商共同开发的浴室用品。",
    image: "/images/produto-3.jpeg",
  },
  {
    name: "地毯与毯子",
    category: "家居用品",
    badge: "产品组合",
    description: "为零售、批发和大批量业务精选的纺织品类。",
    image: "/images/produto-4.jpeg",
  },
  {
    name: "自有品牌产品",
    category: "零售就绪",
    badge: "自有品牌",
    description: "适合自有品牌、批发和分销网络的产品。",
    image: "/images/galeria-1.jpeg",
  },
  {
    name: "按需产品开发",
    category: "全球供应",
    badge: "按需供应",
    description: "为巴西市场寻找、谈判并开发国际制造商的产品。",
    image: "/images/galeria-2.jpeg",
  },
];

const text = {
  pt: {
    eyebrow: "PORTFOLIO DE IMPORTACAO",
    title: "Produtos importados dos principais mercados mundiais.",
    description:
      "Selecionamos fabricantes internacionais para oferecer ao mercado brasileiro produtos competitivos, com qualidade, escala e fornecimento continuo.",
    button: "Solicitar cotação",
    product: "Produto",
    featured: "Destaque",
    published: "Publicado",
    fallbackDescription: "Produto importado disponivel para distribuicao, atacado, varejo e grandes redes.",
  },
  zh: {
    eyebrow: "进口产品组合",
    title: "来自全球主要市场的进口产品",
    description:
      "我们精选国际制造商，为巴西市场提供具有竞争力、质量稳定、可规模化供应的产品。",
    button: "申请报价",
    product: "产品",
    featured: "重点推荐",
    published: "已发布",
    fallbackDescription: "适合分销、批发、零售和大型连锁企业的进口产品。",
  },
};

function mapSupabaseProduct(product: SupabaseProduct, locale: SiteLocale): PublicProduct | null {
  if (!product.name) {
    return null;
  }

  const labels = text[locale];

  return {
    id: product.id,
    name: locale === "zh" ? product.name_zh || product.name : product.name,
    category: locale === "zh" ? product.category_zh || product.category || labels.product : product.category || labels.product,
    badge: product.featured ? labels.featured : labels.published,
    description:
      locale === "zh"
        ? product.short_description_zh || product.short_description || labels.fallbackDescription
        : product.short_description || labels.fallbackDescription,
    image: product.main_image_url || "/images/produto-1.jpeg",
  };
}

async function getPublishedProducts(locale: SiteLocale): Promise<PublicProduct[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
        }),
    },
  });

  try {
    const { data, error } = await publicSupabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return (data as SupabaseProduct[])
      .map((product) => mapSupabaseProduct(product, locale))
      .filter((product): product is PublicProduct => Boolean(product));
  } catch {
    return [];
  }
}

type ProductsProps = {
  whatsappUrl: string;
  locale?: SiteLocale;
  section?: SiteSection;
};

export default async function Products({ whatsappUrl, locale = "pt", section }: ProductsProps) {
  const fallbackLabels = text[locale];
  const labels = {
    ...fallbackLabels,
    eyebrow: sectionText(section, "eyebrow", locale, fallbackLabels.eyebrow),
    title: sectionText(section, "title", locale, fallbackLabels.title),
    description: sectionText(section, "description", locale, fallbackLabels.description),
    button: sectionText(section, "quote_button", locale, fallbackLabels.button),
    product: sectionText(section, "product_fallback", locale, fallbackLabels.product),
    featured: sectionText(section, "featured_badge", locale, fallbackLabels.featured),
    published: sectionText(section, "published_badge", locale, fallbackLabels.published),
    fallbackDescription: sectionText(section, "description_fallback", locale, fallbackLabels.fallbackDescription),
  };
  const publishedProducts = await getPublishedProducts(locale);
  const products = publishedProducts.length > 0 ? publishedProducts : locale === "zh" ? fallbackProductsZh : fallbackProducts;

  return (
    <section id="produtos" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/35 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end lg:gap-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/25 bg-white/70 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)] backdrop-blur-xl sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
              {labels.eyebrow}
            </p>
            <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[#111] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
              {labels.title}
            </h2>
          </div>

          <p className="max-w-xl text-[0.98rem] leading-7 text-neutral-600 lg:max-w-md lg:leading-8">
            {labels.description}
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-5 sm:mt-14 sm:gap-7 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={`${product.name}-${product.image}`}
              className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-white/75 bg-white/72 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:border-[#d6b46a]/55 hover:bg-white hover:shadow-[0_38px_105px_rgba(31,41,55,0.18)] sm:rounded-[2.15rem]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 sm:aspect-[5/4]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/10 to-transparent opacity-85 transition duration-500 group-hover:opacity-70" />
                <div className="absolute left-4 right-4 top-4 flex flex-wrap items-start justify-between gap-2 sm:left-5 sm:right-5 sm:top-5 sm:gap-3">
                  <span className="max-w-full rounded-full border border-white/25 bg-black/30 px-3 py-2 text-[0.58rem] font-bold uppercase leading-4 tracking-[0.1em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl sm:px-4 sm:text-[0.68rem] sm:tracking-[0.2em]">
                    {product.category}
                  </span>
                  <span className="max-w-full rounded-full border border-[#d6b46a]/35 bg-[#d6b46a]/90 px-3 py-2 text-[0.56rem] font-extrabold uppercase leading-4 tracking-[0.08em] text-[#111] shadow-[0_14px_35px_rgba(214,180,106,0.28)] sm:px-3.5 sm:text-[0.62rem] sm:tracking-[0.16em]">
                    {product.badge}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-8">
                <h3 className="text-[1.45rem] font-semibold leading-tight tracking-[-0.025em] text-[#141414] transition duration-300 group-hover:text-[#9b7a3e] sm:text-[1.7rem] sm:tracking-[-0.035em]">
                  {product.name}
                </h3>
                <p className="mt-4 text-[0.95rem] leading-7 text-neutral-600 sm:mt-5 sm:text-[0.98rem]">
                  {product.description}
                </p>
                <TrackedWhatsappLink
                  href={whatsappUrl}
                  source="product"
                  productId={product.id}
                  productName={product.name}
                  className="mt-6 inline-flex w-full justify-center rounded-full bg-[#111] px-5 py-3.5 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)] sm:mt-8 sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.18em] md:mt-auto md:self-start"
                >
                  {labels.button}
                </TrackedWhatsappLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
