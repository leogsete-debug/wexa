"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackWhatsappClick, type WhatsappEventSource } from "@/lib/analytics";

type TrackedWhatsappLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel"
> & {
  href: string;
  source: WhatsappEventSource;
  productId?: string | null;
  productName?: string | null;
  children: ReactNode;
};

export default function TrackedWhatsappLink({
  href,
  source,
  productId,
  productName,
  children,
  onClick,
  ...props
}: TrackedWhatsappLinkProps) {
  return (
    <a
      {...props}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={async (event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        event.preventDefault();

        await trackWhatsappClick({ source, productId, productName });
        console.info("Abrindo WhatsApp", { source, href });
        const openedWindow = window.open(href, "_blank", "noopener,noreferrer");

        if (!openedWindow) {
          window.location.href = href;
        }
      }}
    >
      {children}
    </a>
  );
}
