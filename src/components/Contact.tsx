import { Mail, MessageCircle, PhoneCall } from "lucide-react";
import ContactLeadForm from "@/components/ContactLeadForm";
import type { SiteLocale } from "@/components/HomePage";
import type { ContactContent } from "@/types/content";
import type { SiteSettings } from "@/types/site-settings";

type ContactProps = {
  settings: SiteSettings;
  content: ContactContent;
  locale?: SiteLocale;
};

const text = {
  pt: {
    eyebrow: "Contato comercial",
    title: "Vamos estruturar sua próxima compra internacional.",
    subtitle:
      "Entre em contato para discutir produtos, volumes, destino, documentação, prazos e condições comerciais.",
    whatsapp: "WhatsApp",
    emailDescription: "Envie detalhes da sua demanda para uma proposta direcionada.",
  },
  zh: {
    eyebrow: "商务联系",
    title: "让我们一起规划您的国际采购",
    subtitle:
      "请联系我们，讨论产品、数量、目的地、文件、交期和商业条件。",
    whatsapp: "商务 WhatsApp",
    emailDescription: "请发送您的需求详情，我们将为您准备更精准的商业方案。",
  },
};

export default function Contact({ settings, content, locale = "pt" }: ContactProps) {
  const email = content.email || settings.email;
  const whatsappUrl = content.whatsapp || settings.whatsapp_url;
  const emailHref = `mailto:${email}`;
  const location = [content.address, content.city, content.state, content.country].filter(Boolean).join(" | ");
  const labels = text[locale];

  return (
    <section id="contato" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
      <div className="mx-auto grid w-full max-w-[22rem] gap-4 sm:max-w-7xl sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="rounded-[1.25rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_85px_rgba(31,41,55,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:rounded-[2.2rem] sm:p-10 lg:p-12">
          <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/25 bg-[#d6b46a]/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#9b7a3e] sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
            {labels.eyebrow}
          </p>
          <h2 className="text-balance text-[1.8rem] font-semibold leading-[1.08] tracking-[-0.03em] text-[#111] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
            {labels.title}
          </h2>
          <p className="mt-5 max-w-2xl text-[0.94rem] leading-7 text-neutral-600 sm:mt-7 sm:text-[0.98rem] sm:leading-8">
            {labels.subtitle}
          </p>
          <ContactLeadForm locale={locale} />
        </div>

        <div className="grid gap-4">
          <a href={whatsappUrl} className="group h-full rounded-[1.2rem] border border-white/75 bg-[#111] p-4 text-white shadow-[0_24px_85px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-2 hover:bg-[#25d366] sm:rounded-[1.7rem] sm:p-7">
            <MessageCircle className="mb-5 text-[#25d366] transition duration-300 group-hover:text-white sm:mb-8" size={26} />
            <h3 className="text-[1.3rem] font-semibold tracking-[-0.03em] sm:text-2xl">{labels.whatsapp}</h3>
            <p className="mt-3 text-sm leading-6 opacity-70">{content.business_hours}</p>
          </a>

          <a href={emailHref} className="group h-full rounded-[1.2rem] border border-white/75 bg-white/72 p-4 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#d6b46a]/45 hover:bg-white sm:rounded-[1.7rem] sm:p-7">
            <Mail className="mb-5 text-[#9b7a3e] sm:mb-8" size={26} />
            <h3 className="break-words text-[1rem] font-semibold leading-snug tracking-[-0.02em] text-[#141414] [overflow-wrap:anywhere] sm:text-2xl sm:tracking-[-0.03em]">{email}</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{labels.emailDescription}</p>
          </a>

          <div className="h-full rounded-[1.2rem] border border-white/75 bg-white/50 p-4 shadow-[0_18px_55px_rgba(31,41,55,0.07)] backdrop-blur-xl sm:rounded-[1.7rem] sm:p-7">
            <PhoneCall className="mb-5 text-[#9b7a3e] sm:mb-8" size={26} />
            <h3 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#141414] sm:text-2xl">{content.phone}</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{location}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
