import Image from "next/image";

const images = [
  { src: "/images/galeria-1.jpeg", className: "md:row-span-2" },
  { src: "/images/galeria-2.jpeg", className: "" },
  { src: "/images/galeria-3.jpeg", className: "" },
  { src: "/images/galeria-4.jpeg", className: "md:col-span-2" },
];

export default function Gallery() {
  return (
    <section id="galeria" className="relative px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#d6b46a]/25 bg-white/70 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)] backdrop-blur-xl">
              Galeria
            </p>
            <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#111] md:text-6xl">
              Imagens para uma apresentação comercial de alto impacto.
            </h2>
          </div>

          <p className="max-w-md text-base leading-8 text-neutral-600">
            Um recorte visual editorial para apoiar reuniões, feiras, propostas e negociações com compradores globais.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[240px] gap-5 md:grid-cols-3 md:auto-rows-[260px]">
          {images.map((image, index) => (
            <figure
              key={image.src}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-neutral-200 shadow-[0_24px_80px_rgba(31,41,55,0.13)] ${image.className}`}
            >
              <Image
                src={image.src}
                alt={`Galeria TopMax Export ${index + 1}`}
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
