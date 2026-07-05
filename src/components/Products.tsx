import Image from "next/image";

const whatsapp = "https://wa.me/5500000000000";

const products = [
  {
    name: "Café verde especial",
    category: "Agronegócio",
    badge: "Seleção exportação",
    description: "Grãos selecionados para compradores internacionais, torrefações e distribuidores corporativos.",
    image: "/images/produto-1.jpeg",
  },
  {
    name: "Alimentos especiais brasileiros",
    category: "Exportação de alimentos",
    badge: "Alta demanda",
    description: "Produtos brasileiros com apresentação comercial pronta para mercados exigentes.",
    image: "/images/produto-2.jpeg",
  },
  {
    name: "Ingredientes naturais",
    category: "Commodities",
    badge: "Rastreável",
    description: "Insumos naturais com foco em consistência, rastreabilidade e escala comercial.",
    image: "/images/produto-3.jpeg",
  },
  {
    name: "Suprimentos industriais",
    category: "Soluções corporativas",
    badge: "Fornecimento seguro",
    description: "Soluções para importadores que buscam fornecedores confiáveis no Brasil.",
    image: "/images/produto-4.jpeg",
  },
  {
    name: "Produtos para marca própria",
    category: "Pronto para varejo",
    badge: "Marca própria",
    description: "Produtos com potencial para marca própria, atacado e redes de distribuição.",
    image: "/images/galeria-1.jpeg",
  },
  {
    name: "Seleção para exportação",
    category: "Portfólio curado",
    badge: "Sob demanda",
    description: "Portfólio sob demanda para operações comerciais, feiras e negociações internacionais.",
    image: "/images/galeria-2.jpeg",
  },
];

export default function Products() {
  return (
    <section id="produtos" className="relative px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/35 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#d6b46a]/25 bg-white/70 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)] backdrop-blur-xl">
              Catálogo de alto padrão
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">
              Produtos preparados para negociações internacionais.
            </h2>
          </div>

          <p className="max-w-md text-base leading-8 text-neutral-600">
            Uma seleção comercial para compradores, distribuidores e importadores que exigem qualidade,
            apresentação e segurança no fornecimento.
          </p>
        </div>

        <div className="mt-16 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="group overflow-hidden rounded-[2.15rem] border border-white/75 bg-white/72 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:border-[#d6b46a]/55 hover:bg-white hover:shadow-[0_38px_105px_rgba(31,41,55,0.18)]"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-neutral-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-112"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-85 transition duration-500 group-hover:opacity-70" />
                <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                  <span className="rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl">
                    {product.category}
                  </span>
                  <span className="rounded-full border border-[#d6b46a]/35 bg-[#d6b46a]/90 px-3.5 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-[#111] shadow-[0_14px_35px_rgba(214,180,106,0.28)]">
                    {product.badge}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#141414] transition duration-300 group-hover:text-[#9b7a3e] sm:text-[1.7rem]">
                  {product.name}
                </h3>
                <p className="mt-5 min-h-21 text-[0.98rem] leading-7 text-neutral-600">{product.description}</p>
                <a
                  href={whatsapp}
                  className="mt-8 inline-flex rounded-full bg-[#111] px-6 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)]"
                >
                  Solicitar cotação
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
