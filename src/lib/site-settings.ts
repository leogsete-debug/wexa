import { createClient } from "@supabase/supabase-js";
import { normalizeCatalogPdfUrl } from "@/lib/catalogs";
import type { SiteSettings } from "@/types/site-settings";

export const DEFAULT_WHATSAPP_NUMBER = "5521995016888";
export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá! Encontrei a Top Max através do site e gostaria de conhecer melhor seus produtos e soluções de importação. Poderiam me ajudar?";
const WHATSAPP_URL_BASE = "https://wa.me";

export function normalizeWhatsappNumber(number?: string | null) {
  const digits = String(number ?? "").replace(/\D/g, "");
  return digits || DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsappUrl(number?: string | null, message?: string | null) {
  const normalizedNumber = normalizeWhatsappNumber(number);
  const normalizedMessage = String(message ?? DEFAULT_WHATSAPP_MESSAGE).trim() || DEFAULT_WHATSAPP_MESSAGE;

  return `${WHATSAPP_URL_BASE}/${normalizedNumber}?text=${encodeURIComponent(normalizedMessage)}`;
}

export const fallbackSiteSettings: SiteSettings = {
  whatsapp_url: buildWhatsappUrl(DEFAULT_WHATSAPP_NUMBER, DEFAULT_WHATSAPP_MESSAGE),
  whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
  email: "comercial@topmaxexport.com",
  company_name: "TopMax Export",
  company_name_zh: "TopMax Export",
  logo_url: "",
  favicon_url: "",
  show_language_selector: true,
  show_admin_button: true,
  show_quote_button: true,
  header_quote_text: "Solicitar cotacao",
  header_quote_text_zh: "申请报价",
  header_quote_url: "",
  hero_badge: "IMPORTACAO E FORNECIMENTO GLOBAL",
  hero_badge_zh: "全球采购与进口供应",
  hero_title: "Conectando o Brasil aos melhores fabricantes do mundo.",
  hero_title_zh: "连接巴西企业与全球优质制造商",
  hero_subtitle:
    "Importamos produtos da China, India e outros mercados estrategicos, oferecendo solucoes completas para distribuidores, atacadistas, varejistas e grandes redes brasileiras.",
  hero_subtitle_zh:
    "我们从中国、印度及其他战略市场进口产品，为巴西的分销商、批发商、零售商和大型连锁企业提供完整的供应解决方案。",
  hero_primary_button_text: "Solicitar cotacao",
  hero_primary_button_text_zh: "申请报价",
  hero_primary_button_url: "",
  hero_secondary_button_text: "Conhecer produtos",
  hero_secondary_button_text_zh: "查看产品",
  hero_secondary_button_url: "#produtos",
  hero_image_url: "/images/hero.jpeg",
  hero_mobile_image_url: "/images/hero.jpeg",
  show_hero_primary_button: true,
  show_hero_secondary_button: true,
  catalog_title: "Conheca nosso portfolio de produtos importados.",
  catalog_title_zh: "产品目录",
  catalog_subtitle: "Baixe o catalogo completo e encontre produtos para distribuicao, atacado, varejo e grandes redes.",
  catalog_subtitle_zh: "下载完整目录，查看适合分销、批发、零售和大型连锁企业的产品。",
  catalog_pdf_url: "",
  floating_whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
  floating_whatsapp_message: DEFAULT_WHATSAPP_MESSAGE,
  floating_whatsapp_message_zh: "您好，我想联系 TopMax Export。",
  floating_whatsapp_aria_label: "Falar com a TopMax Export pelo WhatsApp",
  floating_whatsapp_aria_label_zh: "通过 WhatsApp 联系我们",
  show_floating_whatsapp: true,
  floating_whatsapp_position: "right",
  floating_whatsapp_size: "default",
  seo_title: "Top Max | Importacao da China, India e mercados internacionais",
  seo_title_zh: "Top Max | 巴西进口与国际供应解决方案",
  seo_description:
    "A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo importacao, desenvolvimento de fornecedores, controle de qualidade e logistica global.",
  seo_description_zh:
    "Top Max 连接巴西企业与中国、印度及其他国际市场的制造商，提供进口、供应商开发、质量控制和国际物流服务。",
  seo_keywords: "importacao da China, importacao da India, empresa de importacao, trading company Brasil, fornecedores internacionais, produtos importados, importacao cama mesa e banho, importacao de produtos texteis, desenvolvimento de fornecedores, marca propria",
  seo_og_title: "",
  seo_og_description: "",
  seo_image_url: "",
  seo_canonical: "",
  seo_indexable: true,
};

export function mergeSiteSettings(settings?: Partial<SiteSettings> | null): SiteSettings {
  const merged = {
    ...fallbackSiteSettings,
    ...Object.fromEntries(
      Object.entries(settings ?? {}).filter(([, value]) => value !== null && value !== ""),
    ),
  };
  const whatsappNumber = normalizeWhatsappNumber(merged.whatsapp_number || merged.floating_whatsapp_number);
  const whatsappMessage = merged.floating_whatsapp_message || DEFAULT_WHATSAPP_MESSAGE;

  return {
    ...merged,
    whatsapp_number: whatsappNumber,
    floating_whatsapp_number: merged.floating_whatsapp_number || whatsappNumber,
    floating_whatsapp_message: whatsappMessage,
    whatsapp_url: buildWhatsappUrl(whatsappNumber, whatsappMessage),
    catalog_pdf_url: normalizeCatalogPdfUrl(merged.catalog_pdf_url) ?? "",
  };
}

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackSiteSettings;
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

  const { data, error } = await publicSupabase
    .from("site_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<SiteSettings>();

  if (error || !data) {
    return fallbackSiteSettings;
  }

  return mergeSiteSettings(data);
}
