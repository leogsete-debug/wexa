import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import PdfCatalog from "@/components/PdfCatalog";
import ExportProcess from "@/components/ExportProcess";
import Markets from "@/components/Markets";
import Gallery from "@/components/Gallery";
import CatalogCTA from "@/components/CatalogCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import { getLatestPublishedCatalog, resolveCatalogPdfUrl } from "@/lib/catalogs";
import {
  getPublicCompanyContent,
  getPublicContactContent,
  getPublicFooterContent,
  getPublicMarkets,
  getPublicProcessSteps,
} from "@/lib/content";
import { getPublicSiteSettings } from "@/lib/site-settings";
import type { SiteSettings } from "@/types/site-settings";

export type SiteLocale = "pt" | "zh";

type HomePageProps = {
  locale?: SiteLocale;
};

function localizeSettings(settings: SiteSettings, locale: SiteLocale): SiteSettings {
  if (locale !== "zh") {
    return settings;
  }

  return {
    ...settings,
    company_name: settings.company_name_zh || "TopMax Export",
    hero_badge: settings.hero_badge_zh || "巴西出口专家",
    hero_title: settings.hero_title_zh || "连接巴西优质产品与全球市场",
    hero_subtitle:
      settings.hero_subtitle_zh ||
      "高端数字展示平台，用于展示产品、加强商务谈判，并连接全球买家。",
    hero_primary_button_text: settings.hero_primary_button_text_zh || "申请报价",
    hero_secondary_button_text: settings.hero_secondary_button_text_zh || "查看产品",
    catalog_title: settings.catalog_title_zh || "产品目录",
    catalog_subtitle:
      settings.catalog_subtitle_zh || "下载完整产品目录，查看产品、规格和商业信息。",
  };
}

export default async function HomePage({ locale = "pt" }: HomePageProps) {
  const [
    settings,
    latestCatalog,
    companyContent,
    markets,
    processSteps,
    contactContent,
    footerContent,
  ] = await Promise.all([
    getPublicSiteSettings(),
    getLatestPublishedCatalog(),
    getPublicCompanyContent(),
    getPublicMarkets(),
    getPublicProcessSteps(),
    getPublicContactContent(),
    getPublicFooterContent(),
  ]);

  const translatedSettings = localizeSettings(settings, locale);
  const catalogPdfUrl = resolveCatalogPdfUrl(latestCatalog?.pdf_url, settings.catalog_pdf_url);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(214,180,106,0.14),_transparent_32rem),linear-gradient(180deg,_#fbfaf7_0%,_#f4f1eb_48%,_#ffffff_100%)] text-[#161616] selection:bg-[#d7b46a]/30">
      <SiteHeader settings={translatedSettings} locale={locale} />
      <Hero settings={translatedSettings} locale={locale} />
      <About content={companyContent} locale={locale} />
      <Products whatsappUrl={settings.whatsapp_url} locale={locale} />
      <PdfCatalog settings={translatedSettings} catalogPdfUrl={catalogPdfUrl} locale={locale} />
      <ExportProcess steps={processSteps} locale={locale} />
      <Markets markets={markets} locale={locale} />
      <Gallery locale={locale} />
      <CatalogCTA settings={translatedSettings} catalogPdfUrl={catalogPdfUrl} locale={locale} />
      <Contact settings={translatedSettings} content={contactContent} locale={locale} />
      <Footer content={footerContent} locale={locale} />
      <WhatsappButton settings={settings} locale={locale} />
    </main>
  );
}
