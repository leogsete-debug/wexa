"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics";

const PUBLIC_PATHS = new Set(["/", "/zh"]);
const EXCLUDED_PREFIXES = ["/admin", "/api", "/_next"];
const pendingPageViews = new Set<string>();

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (
      !pathname ||
      !PUBLIC_PATHS.has(pathname) ||
      EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ) {
      return;
    }

    const sessionKey = `topmax_pageview_${pathname}`;

    if (window.sessionStorage.getItem(sessionKey) || pendingPageViews.has(sessionKey)) {
      return;
    }

    // The in-memory lock prevents React Strict Mode from starting a second POST.
    // sessionStorage is only written after the API confirms that Supabase saved it.
    pendingPageViews.add(sessionKey);

    void (async () => {
      const result = await trackAnalyticsEvent({
        eventName: "page_view",
        source: "site",
        pagePath: pathname,
        locale: pathname.startsWith("/zh") ? "zh" : "pt",
        debug: false,
      });

      if (result.saved) {
        window.sessionStorage.setItem(sessionKey, "1");
      } else if (process.env.NODE_ENV !== "production") {
        const error = { pathname, result };
        console.error("Page view nao foi salvo", error);
      }

      pendingPageViews.delete(sessionKey);
    })();
  }, [pathname, query]);

  return null;
}
