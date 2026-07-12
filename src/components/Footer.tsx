import { Globe2, Link, Mail, MessageCircle, Send } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import type { FooterContent } from "@/types/content";

type FooterProps = {
  content: FooterContent;
  locale?: SiteLocale;
};

const companyLinks = {
  pt: [
    { label: "Empresa", href: "#empresa" },
    { label: "Produtos", href: "#produtos" },
    { label: "Catálogo", href: "#catalogo" },
    { label: "Galeria", href: "#galeria" },
    { label: "Contato", href: "#contato" },
  ],
  zh: [
    { label: "公司", href: "#empresa" },
    { label: "产品", href: "#produtos" },
    { label: "产品目录", href: "#catalogo" },
    { label: "图片库", href: "#galeria" },
    { label: "联系我们", href: "#contato" },
  ],
};

const text = {
  pt: {
    institutionalFallback:
      "Empresa internacional de exportação conectando produtos brasileiros a compradores globais com padrão internacional.",
    company: "Empresa",
    contact: "Contato",
    export: "Exportação",
    whatsapp: "WhatsApp comercial",
    market: "Brasil | Mercados internacionais",
    exportText:
      "Curadoria de produtos, apresentação comercial e suporte para negociações internacionais.",
    rights: "Todos os direitos reservados",
  },
  zh: {
    institutionalFallback:
      "TopMax Export 为国际买家提供专业产品展示、商务支持和长期出口合作。",
    company: "公司",
    contact: "联系我们",
    export: "出口业务",
    whatsapp: "商务 WhatsApp",
    market: "巴西 | 国际市场",
    exportText: "提供产品展示、商务支持和国际贸易合作。",
    rights: "版权所有",
  },
};

export default function Footer({ content, locale = "pt" }: FooterProps) {
  const labels = text[locale];
  const socialLinks = [
    { label: "Instagram", href: content.instagram, icon: Send },
    { label: "LinkedIn", href: content.linkedin, icon: Link },
    { label: "Site", href: content.facebook || content.youtube || "#", icon: Globe2 },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#080b0d] px-4 pb-28 pt-14 text-white sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(214,180,106,0.14),transparent_26rem),radial-gradient(circle_at_86%_12%,rgba(255,255,255,0.08),transparent_24rem)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/45 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-9 border-b border-white/10 pb-10 sm:gap-12 sm:pb-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.8fr_0.7fr]">
        <div>
          <strong className="inline-flex max-w-full rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[0.64rem] font-semibold tracking-[0.2em] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:px-4 sm:text-[0.72rem] sm:tracking-[0.3em]">
            TOPMAX EXPORT
          </strong>

          <p className="mt-5 max-w-md text-sm leading-7 text-white/58 sm:mt-6">
            {locale === "zh" ? labels.institutionalFallback : content.institutional_text || labels.institutionalFallback}
          </p>

          <div className="mt-6 flex gap-3 sm:mt-7">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href || "#"}
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/70 transition duration-300 hover:-translate-y-1 hover:border-[#d6b46a]/45 hover:bg-[#d6b46a] hover:text-[#111]"
              >
                <Icon size={18} strokeWidth={1.9} />
              </a>
            ))}
          </div>
        </div>

        <nav>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b46a] sm:tracking-[0.24em]">
            {labels.company}
          </h3>

          <div className="mt-5 grid gap-3 text-sm text-white/62">
            {companyLinks[locale].map((link) => (
              <a
                key={link.href}
                href={locale === "zh" ? `/zh${link.href}` : link.href}
                className="transition duration-300 hover:text-[#d6b46a]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b46a] sm:tracking-[0.24em]">
            {labels.contact}
          </h3>

          <div className="mt-5 grid gap-4 text-sm text-white/62">
            <a
              href={content.whatsapp}
              className="inline-flex items-center gap-3 transition duration-300 hover:text-[#25d366]"
            >
              <MessageCircle size={17} />
              {labels.whatsapp}
            </a>

            <a
              href={`mailto:${content.email}`}
              className="inline-flex items-center gap-3 transition duration-300 hover:text-[#d6b46a]"
            >
              <Mail size={17} />
              {content.email}
            </a>

            <span>{labels.market}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b46a] sm:tracking-[0.24em]">
            {labels.export}
          </h3>

          <p className="mt-5 text-sm leading-7 text-white/58">{labels.exportText}</p>
        </div>
      </div>

      <div className="relative mx-auto mt-7 flex max-w-7xl flex-col gap-3 text-[0.68rem] uppercase leading-5 tracking-[0.12em] text-white/38 sm:flex-row sm:items-center sm:justify-between sm:text-xs sm:tracking-[0.18em]">
        <span>{content.copyright}</span>
        <span>{labels.rights}</span>
      </div>
    </footer>
  );
}
