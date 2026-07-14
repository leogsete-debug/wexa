import { createClient } from "@supabase/supabase-js";
import { normalizeCatalogPdfUrl } from "@/lib/catalogs";
import type { SiteSettings } from "@/types/site-settings";

export const fallbackSiteSettings: SiteSettings = {
  whatsapp_url: "https://wa.me/5500000000000",
  whatsapp_number: "+55 00 00000-0000",
  email: "comercial@topmaxexport.com",
  company_name: "TopMax Export",
  hero_badge: "Vitrine internacional de exportação",
  hero_title: "Conectando a excelência brasileira ao mercado global",
  hero_subtitle:
    "Uma vitrine digital de alto padrão para apresentar produtos, fortalecer negociações e conectar compradores ao mercado internacional.",
  hero_primary_button_text: "Solicitar cotação",
  hero_primary_button_url: "https://wa.me/5500000000000",
  hero_secondary_button_text: "Ver produtos",
  hero_secondary_button_url: "#produtos",
  hero_image_url: "/images/hero.jpeg",
  hero_mobile_image_url: "/images/hero.jpeg",
  show_hero_primary_button: true,
  show_hero_secondary_button: true,
  catalog_title: "Catálogo Completo",
  catalog_subtitle: "Baixe nosso catálogo completo com produtos, especificações e preços.",
  catalog_pdf_url: "",
};

export function mergeSiteSettings(settings?: Partial<SiteSettings> | null): SiteSettings {
  const merged = {
    ...fallbackSiteSettings,
    ...Object.fromEntries(
      Object.entries(settings ?? {}).filter(([, value]) => value !== null && value !== ""),
    ),
  };

  return {
    ...merged,
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
