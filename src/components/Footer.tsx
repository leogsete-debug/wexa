import { Globe2, Link, Mail, MessageCircle, Send } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import TrackedWhatsappLink from "@/components/TrackedWhatsappLink";
import type { FooterContent } from "@/types/content";
import type { SiteSettings } from "@/types/site-settings";

type FooterProps = {
  content: FooterContent;
  settings: SiteSettings;
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
      "A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo solucoes de importacao, desenvolvimento de produtos e fornecimento em escala.",
    company: "Empresa",
    contact: "Contato",
    export: "Importacao",
    whatsapp: "WhatsApp comercial",
    market: "Brasil | Fornecimento internacional",
    exportText:
      "Selecao de fornecedores, negociacao, qualidade, logistica internacional e suporte para entrada dos produtos no Brasil.",
    rights: "Todos os direitos reservados",
  },
  zh: {
    institutionalFallback:
      "Top Max 将巴西企业与国际制造商连接起来，提供进口、产品开发和规模化供应解决方案。",
    company: "公司",
    contact: "联系我们",
    export: "进口业务",
    whatsapp: "商务 WhatsApp",
    market: "巴西 | 全球供应",
    exportText: "供应商选择、商务谈判、质量控制、国际物流以及产品进入巴西市场的支持服务。",
    rights: "版权所有",
  },
};

export default function Footer({ content, settings, locale = "pt" }: FooterProps) {
  const labels = text[locale];
  const institutionalText =
    locale === "zh"
      ? content.institutional_text_zh || content.institutional_text || labels.institutionalFallback
      : content.institutional_text || labels.institutionalFallback;
  const columnTitles = {
    company: locale === "zh" ? content.company_column_title_zh || content.company_column_title || labels.company : content.company_column_title || labels.company,
    contact: locale === "zh" ? content.contact_column_title_zh || content.contact_column_title || labels.contact : content.contact_column_title || labels.contact,
    export: locale === "zh" ? content.export_column_title_zh || content.export_column_title || labels.export : content.export_column_title || labels.export,
  };
  const exportText = locale === "zh" ? content.export_text_zh || content.export_text || labels.exportText : content.export_text || labels.exportText;
  const rightsText = locale === "zh" ? content.rights_text_zh || content.rights_text || labels.rights : content.rights_text || labels.rights;
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
            {institutionalText}
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
            {columnTitles.company}
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
            {columnTitles.contact}
          </h3>

          <div className="mt-5 grid gap-4 text-sm text-white/62">
            <TrackedWhatsappLink
              href={settings.whatsapp_url}
              source="footer"
              className="inline-flex items-center gap-3 transition duration-300 hover:text-[#25d366]"
            >
              <MessageCircle size={17} />
              {labels.whatsapp}
            </TrackedWhatsappLink>

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
            {columnTitles.export}
          </h3>

          <p className="mt-5 text-sm leading-7 text-white/58">{exportText}</p>
        </div>
      </div>

      <div className="relative mx-auto mt-7 flex max-w-7xl flex-col gap-3 text-[0.68rem] uppercase leading-5 tracking-[0.12em] text-white/38 sm:flex-row sm:items-center sm:justify-between sm:text-xs sm:tracking-[0.18em]">
        <span>{content.copyright}</span>
        <span>{rightsText}</span>
      </div>
    </footer>
  );
}
