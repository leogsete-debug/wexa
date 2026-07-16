"use client";

import { useEffect } from "react";
import type { SiteLocale } from "@/components/HomePage";
import { trackAnalyticsEvent } from "@/lib/analytics";

export default function AnalyticsPageView({ locale }: { locale: SiteLocale }) {
  useEffect(() => {
    trackAnalyticsEvent({
      eventName: "page_view",
      source: "page",
      locale,
      debug: false,
    });
  }, [locale]);

  return null;
}
