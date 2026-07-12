import Image from "next/image";
import type { SiteLocale } from "@/components/HomePage";

const images = [
  { src: "/images/galeria-1.jpeg", className: "md:row-span-2" },
  { src: "/images/galeria-2.jpeg", className: "" },
  { src: "/images/galeria-3.jpeg", className: "" },
  { src: "/images/galeria-4.jpeg", className: "md:col-span-2" },
];

const text = {
  pt: {
    eyebrow: "Galeria",
    title: "Imagens para uma apresentação comercial de alto impacto.",
    description:
      "Um recorte visual editorial para apoiar reuniões, feiras, propostas e negociações com compradores globais.",
    alt: "Galeria TopMax Export",
  },
  zh: {
    eyebrow: "产品展示",
    title: "高影响力的商业展示图片",
    description: "展示产品、质量和市场定位",
    alt: "TopMax Export 产品展示",
  },
};

export default function Gallery({ locale = "pt" }: { locale?: SiteLocale }) {
  const labels = text[locale];

  return (
    <section id="galeria" className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end lg:gap-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/25 bg-white/70 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)] backdrop-blur-xl sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
              {labels.eyebrow}
            </p>
            <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[#111] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
              {labels.title}
            </h2>
          </div>

          <p className="max-w-xl text-[0.98rem] leading-7 text-neutral-600 lg:max-w-md lg:leading-8">
            {labels.description}
          </p>
        </div>

        <div className="mt-10 grid auto-rows-[220px] gap-4 sm:mt-14 sm:auto-rows-[260px] sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[280px]">
          {images.map((image, index) => (
            <figure
              key={image.src}
              className={`group relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-neutral-200 shadow-[0_24px_80px_rgba(31,41,55,0.13)] sm:rounded-[2rem] ${image.className}`}
            >
              <Image
                src={image.src}
                alt={`${labels.alt} ${index + 1}`}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-60" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
