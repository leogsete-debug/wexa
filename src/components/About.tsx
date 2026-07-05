import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const stats = [
  { value: "20+", label: "Anos de experiência" },
  { value: "35+", label: "Países atendidos" },
  { value: "500+", label: "Produtos no portfólio" },
  { value: "100%", label: "Foco em qualidade" },
];

export default function About() {
  return (
    <section
      id="empresa"
      className="relative isolate overflow-hidden bg-[#fbfaf7] px-5 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/40 to-transparent" />
      <div className="absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-[#d6b46a]/18 blur-3xl" />
      <div className="absolute -right-40 bottom-10 -z-10 h-[30rem] w-[30rem] rounded-full bg-black/[0.055] blur-3xl" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,24,39,0.035)_1px,transparent_1px),linear-gradient(rgba(17,24,39,0.035)_1px,transparent_1px)] bg-[size:96px_96px] opacity-70" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div className="motion-safe:animate-[fadeUp_800ms_ease-out_both]">
          <p className="mb-6 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.07)] backdrop-blur-xl">
            Sobre a TopMax Export
          </p>

          <h2 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#101010] md:text-6xl">
            Conectando fabricantes brasileiros ao mercado global
          </h2>

          <div className="mt-7 h-px w-32 bg-gradient-to-r from-[#d6b46a] via-[#d6b46a]/60 to-transparent" />

          <div className="mt-8 max-w-2xl space-y-6 text-base leading-8 text-neutral-600 sm:text-lg">
            <p>
              A TopMax Export conecta fabricantes brasileiros a compradores internacionais por meio
              de uma estrutura comercial de alto padrão, orientada por confiança, clareza e parcerias de
              longo prazo.
            </p>

            <p>
              Da seleção de fornecedores à apresentação dos produtos, alinhamento de qualidade e
              suporte à exportação, ajudamos importadores a acessar o potencial produtivo do Brasil
              com segurança e profissionalismo.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group rounded-[1.35rem] border border-white/80 bg-white/72 p-5 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#d6b46a]/45 hover:bg-white hover:shadow-[0_28px_75px_rgba(31,41,55,0.14)] motion-safe:animate-[fadeUp_700ms_ease-out_both]"
                style={{ animationDelay: `${index * 90 + 160}ms` }}
              >
                <strong className="block text-3xl font-semibold tracking-[-0.05em] text-[#111] transition duration-300 group-hover:text-[#9b7a3e]">
                  {stat.value}
                </strong>
                <span className="mt-2 block text-[0.68rem] font-bold uppercase leading-5 tracking-[0.18em] text-neutral-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative motion-safe:animate-[fadeUp_900ms_140ms_ease-out_both]">
          <div className="absolute -inset-4 rounded-[2.6rem] bg-gradient-to-br from-[#d6b46a]/25 via-white/30 to-black/10 blur-2xl" />

          <div className="group relative overflow-hidden rounded-[2.25rem] border border-white/75 bg-white/30 p-3 shadow-[0_34px_110px_rgba(31,41,55,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_42px_130px_rgba(31,41,55,0.24)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-neutral-200 sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="/images/galeria-2.jpeg"
                alt="Operações internacionais da TopMax Export"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10" />
              <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#f0d89a] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl sm:left-7 sm:top-7">
                Exportação entre empresas
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 max-w-[18rem] rounded-[1.5rem] border border-white/35 bg-white/18 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/24 sm:bottom-8 sm:right-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#d6b46a] text-[#111] shadow-[0_16px_38px_rgba(214,180,106,0.36)]">
              <CheckCircle2 size={23} strokeWidth={2.1} />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em]">Parceiro confiável em exportação</h3>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Fornecedor seguro para compradores internacionais
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
