import { Mail, MessageCircle } from "lucide-react";

const whatsapp = "https://wa.me/5500000000000";
const email = "mailto:comercial@topmaxexport.com";

export default function CatalogCTA() {
  return (
    <section className="px-5 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#111] px-6 py-16 text-white shadow-[0_34px_110px_rgba(0,0,0,0.24)] sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(214,180,106,0.28),transparent_28rem),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_34%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-5 text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[#f0d89a]">
              Solicitar catálogo
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl">
              Receba uma seleção de produtos para sua operação.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/66">
              Fale com a TopMax Export e solicite um catálogo comercial alinhado ao seu mercado, volume e perfil de compra.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <a href={whatsapp} className="inline-flex items-center justify-center gap-3 rounded-full bg-[#d6b46a] px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#111] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d89a] hover:shadow-[0_24px_60px_rgba(214,180,106,0.32)]">
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a href={email} className="inline-flex items-center justify-center gap-3 rounded-full border border-white/18 bg-white/10 px-7 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#111]">
              <Mail size={18} />
              Enviar e-mail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
