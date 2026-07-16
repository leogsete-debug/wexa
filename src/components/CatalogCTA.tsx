import { Download, MessageCircle } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import TrackedWhatsappLink from "@/components/TrackedWhatsappLink";
import TrackedCatalogDownloadLink from "@/components/TrackedCatalogDownloadLink";
import { normalizeCatalogPdfUrl } from "@/lib/catalogs";
import { sectionText } from "@/lib/site-content";
import type { SiteSection } from "@/types/content";
import type { SiteSettings } from "@/types/site-settings";

type CatalogCTAProps = {
  settings: SiteSettings;
  catalogPdfUrl?: string | null;
  locale?: SiteLocale;
  section?: SiteSection;
};

const text = {
  pt: {
    eyebrow: "SOLUCOES DE IMPORTACAO",
    title: "Encontre produtos e fornecedores para sua operacao.",
    description:
      "Conte o que sua empresa procura. Nossa equipe apresentara solucoes de importacao adequadas ao seu mercado, volume e objetivo comercial.",
    whatsapp: "Falar com a Top Max",
    email: "Baixar catalogo",
  },
  zh: {
    eyebrow: "进口解决方案",
    title: "为您的业务寻找合适的产品与供应商",
    description: "告诉我们您的采购需求，我们将根据市场、数量和商业目标提供合适的进口解决方案。",
    whatsapp: "联系 Top Max",
    email: "下载产品目录",
  },
};

export default function CatalogCTA({ settings, catalogPdfUrl, locale = "pt", section }: CatalogCTAProps) {
  const pdfUrl = normalizeCatalogPdfUrl(catalogPdfUrl);
  const fallbackLabels = text[locale];
  const labels = {
    eyebrow: sectionText(section, "eyebrow", locale, fallbackLabels.eyebrow),
    title: sectionText(section, "title", locale, fallbackLabels.title),
    description: sectionText(section, "description", locale, fallbackLabels.description),
    whatsapp: sectionText(section, "primary_button", locale, fallbackLabels.whatsapp),
  };
  const downloadLabel = sectionText(section, "secondary_button", locale, fallbackLabels.email);
  const unavailableLabel = locale === "zh" ? "产品目录暂不可用" : "Catálogo ainda não disponível";

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-[#111] px-5 py-11 text-white shadow-[0_34px_110px_rgba(0,0,0,0.24)] sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(214,180,106,0.28),transparent_28rem),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_34%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#f0d89a] sm:text-[0.72rem] sm:tracking-[0.3em]">
              {labels.eyebrow}
            </p>
            <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
              {labels.title}
            </h2>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-white/66 sm:mt-6 sm:leading-8">
              {labels.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:w-[13rem] lg:flex-col">
            <TrackedWhatsappLink href={settings.whatsapp_url} source="cta" className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full bg-[#d6b46a] px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#111] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d89a] hover:shadow-[0_24px_60px_rgba(214,180,106,0.32)] sm:px-7 sm:text-xs sm:tracking-[0.18em]">
              <MessageCircle size={18} />
              {labels.whatsapp}
            </TrackedWhatsappLink>
            {pdfUrl ? (
              <TrackedCatalogDownloadLink href={pdfUrl} className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full border border-white/18 bg-white/10 px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#111] sm:px-7 sm:text-xs sm:tracking-[0.18em]">
                <Download size={18} />
                {downloadLabel}
              </TrackedCatalogDownloadLink>
            ) : (
              <span className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full border border-white/18 bg-white/10 px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white/60 sm:px-7 sm:text-xs sm:tracking-[0.18em]">
                {unavailableLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
