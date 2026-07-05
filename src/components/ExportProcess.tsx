import { ClipboardCheck, Factory, PackageCheck, Send, ShieldCheck, Ship } from "lucide-react";

const steps = [
  { title: "Solicitação", icon: Send, text: "Recebemos a demanda, destino, volume e requisitos comerciais." },
  { title: "Cotação", icon: ClipboardCheck, text: "Estruturamos preço, prazos, condições e escopo de fornecimento." },
  { title: "Produção", icon: Factory, text: "Coordenamos produção ou separação com fornecedores qualificados." },
  { title: "Controle de qualidade", icon: ShieldCheck, text: "Validamos padrões, documentação e consistência do pedido." },
  { title: "Embarque", icon: Ship, text: "Organizamos logística, exportação e acompanhamento operacional." },
  { title: "Entrega", icon: PackageCheck, text: "Acompanhamos a chegada e o pós-venda com visão de longo prazo." },
];

export default function ExportProcess() {
  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/25 bg-white/70 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)] backdrop-blur-xl sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
            Processo de exportação
          </p>
          <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[#111] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
            Da primeira conversa ao embarque com padrão internacional.
          </h2>
        </div>

        <div className="relative mt-10 grid items-stretch gap-4 sm:mt-14 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <div className="absolute left-8 right-8 top-16 hidden h-px bg-gradient-to-r from-transparent via-[#d6b46a]/60 to-transparent 2xl:block" />

          {steps.map(({ title, icon: Icon, text }, index) => (
            <article
              key={title}
              className="relative h-full rounded-[1.35rem] border border-white/75 bg-white/72 p-5 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#d6b46a]/45 hover:shadow-[0_28px_80px_rgba(31,41,55,0.13)] sm:rounded-[1.6rem] sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between sm:mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a] shadow-[0_18px_40px_rgba(0,0,0,0.16)] sm:h-[3.25rem] sm:w-[3.25rem]">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b7a3e] sm:tracking-[0.2em]">
                  0{index + 1}
                </span>
              </div>

              <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#141414]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600 sm:mt-4">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
