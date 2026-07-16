import { createClient } from "@supabase/supabase-js";
import type { GalleryItem, LocalizedValue, SiteSection } from "@/types/content";

export type Locale = "pt" | "zh";

export const neutralText = "";

export const fallbackSiteSections: SiteSection[] = [
  {
    key: "header",
    title: "Header",
    enabled: true,
    content: {
      logo_url: "",
      nav: [
        { label: "Empresa", label_zh: "公司", href: "#empresa" },
        { label: "Produtos", label_zh: "产品", href: "#produtos" },
        { label: "Catalogo", label_zh: "产品目录", href: "#catalogo" },
        { label: "Galeria", label_zh: "图片库", href: "#galeria" },
        { label: "Contato", label_zh: "联系我们", href: "#contato" },
      ],
      quote_label: { pt: "Cotacao", zh: "询价" },
      quote_url: "",
      show_language_selector: true,
      show_admin_button: true,
      show_quote_button: true,
      open_menu_label: { pt: "Abrir menu", zh: "打开菜单" },
      close_menu_label: { pt: "Fechar menu", zh: "关闭菜单" },
      admin_label: { pt: "Acessar painel administrativo", zh: "访问管理面板" },
    },
  },
  {
    key: "hero",
    title: "Hero",
    enabled: true,
    content: {
      stats: [
        { value: "20+", label: "Anos de experiencia", label_zh: "行业经验", sort_order: 0 },
        { value: "35+", label: "Mercados fornecedores", label_zh: "全球供应市场", sort_order: 1 },
        { value: "500+", label: "Produtos no portfolio", label_zh: "产品组合", sort_order: 2 },
        { value: "100%", label: "Compromisso com qualidade", label_zh: "质量承诺", sort_order: 3 },
      ],
    },
  },
  {
    key: "products",
    title: "Produtos",
    enabled: true,
    content: {
      eyebrow: { pt: "PORTFOLIO DE IMPORTACAO", zh: "进口产品组合" },
      title: { pt: "Produtos importados dos principais mercados mundiais.", zh: "来自全球主要市场的进口产品" },
      description: {
        pt: "Selecionamos fabricantes internacionais para oferecer ao mercado brasileiro produtos competitivos, com qualidade, escala e fornecimento continuo.",
        zh: "我们精选国际制造商，为巴西市场提供具有竞争力、质量稳定、可规模化供应的产品。",
      },
      quote_button: { pt: "Solicitar cotacao", zh: "申请报价" },
      product_fallback: { pt: "Produto", zh: "产品" },
      featured_badge: { pt: "Destaque", zh: "重点推荐" },
      published_badge: { pt: "Publicado", zh: "已发布" },
      description_fallback: {
        pt: "Produto importado disponivel para distribuicao, atacado, varejo e grandes redes.",
        zh: "适合分销、批发、零售和大型连锁企业的进口产品。",
      },
    },
  },
  {
    key: "catalog",
    title: "Catalogo",
    enabled: true,
    content: {
      eyebrow: { pt: "CATALOGO DE PRODUTOS", zh: "产品目录" },
      download_button: { pt: "Baixar catalogo", zh: "下载产品目录" },
      whatsapp_button: { pt: "Solicitar cotacao", zh: "申请报价" },
      unavailable: { pt: "Catalogo ainda nao disponivel", zh: "产品目录暂不可用" },
    },
  },
  {
    key: "process",
    title: "Processo",
    enabled: true,
    content: {
      eyebrow: { pt: "PROCESSO DE IMPORTACAO", zh: "进口流程" },
      title: { pt: "Da fabrica internacional ate sua empresa.", zh: "从国际工厂到您的企业" },
      subtitle: { pt: "Acompanhamos cada etapa para garantir seguranca, qualidade e previsibilidade na operacao.", zh: "我们跟进每个环节，确保进口业务的安全、质量和可控性。" },
    },
  },
  {
    key: "markets",
    title: "Mercados",
    enabled: true,
    content: {
      eyebrow: { pt: "FORNECIMENTO INTERNACIONAL", zh: "全球供应网络" },
      title: { pt: "Conectados aos principais polos industriais do mundo.", zh: "连接世界主要制造与供应中心" },
      description: {
        pt: "Desenvolvemos fornecedores em mercados estrategicos para oferecer qualidade, variedade e competitividade ao Brasil.",
        zh: "我们在战略市场开发供应商，为巴西客户提供质量、产品多样性和竞争力。",
      },
      card_text: {
        pt: "Origem fornecedora, desenvolvimento comercial e suporte para importacao ao Brasil.",
        zh: "供应来源、商务开发以及进入巴西市场的进口支持。",
      },
    },
  },
  {
    key: "gallery",
    title: "Galeria",
    enabled: true,
    content: {
      eyebrow: { pt: "OPERACAO INTERNACIONAL", zh: "国际业务" },
      title: { pt: "Produtos, producao e logistica em uma operacao integrada.", zh: "产品、生产与物流的一体化运营" },
      description: {
        pt: "Uma visao da nossa atuacao junto a fabricantes internacionais e ao mercado brasileiro.",
        zh: "展示我们与国际制造商及巴西市场之间的完整业务流程。",
      },
      alt: { pt: "Galeria TopMax Export", zh: "TopMax Export 产品展示" },
    },
  },
  {
    key: "cta",
    title: "CTA",
    enabled: true,
    content: {
      eyebrow: { pt: "SOLUCOES DE IMPORTACAO", zh: "进口解决方案" },
      title: { pt: "Encontre produtos e fornecedores para sua operacao.", zh: "为您的业务寻找合适的产品与供应商" },
      description: {
        pt: "Conte o que sua empresa procura. Nossa equipe apresentara solucoes de importacao adequadas ao seu mercado, volume e objetivo comercial.",
        zh: "告诉我们您的采购需求，我们将根据市场、数量和商业目标提供合适的进口解决方案。",
      },
      primary_button: { pt: "Falar com a Top Max", zh: "联系 Top Max" },
      secondary_button: { pt: "Baixar catalogo", zh: "下载产品目录" },
      unavailable: { pt: "Catalogo ainda nao disponivel", zh: "产品目录暂不可用" },
      background_image_url: "",
    },
  },
  {
    key: "lead_form",
    title: "Formulario de lead",
    enabled: true,
    content: {
      name: { pt: "Nome", zh: "姓名" },
      company: { pt: "Empresa", zh: "公司" },
      email: { pt: "Email", zh: "电子邮箱" },
      phone: { pt: "Telefone", zh: "电话" },
      country: { pt: "Cidade/Estado", zh: "城市/地区" },
      city: { pt: "Cidade/Estado", zh: "城市/地区" },
      product: { pt: "Produto procurado", zh: "采购产品" },
      message: { pt: "Mensagem", zh: "留言" },
      send: { pt: "Enviar mensagem", zh: "发送信息" },
      sending: { pt: "Enviando...", zh: "发送中..." },
      required: { pt: "Informe nome e email para enviar sua mensagem.", zh: "请填写姓名和电子邮箱后再发送信息。" },
      success: { pt: "Mensagem enviada com sucesso.", zh: "信息发送成功。" },
      error: { pt: "Nao foi possivel enviar agora. Tente novamente em instantes.", zh: "无法发送信息。请稍后再试。" },
    },
  },
  {
    key: "whatsapp",
    title: "WhatsApp flutuante",
    enabled: true,
    content: {
      message: { pt: "Ola, gostaria de falar com a TopMax Export.", zh: "您好，我想联系 TopMax Export。" },
      aria_label: { pt: "Falar com a TopMax Export pelo WhatsApp", zh: "通过 WhatsApp 联系我们" },
      position: "right",
      size: "default",
    },
  },
  {
    key: "seo",
    title: "SEO",
    enabled: true,
    content: {
      title: { pt: "Top Max | Importacao da China, India e mercados internacionais", zh: "Top Max | 巴西进口与国际供应解决方案" },
      description: {
        pt: "A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo importacao, desenvolvimento de fornecedores, controle de qualidade e logistica global.",
        zh: "Top Max 连接巴西企业与中国、印度及其他国际市场的制造商，提供进口、供应商开发、质量控制和国际物流服务。",
      },
      keywords: "importacao da China, importacao da India, empresa de importacao, trading company Brasil, fornecedores internacionais, produtos importados",
      og_image_url: "",
      canonical: "",
      indexable: true,
    },
  },
];

