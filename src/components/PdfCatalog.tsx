import { Download, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types/site-settings";

type PdfCatalogProps = {
  settings: SiteSettings;
  catalogPdfUrl?: string | null;
};

export default function PdfCatalog({ settings, catalogPdfUrl }: PdfCatalogProps) {
  const pdfUrl = catalogPdfUrl || settings.catalog_pdf_url;

  return (
    <section id="catalogo" className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/76 px-5 py-10 shadow-[0_28px_95px_rgba(31,41,55,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:rounded-[2.5rem] sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(214,180,106,0.2),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.6),transparent_42%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/25 bg-[#d6b46a]/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#9b7a3e] sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
                Catálogo
              </p>
              <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[#111] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
                {settings.catalog_title}
              </h2>
              <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-neutral-600 sm:mt-6 sm:leading-8">
                {settings.catalog_subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:w-[19rem] lg:flex-col">
              <a
                href={pdfUrl}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full bg-[#111] px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_24px_60px_rgba(214,180,106,0.32)] sm:px-7 sm:text-xs sm:tracking-[0.18em]"
              >
                <Download size={18} />
                Baixar Catálogo PDF
              </a>
              <a
                href={settings.whatsapp_url}
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full border border-[#25d366]/25 bg-[#25d366] px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_45px_rgba(37,211,102,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_24px_60px_rgba(37,211,102,0.34)] sm:px-7 sm:text-xs sm:tracking-[0.18em]"
              >
                <MessageCircle size={18} />
                Solicitar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
