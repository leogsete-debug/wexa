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
import { getLatestPublishedCatalog } from "@/lib/catalogs";
import {
  getPublicCompanyContent,
  getPublicContactContent,
  getPublicFooterContent,
  getPublicMarkets,
  getPublicProcessSteps,
} from "@/lib/content";
import { getPublicSiteSettings } from "@/lib/site-settings";

type HomePageProps = {
  locale?: "pt" | "zh";
};

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

  const isZh = locale === "zh";

  const translatedSettings = isZh
    ? {
        ...settings,
        hero_badge: "巴西出口专家",
        hero_title: "连接巴西优质产品与全球市场",
        hero_subtitle:
          "高端数字展示平台，用于展示产品、加强商务谈判，并连接全球买家。",
        hero_primary_button_text: "申请报价",
        hero_secondary_button_text: "查看产品",
        catalog_title: "产品目录",
        catalog_subtitle: "下载完整产品目录，查看产品、规格和商业信息。",
      }
    : settings;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(214,180,106,0.14),_transparent_32rem),linear-gradient(180deg,_#fbfaf7_0%,_#f4f1eb_48%,_#ffffff_100%)] text-[#161616] selection:bg-[#d7b46a]/30">
      <SiteHeader settings={translatedSettings} />
      <Hero settings={translatedSettings} />
      <About content={companyContent} />
      <Products whatsappUrl={settings.whatsapp_url} />
      <PdfCatalog settings={translatedSettings} catalogPdfUrl={latestCatalog?.pdf_url} />
      <ExportProcess steps={processSteps} />
      <Markets markets={markets} />
      <Gallery />
      <CatalogCTA settings={translatedSettings} />
      <Contact settings={translatedSettings} content={contactContent} />
      <Footer content={footerContent} />
      <WhatsappButton settings={settings} />
    </main>
  );
}