export const fallbackGalleryItems: GalleryItem[] = [
  { id: "gallery-1", title: null, caption: null, alt_text: null, image_url: "/images/galeria-1.jpeg", sort_order: 0, published: true, featured: true, created_at: "", updated_at: "" },
  { id: "gallery-2", title: null, caption: null, alt_text: null, image_url: "/images/galeria-2.jpeg", sort_order: 1, published: true, featured: false, created_at: "", updated_at: "" },
  { id: "gallery-3", title: null, caption: null, alt_text: null, image_url: "/images/galeria-3.jpeg", sort_order: 2, published: true, featured: false, created_at: "", updated_at: "" },
  { id: "gallery-4", title: null, caption: null, alt_text: null, image_url: "/images/galeria-4.jpeg", sort_order: 3, published: true, featured: false, created_at: "", updated_at: "" },
];

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export function mergeSections(rows?: SiteSection[] | null) {
  const byKey = new Map(fallbackSiteSections.map((section) => [section.key, section]));

  for (const row of rows ?? []) {
    const fallback = byKey.get(row.key);
    byKey.set(row.key, {
      ...fallback,
      ...row,
      enabled: row.enabled ?? fallback?.enabled ?? true,
      content: { ...(fallback?.content ?? {}), ...(row.content ?? {}) },
    });
  }

  return Array.from(byKey.values());
}

export function sectionByKey(sections: SiteSection[], key: string) {
  return sections.find((section) => section.key === key) ?? fallbackSiteSections.find((section) => section.key === key);
}

export function localized(value: unknown, locale: Locale, fallback = neutralText) {
  if (typeof value === "string") return value || fallback;
  if (value && typeof value === "object") {
    const localizedValue = value as Extract<LocalizedValue, object>;
    const pt = localizedValue.pt?.trim();
    const zh = localizedValue.zh?.trim();
    if (locale === "zh") return zh || pt || fallback;
    return pt || zh || fallback;
  }
  return fallback;
}

export function sectionText(section: SiteSection | undefined, key: string, locale: Locale, fallback = neutralText) {
  return localized(section?.content?.[key], locale, fallback);
}

export function sectionString(section: SiteSection | undefined, key: string, fallback = neutralText) {
  const value = section?.content?.[key];
  return typeof value === "string" ? value : fallback;
}

export function sectionBoolean(section: SiteSection | undefined, key: string, fallback = false) {
  const value = section?.content?.[key];
  return typeof value === "boolean" ? value : fallback;
}

export function sectionArray<T>(section: SiteSection | undefined, key: string, fallback: T[] = []) {
  const value = section?.content?.[key];
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export async function getPublicSiteSections() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackSiteSections;

  const { data, error } = await supabase.from("site_sections").select("*").order("key", { ascending: true });
  return error || !data ? fallbackSiteSections : mergeSections(data as SiteSection[]);
}

export async function getPublicGalleryItems() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackGalleryItems;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return error || !data || data.length === 0 ? fallbackGalleryItems : (data as GalleryItem[]);
}
