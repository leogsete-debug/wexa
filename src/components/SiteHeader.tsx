const whatsapp = "https://wa.me/5500000000000";

export default function SiteHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/15 bg-[#07100d]/40 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 text-white sm:px-6 lg:px-8">
        <strong className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.28em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:text-[0.7rem] sm:tracking-[0.32em]">
          TOPMAX EXPORT
        </strong>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] p-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl md:flex">
          <a className="rounded-full px-4 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white" href="#empresa">
            Empresa
          </a>
          <a className="rounded-full px-4 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white" href="#produtos">
            Produtos
          </a>
          <a className="rounded-full px-4 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white" href="#catalogo">
            Catálogo
          </a>
          <a className="rounded-full px-4 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white" href="#galeria">
            Galeria
          </a>
          <a className="rounded-full px-4 py-2.5 transition duration-300 hover:bg-white/14 hover:text-white" href="#contato">
            Contato
          </a>
        </nav>

        <a
          href={whatsapp}
          className="rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d6b46a]/80 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)] sm:px-6 sm:text-[0.7rem] sm:tracking-[0.18em]"
        >
          Cotação
        </a>
      </div>
    </header>
  );
}
