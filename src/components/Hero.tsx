import Image from "next/image";
import type { SiteLocale } from "@/components/HomePage";
import TrackedWhatsappLink from "@/components/TrackedWhatsappLink";
import { sectionArray } from "@/lib/site-content";
import type { SiteSection } from "@/types/content";
import type { SiteSettings } from "@/types/site-settings";

type HeroProps = {
  settings: SiteSettings;
  locale?: SiteLocale;
  section?: SiteSection;
};

type HeroStat = {
  value: string;
  label: string;
  label_zh?: string;
  sort_order?: number;
};

export default function Hero({ settings, locale = "pt", section }: HeroProps) {
  const mobileHeroImage = settings.hero_mobile_image_url || settings.hero_image_url;
  const stats = sectionArray<HeroStat>(section, "stats")
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <Image
        src={settings.hero_image_url}
        alt={settings.company_name}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 hidden h-full w-full scale-[1.03] object-cover motion-safe:animate-[heroZoom_18s_ease-in-out_infinite_alternate] sm:block"
      />
      <Image
        src={mobileHeroImage}
        alt={settings.company_name}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover motion-safe:animate-[heroZoom_18s_ease-in-out_infinite_alternate] sm:hidden"
      />

      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.76)_42%,rgba(0,0,0,0.3)_72%,rgba(0,0,0,0.56)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(214,180,106,0.2),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_22%,rgba(0,0,0,0.5)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-30" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-4 pb-7 pt-24 text-white sm:px-6 sm:pb-10 sm:pt-32 lg:px-8 lg:pb-14">
        <div className="max-w-5xl motion-safe:animate-[fadeUp_900ms_ease-out_both]">
          <p className="mb-4 inline-flex max-w-full rounded-full border border-[#d6b46a]/35 bg-[#d6b46a]/10 px-3 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#f0d89a] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl sm:mb-6 sm:px-4 sm:py-2 sm:text-[0.72rem] sm:tracking-[0.34em]">
            {settings.hero_badge}
          </p>

          <h1 className="max-w-5xl text-balance text-[2.05rem] font-semibold leading-[1.05] tracking-[-0.025em] text-white drop-shadow-[0_22px_60px_rgba(0,0,0,0.45)] min-[380px]:text-[2.35rem] sm:text-6xl sm:leading-[1] sm:tracking-[-0.03em] md:text-7xl lg:text-[5.6rem] lg:leading-[0.96] lg:tracking-[-0.04em]">
            {settings.hero_title}
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-[0.92rem] leading-6 text-white/78 sm:mt-8 sm:text-lg sm:leading-8">
            {settings.hero_subtitle}
          </p>

          {settings.show_hero_primary_button || settings.show_hero_secondary_button ? (
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-10 sm:flex-row sm:gap-4">
              {settings.show_hero_primary_button ? (
                <TrackedWhatsappLink
                  href={settings.whatsapp_url}
                  source="hero"
                  className="rounded-full bg-[#d6b46a] px-5 py-3.5 text-center text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#111] shadow-[0_22px_60px_rgba(214,180,106,0.34)] transition duration-300 hover:-translate-y-1 hover:bg-[#f0d89a] hover:shadow-[0_28px_70px_rgba(214,180,106,0.46)] sm:px-9 sm:py-4 sm:text-xs sm:tracking-[0.2em]"
                >
                  {settings.hero_primary_button_text}
                </TrackedWhatsappLink>
              ) : null}

              {settings.show_hero_secondary_button ? (
                <a
                  href={settings.hero_secondary_button_url}
                  className="rounded-full border border-white/28 bg-white/10 px-5 py-3.5 text-center text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/70 hover:bg-white hover:text-black sm:px-9 sm:py-4 sm:text-xs sm:tracking-[0.2em]"
                >
                  {settings.hero_secondary_button_text}
                </a>
              ) : null}
            </div>
          ) : null}

          {stats.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-[1.25rem] border border-white/18 bg-white/[0.105] p-2 shadow-[0_30px_100px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl sm:mt-12 sm:gap-4 sm:rounded-[2rem] sm:p-4 md:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={`${item.value}-${item.label}`}
                  className="rounded-xl border border-white/10 bg-white/[0.08] p-3 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.14] sm:rounded-3xl sm:p-6"
                >
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#f0d89a] sm:text-4xl sm:tracking-[-0.04em]">
                    {item.value}
                  </h3>
                  <p className="mt-1.5 text-[0.56rem] font-semibold uppercase leading-3 tracking-[0.08em] text-white/62 sm:mt-2 sm:text-xs sm:leading-4 sm:tracking-[0.22em]">
                    {locale === "zh" ? item.label_zh || item.label : item.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
