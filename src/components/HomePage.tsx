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

export default async function HomePage() {
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

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(214,180,106,0.14),_transparent_32rem),linear-gradient(180deg,_#fbfaf7_0%,_#f4f1eb_48%,_#ffffff_100%)] text-[#161616] selection:bg-[#d7b46a]/30">
      <SiteHeader settings={settings} />
      <Hero settings={settings} />
      <About content={companyContent} />
      <Products whatsappUrl={settings.whatsapp_url} />
      <PdfCatalog settings={settings} catalogPdfUrl={latestCatalog?.pdf_url} />
      <ExportProcess steps={processSteps} />
      <Markets markets={markets} />
      <Gallery />
      <CatalogCTA settings={settings} />
      <Contact settings={settings} content={contactContent} />
      <Footer content={footerContent} />
      <WhatsappButton settings={settings} />
    </main>
  );
}
