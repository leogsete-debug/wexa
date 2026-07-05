import { Download, MessageCircle } from "lucide-react";

const whatsapp = "https://wa.me/5500000000000";

// Coloque o arquivo do catálogo em: public/catalogo.pdf
const catalogPdf = "/catalogo.pdf";

export default function PdfCatalog() {
  return (
    <section id="catalogo" className="relative px-5 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/75 bg-white/76 px-6 py-14 shadow-[0_28px_95px_rgba(31,41,55,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(214,180,106,0.2),transparent_26rem),linear-gradient(135deg,rgba(255,255,255,0.6),transparent_42%)]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full border border-[#d6b46a]/25 bg-[#d6b46a]/10 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[#9b7a3e]">
                Catálogo
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">
                Catálogo Completo
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600">
                Baixe nosso catálogo completo com produtos, especificações e preços.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <a
                href={catalogPdf}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#111] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_24px_60px_rgba(214,180,106,0.32)]"
              >
                <Download size={18} />
                Baixar Catálogo PDF
              </a>
              <a
                href={whatsapp}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[#25d366]/25 bg-[#25d366] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_18px_45px_rgba(37,211,102,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#1ebe5d] hover:shadow-[0_24px_60px_rgba(37,211,102,0.34)]"
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
