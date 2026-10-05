import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import TrackedCatalogStoreLink from "@/components/TrackedCatalogStoreLink";
import { catalogStoreLabels } from "@/lib/catalog-store";
import type { FeaturedProduct } from "@/lib/featured-products";

const text = {
  pt: { eyebrow: "Destaques com pronta entrega", title: "Os mais procurados da semana", order: "Fazer pedido" },
  zh: { eyebrow: "现货推荐", title: "本周热门产品", order: "立即订购" },
};

// Faixa de destaques em movimento contínuo. Os cards são repetidos para a faixa
// nunca ficar vazia; a animação pausa ao passar o mouse e respeita "reduzir movimento".
export default function FeaturedCarousel({ products, locale = "pt" }: { products: FeaturedProduct[]; locale?: SiteLocale }) {
  if (products.length === 0) return null;

  const labels = text[locale];
  const copies = Math.max(2, Math.ceil(8 / products.length));
  const track = Array.from({ length: copies }, () => products).flat();

  return (
    <section id="produtos" className="relative overflow-hidden bg-[#fbfaf7] py-14 sm:py-20">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 px-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/25 bg-white/70 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)] sm:text-[0.7rem]">
            {labels.eyebrow}
          </p>
          <h2 className="text-balance text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111] sm:text-5xl">
            {labels.title}
          </h2>
        </div>
        <TrackedCatalogStoreLink
          source="carousel_all"
          className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9b7a3e] underline-offset-4 hover:underline"
        >
          {catalogStoreLabels[locale].allProducts} →
        </TrackedCatalogStoreLink>
      </div>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#fbfaf7] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#fbfaf7] to-transparent sm:w-24" />

        <div
          className="flex w-max gap-4 px-4 motion-safe:animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:overflow-x-auto sm:gap-6"
          style={{ animationDuration: `${track.length * 6}s` }}
        >
          {[...track, ...track].map((product, index) => (
            <article
              key={`${product.key}-${index}`}
              aria-hidden={index >= track.length ? true : undefined}
              className="flex w-[16.5rem] shrink-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[0_22px_60px_rgba(31,41,55,0.10)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_rgba(31,41,55,0.18)] sm:w-[19rem]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  unoptimized={product.image.startsWith("/api/")}
                  sizes="(min-width: 640px) 19rem, 16.5rem"
                  className="object-cover transition duration-700 hover:scale-105"
                />
                {product.badge ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[#d6b46a] px-3 py-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#111] shadow-[0_10px_30px_rgba(214,180,106,0.35)]">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug tracking-[-0.01em] text-[#141414]">
                  {product.name}
                </h3>
                {product.stockLine ? <p className="mt-2 text-xs font-semibold text-neutral-500">{product.stockLine}</p> : null}
                {product.priceLine ? <p className="mt-1 text-sm font-semibold text-[#9b7a3e]">{product.priceLine}</p> : null}

                <TrackedCatalogStoreLink
                  source="carousel"
                  productName={product.name}
                  tabIndex={index >= track.length ? -1 : undefined}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#111] px-5 py-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition duration-300 hover:bg-[#d6b46a] hover:text-[#111]"
                >
                  <ShoppingBag size={15} />
                  {labels.order}
                </TrackedCatalogStoreLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
