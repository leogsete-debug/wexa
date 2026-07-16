"use client";

import { Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { SiteLocale } from "@/components/HomePage";
import TrackedWhatsappLink from "@/components/TrackedWhatsappLink";
import { sectionArray, sectionBoolean, sectionText } from "@/lib/site-content";
import type { SiteSection } from "@/types/content";
import type { SiteSettings } from "@/types/site-settings";

const navLinks = {
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
    quote: "Cotação",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    admin: "Acessar painel administrativo",
  },
  zh: {
    quote: "询价",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    admin: "访问管理面板",
  },
};

type SiteHeaderProps = {
  settings: SiteSettings;
  locale?: SiteLocale;
  section?: SiteSection;
};

function LanguageSelector({ locale }: { locale: SiteLocale }) {
  const linkClass = (language: SiteLocale) =>
    `px-1.5 py-1 transition duration-300 ${
      locale === language ? "text-[#f0d89a]" : "text-white/62 hover:text-white"
    }`;

  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-1.5 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] sm:text-[0.66rem] sm:tracking-[0.14em]">
      <Link className={linkClass("pt")} href="/">
        PT
      </Link>
      <span className="text-white/24">|</span>
      <Link className={linkClass("zh")} href="/zh">
        中文
      </Link>
    </div>
  );
}

type HeaderLink = {
  label: string;
  label_zh?: string;
  href: string;
};

export default function SiteHeader({ settings, locale = "pt", section }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const labels = text[locale];
  const links = sectionArray<HeaderLink>(section, "nav", navLinks.pt).map((link) => ({
    href: link.href,
    label: locale === "zh" ? link.label_zh || link.label : link.label,
  }));
  const quoteLabel = sectionText(section, "quote_label", locale, settings.header_quote_text || labels.quote);
  const quoteUrl = settings.whatsapp_url;
  const showLanguageSelector = settings.show_language_selector ?? sectionBoolean(section, "show_language_selector", true);
  const showAdminButton = settings.show_admin_button ?? sectionBoolean(section, "show_admin_button", true);
  const showQuoteButton = settings.show_quote_button ?? sectionBoolean(section, "show_quote_button", true);
  const adminLabel = sectionText(section, "admin_label", locale, labels.admin);
  const openMenuLabel = sectionText(section, "open_menu_label", locale, labels.openMenu);
  const closeMenuLabel = sectionText(section, "close_menu_label", locale, labels.closeMenu);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/15 bg-[#07100d]/55 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 text-white sm:gap-3 sm:px-6 sm:py-3 lg:px-8 lg:py-4">
        <strong className="shrink min-w-0 truncate rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 text-[0.54rem] font-semibold tracking-[0.13em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] min-[380px]:tracking-[0.18em] sm:px-4 sm:py-2 sm:text-[0.7rem] sm:tracking-[0.32em]">
          {settings.company_name.toUpperCase()}
        </strong>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] p-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl lg:flex xl:gap-2 xl:text-[0.68rem] xl:tracking-[0.18em]">
          {links.map((link) => (
            <a
              key={link.href}
              className="rounded-full px-3.5 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white xl:px-4"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showLanguageSelector ? <LanguageSelector locale={locale} /> : null}

          {showQuoteButton ? (
          <TrackedWhatsappLink
            href={quoteUrl}
            source="header"
            className="hidden rounded-full border border-white/35 bg-white/10 px-2.5 py-2 text-[0.54rem] font-semibold uppercase tracking-[0.1em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d6b46a]/80 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)] min-[430px]:inline-flex min-[430px]:px-3 sm:px-6 sm:py-3 sm:text-[0.7rem] sm:tracking-[0.18em]"
          >
            {quoteLabel}
          </TrackedWhatsappLink>
          ) : null}

          {showAdminButton ? (
          <a
            href="/admin"
            aria-label={adminLabel}
            title={adminLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-300 hover:bg-[#d6b46a] hover:text-[#111] sm:h-11 sm:w-11"
          >
            <Settings size={17} strokeWidth={2} />
          </a>
          ) : null}

          <button
            type="button"
            aria-label={isMenuOpen ? closeMenuLabel : openMenuLabel}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-300 hover:bg-white/18 sm:h-11 sm:w-11 lg:hidden"
          >
            {isMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 lg:hidden ${
          isMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="mx-3 mb-3 grid gap-1 rounded-[1.1rem] border border-white/12 bg-[#07100d]/88 p-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/78 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:mx-6 sm:mb-4 sm:gap-2 sm:rounded-[1.4rem] sm:p-3 sm:text-sm sm:tracking-[0.16em]">
            {links.map((link) => (
              <a
                key={link.href}
                className="rounded-xl px-3 py-2.5 transition duration-300 hover:bg-white/12 hover:text-white sm:rounded-2xl sm:px-4 sm:py-3"
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {showQuoteButton ? (
            <TrackedWhatsappLink
              className="rounded-xl px-3 py-2.5 text-[#f0d89a] transition duration-300 hover:bg-white/12 sm:rounded-2xl sm:px-4 sm:py-3 min-[430px]:hidden"
              href={quoteUrl}
              source="header"
              onClick={() => setIsMenuOpen(false)}
            >
              {quoteLabel}
            </TrackedWhatsappLink>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
