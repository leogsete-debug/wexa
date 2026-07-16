export type WhatsappEventSource =
  | "header"
  | "hero"
  | "product"
  | "catalog"
  | "cta"
  | "contact"
  | "footer"
  | "floating_button"
  | "page"
  | "lead_form"
  | "test";

export type AnalyticsEventName =
  | "page_view"
  | "whatsapp_click"
  | "catalog_download"
  | "lead_submit"
  | "test_event";

export type TrackWhatsappClickInput = {
  source: WhatsappEventSource;
  eventName?: AnalyticsEventName;
  pagePath?: string;
  locale?: "pt" | "zh";
  productId?: string | null;
  productName?: string | null;
  debug?: boolean;
};

function getDeviceType() {
  if (typeof window === "undefined") return "desktop";

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/ipad|tablet|playbook|silk/.test(userAgent)) return "tablet";
  if (/mobi|android|iphone|ipod|windows phone/.test(userAgent)) return "mobile";

  return "desktop";
}

function getLocaleFromPath(pathname: string) {
  return pathname.startsWith("/zh") ? "zh" : "pt";
}

function getVisitorId() {
  const storageKey = "topmax_visitor_id";
  const current = window.localStorage.getItem(storageKey);

  if (current) return current;

  const next =
    window.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(storageKey, next);
  return next;
}

function buildWhatsappPayload({
  source,
  eventName = "whatsapp_click",
  pagePath,
  locale,
  productId,
  productName,
}: TrackWhatsappClickInput) {
  const url = new URL(window.location.href);

  return {
    eventName,
    source,
    pagePath: pagePath || window.location.pathname,
    locale: locale || getLocaleFromPath(window.location.pathname),
    productId: productId || null,
    productName: productName || null,
    referrer: document.referrer || null,
    utmSource: url.searchParams.get("utm_source"),
    utmMedium: url.searchParams.get("utm_medium"),
    utmCampaign: url.searchParams.get("utm_campaign"),
    deviceType: getDeviceType(),
    visitorId: getVisitorId(),
  };
}

async function sendWithFetch(body: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);

    return {
      ok: response.ok && result?.ok !== false,
      saved: Boolean(result?.saved),
      status: response.status,
      result,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function sendWithBeacon(body: string) {
  if (!navigator.sendBeacon) {
    return false;
  }

  const blob = new Blob([body], { type: "application/json" });
  return navigator.sendBeacon("/api/analytics/event", blob);
}

export async function trackAnalyticsEvent({
  source,
  eventName = "whatsapp_click",
  pagePath,
  locale,
  productId,
  productName,
  debug = true,
}: TrackWhatsappClickInput) {
  if (typeof window === "undefined") return { ok: false, saved: false };

  try {
    if (debug) console.info("Analytics iniciado", { eventName, source, productId, productName });

    const payload = buildWhatsappPayload({ eventName, source, pagePath, locale, productId, productName });
    const body = JSON.stringify(payload);

    try {
      if (debug) console.info("Evento enviado", { transport: "fetch" });
      const result = await sendWithFetch(body, 1500);

      if (result.saved) {
        if (debug) console.info("Evento salvo", result);
        return result;
      }

      if (debug) console.warn("Evento enviado, mas não confirmado como salvo", result);
    } catch (error) {
      if (debug) console.warn("Falha no fetch de analytics; tentando sendBeacon", error);
    }

    const beaconQueued = sendWithBeacon(body);

    if (debug) {
      if (beaconQueued) {
        console.info("Evento enviado", { transport: "sendBeacon" });
      } else {
        console.error("Erro no analytics", { stage: "transport", reason: "fetch e sendBeacon falharam" });
      }
    }

    return { ok: beaconQueued, saved: false, transport: "sendBeacon" };
  } catch (error) {
    if (debug) console.error("Erro no analytics", { stage: "client", error });
    return { ok: false, saved: false };
  }
}

export function trackWhatsappClick(input: TrackWhatsappClickInput) {
  return trackAnalyticsEvent({ ...input, eventName: "whatsapp_click" });
}
