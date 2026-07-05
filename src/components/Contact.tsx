import { Mail, MessageCircle, PhoneCall } from "lucide-react";

const whatsapp = "https://wa.me/5500000000000";
const email = "mailto:comercial@topmaxexport.com";

export default function Contact() {
  return (
    <section id="contato" className="relative px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="rounded-[2.2rem] border border-white/75 bg-white/72 p-8 shadow-[0_24px_85px_rgba(31,41,55,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-10 lg:p-12">
          <p className="mb-5 inline-flex rounded-full border border-[#d6b46a]/25 bg-[#d6b46a]/10 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[#9b7a3e]">
            Contato comercial
          </p>
          <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">
            Vamos estruturar sua próxima compra internacional.
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-600">
            Entre em contato para discutir produtos, volumes, destino, documentação, prazos e condições comerciais.
          </p>
        </div>

        <div className="grid gap-4">
          <a href={whatsapp} className="group rounded-[1.7rem] border border-white/75 bg-[#111] p-7 text-white shadow-[0_24px_85px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-2 hover:bg-[#25d366]">
            <MessageCircle className="mb-8 text-[#25d366] transition duration-300 group-hover:text-white" size={28} />
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">WhatsApp</h3>
            <p className="mt-3 text-sm leading-6 opacity-70">Atendimento rápido para cotações e alinhamento comercial.</p>
          </a>

          <a href={email} className="group rounded-[1.7rem] border border-white/75 bg-white/72 p-7 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#d6b46a]/45 hover:bg-white">
            <Mail className="mb-8 text-[#9b7a3e]" size={28} />
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#141414]">comercial@topmaxexport.com</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Envie detalhes da sua demanda para uma proposta direcionada.</p>
          </a>

          <div className="rounded-[1.7rem] border border-white/75 bg-white/50 p-7 shadow-[0_18px_55px_rgba(31,41,55,0.07)] backdrop-blur-xl">
            <PhoneCall className="mb-8 text-[#9b7a3e]" size={28} />
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#141414]">Comercial internacional</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Consultoria para compradores corporativos, distribuidores e importadores.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
