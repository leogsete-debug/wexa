"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { CATALOG_STORE_URL } from "@/lib/catalog-store";

type TrackedCatalogStoreLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  source: string;
  productName?: string | null;
  children: ReactNode;
};

// Leva o visitante ao catálogo de pedidos na mesma aba e registra de onde ele saiu
// (o agente Gerente usa isso para medir site → catálogo).
export default function TrackedCatalogStoreLink({
  source,
  productName,
  children,
  onClick,
  ...props
}: TrackedCatalogStoreLinkProps) {
  return (
    <a
      {...props}
      href={CATALOG_STORE_URL}
      onClick={async (event) => {
        onClick?.(event);

        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
          return;
        }

        event.preventDefault();

        await Promise.race([
          trackAnalyticsEvent({ eventName: "catalog_store_click", source, productName, debug: false }),
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]).catch(() => undefined);

        window.location.href = CATALOG_STORE_URL;
      }}
    >
      {children}
    </a>
  );
}
