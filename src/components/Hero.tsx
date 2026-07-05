import Image from "next/image";

const whatsapp = "https://wa.me/5500000000000";

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <Image
        src="/images/hero.jpeg"
        alt="TopMax Export"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover motion-safe:animate-[heroZoom_18s_ease-in-out_infinite_alternate]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.74)_38%,rgba(0,0,0,0.26)_72%,rgba(0,0,0,0.54)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(214,180,106,0.2),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_22%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-30" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-5 pb-12 pt-32 text-white sm:px-6 lg:px-8">
        <div className="max-w-5xl motion-safe:animate-[fadeUp_900ms_ease-out_both]">
          <p className="mb-6 inline-flex rounded-full border border-[#d6b46a]/35 bg-[#d6b46a]/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#f0d89a] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl">
            Vitrine internacional de exportação
          </p>

          <h1 className="max-w-5xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-white drop-shadow-[0_22px_60px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl lg:text-[5.6rem]">
            Conectando a excelência brasileira ao mercado global
          </h1>

          <p className="mt-8 max-w-2xl text-pretty text-base leading-8 text-white/78 sm:text-lg">
            Uma vitrine digital de alto padrão para apresentar produtos, fortalecer negociações
            e conectar compradores ao mercado internacional.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={whatsapp}
              className="rounded-full bg-[#d6b46a] px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#111] shadow-[0_22px_60px_rgba(214,180,106,0.34)] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d89a] hover:shadow-[0_28px_70px_rgba(214,180,106,0.46)] sm:px-9"
            >
              Solicitar cotação
            </a>

            <a
              href="#produtos"
              className="rounded-full border border-white/28 bg-white/10 px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/70 hover:bg-white hover:text-black sm:px-9"
            >
              Ver produtos
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 rounded-[2rem] border border-white/18 bg-white/[0.105] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl sm:gap-4 sm:p-4 md:grid-cols-4">
            {["20+ Anos", "35+ Países", "500+ Produtos", "100% Qualidade"].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14] sm:p-6"
              >
                <h3 className="text-3xl font-semibold tracking-[-0.04em] text-[#f0d89a] sm:text-4xl">
                  {item.split(" ")[0]}
                </h3>
                <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/62 sm:text-xs">
                  {item.substring(item.indexOf(" ") + 1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
