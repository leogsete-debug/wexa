"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type TrackedCatalogDownloadLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel"
> & {
  href: string;
  children: ReactNode;
};

export default function TrackedCatalogDownloadLink({
  href,
  children,
  onClick,
  ...props
}: TrackedCatalogDownloadLinkProps) {
  return (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        event.preventDefault();
        await trackAnalyticsEvent({
          eventName: "catalog_download",
          source: "catalog",
          productName: "Catalogo",
          debug: false,
        });

        const openedWindow = window.open(href, "_blank", "noopener,noreferrer");
        if (!openedWindow) window.location.href = href;
      }}
    >
      {children}
    </a>
  );
}
