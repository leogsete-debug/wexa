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
import AnalyticsPageView from "@/components/AnalyticsPageView";
import { getLatestPublishedCatalog, resolveCatalogPdfUrl } from "@/lib/catalogs";
import {
  getPublicCompanyContent,
  getPublicContactContent,
  getPublicFooterContent,
  getPublicMarkets,
  getPublicProcessSteps,
} from "@/lib/content";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getPublicGalleryItems, getPublicSiteSections, sectionByKey } from "@/lib/site-content";
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
    hero_badge: settings.hero_badge_zh || "全球采购与进口供应",
    hero_title: settings.hero_title_zh || "连接巴西企业与全球优质制造商",
    hero_subtitle:
      settings.hero_subtitle_zh ||
      "我们从中国、印度及其他战略市场进口产品，为巴西的分销商、批发商、零售商和大型连锁企业提供完整的供应解决方案。",
    hero_primary_button_text: settings.hero_primary_button_text_zh || "申请报价",
    hero_secondary_button_text: settings.hero_secondary_button_text_zh || "查看产品",
    catalog_title: settings.catalog_title_zh || "了解我们的进口产品组合",
    catalog_subtitle:
      settings.catalog_subtitle_zh || "下载完整目录，查看适合分销、批发、零售和大型连锁企业的产品。",
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
    siteSections,
    galleryItems,
  ] = await Promise.all([
    getPublicSiteSettings(),
    getLatestPublishedCatalog(),
    getPublicCompanyContent(),
    getPublicMarkets(),
    getPublicProcessSteps(),
    getPublicContactContent(),
    getPublicFooterContent(),
    getPublicSiteSections(),
    getPublicGalleryItems(),
  ]);

  const translatedSettings = localizeSettings(settings, locale);
  const catalogPdfUrl = resolveCatalogPdfUrl(latestCatalog?.pdf_url, settings.catalog_pdf_url);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(214,180,106,0.14),_transparent_32rem),linear-gradient(180deg,_#fbfaf7_0%,_#f4f1eb_48%,_#ffffff_100%)] text-[#161616] selection:bg-[#d7b46a]/30">
      <AnalyticsPageView locale={locale} />
      <SiteHeader settings={translatedSettings} locale={locale} section={sectionByKey(siteSections, "header")} />
      <Hero settings={translatedSettings} locale={locale} section={sectionByKey(siteSections, "hero")} />
      <About content={companyContent} locale={locale} />
      <Products whatsappUrl={settings.whatsapp_url} locale={locale} section={sectionByKey(siteSections, "products")} />
      <PdfCatalog settings={translatedSettings} catalogPdfUrl={catalogPdfUrl} locale={locale} section={sectionByKey(siteSections, "catalog")} />
      <ExportProcess steps={processSteps} locale={locale} section={sectionByKey(siteSections, "process")} />
      <Markets markets={markets} locale={locale} section={sectionByKey(siteSections, "markets")} />
      <Gallery locale={locale} section={sectionByKey(siteSections, "gallery")} items={galleryItems} />
      <CatalogCTA settings={translatedSettings} catalogPdfUrl={catalogPdfUrl} locale={locale} section={sectionByKey(siteSections, "cta")} />
      <Contact settings={translatedSettings} content={contactContent} locale={locale} />
      <Footer content={footerContent} settings={translatedSettings} locale={locale} />
      <WhatsappButton settings={settings} locale={locale} section={sectionByKey(siteSections, "whatsapp")} />
    </main>
  );
}
