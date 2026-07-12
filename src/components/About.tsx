import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import type { CompanyContent } from "@/types/content";

type AboutProps = {
  content: CompanyContent;
  locale?: SiteLocale;
};

function parseStat(value: string) {
  const [statValue, label] = value.split("|");
  return { value: statValue || value, label: label || "" };
}

export default function About({ content, locale = "pt" }: AboutProps) {
  const isZh = locale === "zh";
  const translatedContent = isZh
    ? {
        ...content,
        section_title: "关于 TOPMAX EXPORT",
        section_subtitle: "连接巴西制造商与全球市场",
        full_text:
          "TopMax Export 致力于将巴西优质产品连接到国际市场，为买家提供专业、可靠且高效的商务支持。\n\n我们的平台展示产品、企业实力、出口流程和商业信息，帮助国际客户更快了解公司并建立合作信任。",
        mission: "国际出口合作伙伴",
        vision: "值得信赖的出口伙伴",
        differentials: "为国际买家提供专业产品展示、商务支持和长期合作关系。",
        stat_20: "20+|行业经验",
        stat_35: "35+|合作国家",
        stat_500: "500+|产品选择",
        stat_100: "100%|质量承诺",
      }
    : content;
  const stats = [
    translatedContent.stat_20,
    translatedContent.stat_35,
    translatedContent.stat_500,
    translatedContent.stat_100,
  ].map(parseStat);
  const paragraphs = translatedContent.full_text.split(/\n+/).filter(Boolean);

  return (
    <section
      id="empresa"
      className="relative isolate overflow-hidden bg-[#fbfaf7] px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6b46a]/40 to-transparent" />
      <div className="absolute -left-32 top-24 -z-10 h-80 w-80 rounded-full bg-[#d6b46a]/18 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute -right-40 bottom-10 -z-10 h-[24rem] w-[24rem] rounded-full bg-black/[0.055] blur-3xl sm:h-[30rem] sm:w-[30rem]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,24,39,0.035)_1px,transparent_1px),linear-gradient(rgba(17,24,39,0.035)_1px,transparent_1px)] bg-[size:96px_96px] opacity-70" />

      <div className="mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div className="motion-safe:animate-[fadeUp_800ms_ease-out_both]">
          <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.07)] backdrop-blur-xl sm:mb-6 sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
            {translatedContent.section_title}
          </p>

          <h2 className="max-w-3xl text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[#101010] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.045em]">
            {translatedContent.section_subtitle}
          </h2>

          <div className="mt-6 h-px w-28 bg-gradient-to-r from-[#d6b46a] via-[#d6b46a]/60 to-transparent sm:mt-7 sm:w-32" />

          <div className="mt-6 max-w-2xl space-y-4 text-[0.94rem] leading-7 text-neutral-600 sm:mt-8 sm:space-y-6 sm:text-lg sm:leading-8">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-3 lg:grid-cols-4 lg:gap-4">
            {stats.map((stat, index) => (
              <div
                key={`${stat.value}-${stat.label}`}
                className="group rounded-[1rem] border border-white/80 bg-white/72 p-3 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#d6b46a]/45 hover:bg-white hover:shadow-[0_28px_75px_rgba(31,41,55,0.14)] sm:rounded-[1.35rem] sm:p-5 motion-safe:animate-[fadeUp_700ms_ease-out_both]"
                style={{ animationDelay: `${index * 90 + 160}ms` }}
              >
                <strong className="block text-xl font-semibold tracking-[-0.035em] text-[#111] transition duration-300 group-hover:text-[#9b7a3e] sm:text-3xl sm:tracking-[-0.05em]">
                  {stat.value}
                </strong>
                <span className="mt-1.5 block text-[0.55rem] font-bold uppercase leading-3 tracking-[0.06em] text-neutral-500 sm:mt-2 sm:text-[0.68rem] sm:leading-5 sm:tracking-[0.18em]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative motion-safe:animate-[fadeUp_900ms_140ms_ease-out_both]">
          <div className="absolute -inset-4 rounded-[2.6rem] bg-gradient-to-br from-[#d6b46a]/25 via-white/30 to-black/10 blur-2xl" />

          <div className="group relative overflow-hidden rounded-[1.25rem] border border-white/75 bg-white/30 p-2 shadow-[0_34px_110px_rgba(31,41,55,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_42px_130px_rgba(31,41,55,0.24)] sm:rounded-[2.25rem] sm:p-3">
            <div className="relative h-[19rem] overflow-hidden rounded-[1rem] bg-neutral-200 min-[380px]:h-[20.5rem] sm:h-auto sm:aspect-[5/4] sm:rounded-[1.75rem] lg:aspect-[4/5]">
              <Image
                src={translatedContent.main_image_url}
                alt={isZh ? `${translatedContent.company_name} 国际业务` : `Operacoes internacionais da ${translatedContent.company_name}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10" />
              <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-[#f0d89a] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl sm:left-7 sm:top-7 sm:px-4 sm:py-2 sm:text-[0.68rem] sm:tracking-[0.2em]">
                {translatedContent.mission}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-3 bottom-3 rounded-[1rem] border border-white/35 bg-white/18 p-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/24 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:max-w-[18rem] sm:rounded-[1.5rem] sm:p-5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#d6b46a] text-[#111] shadow-[0_16px_38px_rgba(214,180,106,0.36)] sm:mb-4 sm:h-11 sm:w-11">
              <CheckCircle2 size={18} strokeWidth={2.1} />
            </div>
            <h3 className="text-sm font-semibold tracking-[-0.02em] sm:text-lg">{translatedContent.vision}</h3>
            <p className="mt-1 text-xs leading-5 text-white/72 sm:mt-2 sm:text-sm sm:leading-6">
              {translatedContent.differentials}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
