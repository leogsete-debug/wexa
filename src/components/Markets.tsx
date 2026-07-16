import { Globe2 } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import { sectionText } from "@/lib/site-content";
import type { MarketContent } from "@/types/content";
import type { SiteSection } from "@/types/content";

type MarketsProps = {
  markets: MarketContent[];
  locale?: SiteLocale;
  section?: SiteSection;
};

const text = {
  pt: {
    eyebrow: "FORNECIMENTO INTERNACIONAL",
    title: "Conectados aos principais polos industriais do mundo.",
    description:
      "Desenvolvemos fornecedores em mercados estrategicos para oferecer qualidade, variedade e competitividade ao Brasil.",
    card: "Origem fornecedora, desenvolvimento comercial e suporte para importacao ao Brasil.",
  },
  zh: {
    eyebrow: "全球供应网络",
    title: "连接世界主要制造与供应中心",
    description:
      "我们在战略市场开发供应商，为巴西客户提供质量、产品多样性和竞争力。",
    card: "供应来源、商务开发以及进入巴西市场的进口支持。",
  },
};

const marketNameZh: Record<string, string> = {
  China: "中国",
  India: "印度",
  "Índia": "印度",
  "Sudeste Asiatico": "东南亚",
  "Sudeste Asiático": "东南亚",
  "Outros mercados estrategicos": "其他战略市场",
  "Outros mercados estratégicos": "其他战略市场",
  Asia: "亚洲",
};

export default function Markets({ markets, locale = "pt", section }: MarketsProps) {
  const fallbackLabels = text[locale];
  const labels = {
    eyebrow: sectionText(section, "eyebrow", locale, fallbackLabels.eyebrow),
    title: sectionText(section, "title", locale, fallbackLabels.title),
    description: sectionText(section, "description", locale, fallbackLabels.description),
    card: sectionText(section, "card_text", locale, fallbackLabels.card),
  };
  return (
    <section className="relative overflow-hidden bg-[#080b0d] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(214,180,106,0.2),transparent_30rem),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.1),transparent_24rem)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:96px_96px] opacity-25" />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
        <div>
          <p className="mb-5 inline-flex max-w-full rounded-full border border-[#d6b46a]/35 bg-[#d6b46a]/10 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#f0d89a] backdrop-blur-xl sm:px-4 sm:text-[0.72rem] sm:tracking-[0.28em]">
            {labels.eyebrow}
          </p>
          <h2 className="text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-6xl md:leading-[1.02] md:tracking-[-0.04em]">
            {labels.title}
          </h2>
          <p className="mt-6 max-w-xl text-[0.98rem] leading-7 text-white/68 sm:mt-7 sm:leading-8">
            {labels.description}
          </p>
        </div>

        <div className="grid items-stretch gap-4 sm:grid-cols-2">
          {markets.map((market, index) => (
            <article
              key={market.id}
              className={index === 0 ? "group h-full rounded-[1.35rem] border border-[#d6b46a]/35 bg-white/[0.09] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/[0.14] sm:col-span-2 sm:rounded-[1.7rem] sm:p-7" : "group h-full rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-[#d6b46a]/35 hover:bg-white/[0.12] sm:rounded-[1.7rem] sm:p-7"}
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6b46a]/25 bg-[#d6b46a]/12 text-[#f0d89a] transition duration-300 group-hover:bg-[#d6b46a] group-hover:text-[#111] sm:mb-8 sm:h-12 sm:w-12">
                <Globe2 size={22} strokeWidth={1.8} />
              </div>
              <h3 className="text-[1.45rem] font-semibold tracking-[-0.03em] sm:text-2xl">
                {locale === "zh" ? market.name_zh || marketNameZh[market.name] || marketNameZh[market.continent || ""] || market.name : market.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/58">
                {locale === "zh" ? market.description_zh || market.description || labels.card : market.description || labels.card}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
