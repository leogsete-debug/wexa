import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { getPublicSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const title = settings.seo_title_zh || settings.seo_title || "TopMax Export";
  const description = settings.seo_description_zh || settings.seo_description || "";

  return {
    title,
    description,
    keywords: settings.seo_keywords || undefined,
    robots: settings.seo_indexable === false ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: settings.seo_canonical || "/zh",
      languages: {
        "pt-BR": "/",
        "zh-CN": "/zh",
      },
    },
    openGraph: {
      title: settings.seo_og_title || title,
      description: settings.seo_og_description || description,
      images: settings.seo_image_url ? [settings.seo_image_url] : undefined,
    },
  };
}

export default function ChineseHomePage() {
  return <HomePage locale="zh" />;
}
