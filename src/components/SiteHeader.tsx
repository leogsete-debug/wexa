"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { SiteSettings } from "@/types/site-settings";

const navLinks = [
  { label: "Empresa", href: "#empresa" },
  { label: "Produtos", href: "#produtos" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Galeria", href: "#galeria" },
  { label: "Contato", href: "#contato" },
];

type SiteHeaderProps = {
  settings: SiteSettings;
};

export default function SiteHeader({ settings }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/15 bg-[#07100d]/55 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 text-white sm:gap-3 sm:px-6 sm:py-3 lg:px-8 lg:py-4">
        <strong className="shrink-0 rounded-full border border-white/10 bg-white/10 px-2.5 py-1.5 text-[0.54rem] font-semibold tracking-[0.13em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] min-[380px]:tracking-[0.18em] sm:px-4 sm:py-2 sm:text-[0.7rem] sm:tracking-[0.32em]">
          {settings.company_name.toUpperCase()}
        </strong>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.08] p-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl lg:flex xl:gap-2 xl:text-[0.68rem] xl:tracking-[0.18em]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="rounded-full px-3.5 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white xl:px-4"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={settings.whatsapp_url}
            className="inline-flex rounded-full border border-white/35 bg-white/10 px-2.5 py-2 text-[0.54rem] font-semibold uppercase tracking-[0.1em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d6b46a]/80 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)] min-[380px]:px-3 sm:px-6 sm:py-3 sm:text-[0.7rem] sm:tracking-[0.18em]"
          >
            Cotação
          </a>

          <button
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
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
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="rounded-xl px-3 py-2.5 transition duration-300 hover:bg-white/12 hover:text-white sm:rounded-2xl sm:px-4 sm:py-3"
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
