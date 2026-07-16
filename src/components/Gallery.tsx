import Image from "next/image";
import type { SiteLocale } from "@/components/HomePage";
import { fallbackGalleryItems, sectionText } from "@/lib/site-content";
import type { GalleryItem, SiteSection } from "@/types/content";

type GalleryProps = {
  locale?: SiteLocale;
  section?: SiteSection;
  items?: GalleryItem[];
};

export default function Gallery({ locale = "pt", section, items = fallbackGalleryItems }: GalleryProps) {
  if (section && !section.enabled) return null;

  const labels = {
    eyebrow: sectionText(section, "eyebrow", locale, locale === "zh" ? "国际业务" : "OPERACAO INTERNACIONAL"),
    title: sectionText(
      section,
      "title",
      locale,
      locale === "zh" ? "产品、生产与物流的一体化运营" : "Produtos, producao e logistica em uma operacao integrada.",
    ),
    description: sectionText(
      section,
      "description",
      locale,
      locale === "zh"
        ? "展示我们与国际制造商及巴西市场之间的完整业务流程。"
        : "Uma visao da nossa atuacao junto a fabricantes internacionais e ao mercado brasileiro.",
    ),
    alt: sectionText(section, "alt", locale, locale === "zh" ? "TopMax Export 产品展示" : "Galeria TopMax Export"),
  };

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
          {items.map((image, index) => (
            <figure
              key={image.id}
              className={`group relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-neutral-200 shadow-[0_24px_80px_rgba(31,41,55,0.13)] sm:rounded-[2rem] ${
                image.featured ? "md:row-span-2" : index === 3 ? "md:col-span-2" : ""
              }`}
            >
              <Image
                src={image.image_url}
                alt={locale === "zh" ? image.alt_text_zh || image.alt_text || `${labels.alt} ${index + 1}` : image.alt_text || `${labels.alt} ${index + 1}`}
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
