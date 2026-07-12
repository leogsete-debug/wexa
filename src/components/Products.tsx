import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { SiteLocale } from "@/components/HomePage";

type PublicProduct = {
  name: string;
  category: string;
  badge: string;
  description: string;
  image: string;
};

type SupabaseProduct = {
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
    name: "Café verde especial",
    category: "Agronegócio",
    badge: "Seleção exportação",
    description: "Grãos selecionados para compradores internacionais, torrefações e distribuidores corporativos.",
    image: "/images/produto-1.jpeg",
  },
  {
    name: "Alimentos especiais brasileiros",
    category: "Exportação de alimentos",
    badge: "Alta demanda",
    description: "Produtos brasileiros com apresentação comercial pronta para mercados exigentes.",
    image: "/images/produto-2.jpeg",
  },
  {
    name: "Ingredientes naturais",
    category: "Commodities",
    badge: "Rastreável",
    description: "Insumos naturais com foco em consistência, rastreabilidade e escala comercial.",
    image: "/images/produto-3.jpeg",
  },
  {
    name: "Suprimentos industriais",
    category: "Soluções corporativas",
    badge: "Fornecimento seguro",
    description: "Soluções para importadores que buscam fornecedores confiáveis no Brasil.",
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
    name: "Seleção para exportação",
    category: "Portfólio curado",
    badge: "Sob demanda",
    description: "Portfólio sob demanda para operações comerciais, feiras e negociações internacionais.",
    image: "/images/galeria-2.jpeg",
  },
];

const fallbackProductsZh: PublicProduct[] = [
  {
    name: "精品巴西绿咖啡",
    category: "农业商务",
    badge: "出口精选",
    description: "为国际买家、烘焙商和企业分销商精选的优质咖啡豆。",
    image: "/images/produto-1.jpeg",
  },
  {
    name: "巴西特色食品",
    category: "食品出口",
    badge: "高需求",
    description: "面向严苛市场、具备商业展示能力的巴西产品。",
    image: "/images/produto-2.jpeg",
  },
  {
    name: "天然原料",
    category: "大宗商品",
    badge: "可追溯",
    description: "注重一致性、可追溯性和商业规模的天然原料。",
    image: "/images/produto-3.jpeg",
  },
  {
    name: "工业供应品",
    category: "企业解决方案",
    badge: "稳定供应",
    description: "为寻求巴西可靠供应商的进口商提供解决方案。",
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
    name: "出口产品精选",
    category: "精选组合",
    badge: "按需供应",
    description: "面向商务运营、展会和国际谈判的按需产品组合。",
    image: "/images/galeria-2.jpeg",
  },
];

const text = {
  pt: {
    eyebrow: "Catálogo de alto padrão",
    title: "Produtos preparados para negociações internacionais.",
    description:
      "Uma seleção comercial para compradores, distribuidores e importadores que exigem qualidade, apresentação e segurança no fornecimento.",
    button: "Solicitar cotação",
    product: "Produto",
    featured: "Destaque",
    published: "Publicado",
    fallbackDescription: "Produto disponível para negociações internacionais.",
  },
  zh: {
    eyebrow: "高端产品目录",
    title: "为国际商务洽谈准备的产品",
    description:
      "面向采购商、分销商和进口商的商业精选，注重质量、展示效果和供应安全。",
    button: "申请报价",
    product: "产品",
    featured: "重点推荐",
    published: "已发布",
    fallbackDescription: "该产品可用于国际商务洽谈和出口合作。",
  },
};

function mapSupabaseProduct(product: SupabaseProduct, locale: SiteLocale): PublicProduct | null {
  if (!product.name) {
    return null;
  }

  const labels = text[locale];

  return {
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
};

export default async function Products({ whatsappUrl, locale = "pt" }: ProductsProps) {
  const labels = text[locale];
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
                <a
                  href={whatsappUrl}
                  className="mt-6 inline-flex w-full justify-center rounded-full bg-[#111] px-5 py-3.5 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)] sm:mt-8 sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.18em] md:mt-auto md:self-start"
                >
                  {labels.button}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
