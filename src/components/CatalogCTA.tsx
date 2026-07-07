import { Mail, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/types/site-settings";

type CatalogCTAProps = {
  settings: SiteSettings;
};

export default function CatalogCTA({ settings }: CatalogCTAProps) {
  const emailHref = `mailto:${settings.email}`;

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-[#111] px-5 py-11 text-white shadow-[0_34px_110px_rgba(0,0,0,0.24)] sm:rounded-[2.5rem] sm:px-10 sm:py-16 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(214,180,106,0.28),transparent_28rem),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_34%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#f0d89a] sm:text-[0.72rem] sm:tracking-[0.3em]">
              Solicitar catálogo
            </p>
            <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
              Receba uma seleção de produtos para sua operação.
            </h2>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-white/66 sm:mt-6 sm:leading-8">
              Fale com a TopMax Export e solicite um catálogo comercial alinhado ao seu mercado, volume e perfil de compra.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:w-[13rem] lg:flex-col">
            <a href={settings.whatsapp_url} className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full bg-[#d6b46a] px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#111] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d89a] hover:shadow-[0_24px_60px_rgba(214,180,106,0.32)] sm:px-7 sm:text-xs sm:tracking-[0.18em]">
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a href={emailHref} className="inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full border border-white/18 bg-white/10 px-5 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#111] sm:px-7 sm:text-xs sm:tracking-[0.18em]">
              <Mail size={18} />
              Enviar e-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
