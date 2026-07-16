import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AnalyticsEventName, WhatsappEventSource } from "@/lib/analytics";

const allowedEvents = new Set<AnalyticsEventName>([
  "page_view",
  "whatsapp_click",
  "catalog_download",
  "lead_submit",
  "test_event",
]);
const allowedSources = new Set<WhatsappEventSource>([
  "header",
  "hero",
  "product",
  "catalog",
  "cta",
  "contact",
  "footer",
  "floating_button",
  "page",
  "lead_form",
  "test",
]);
const allowedLocales = new Set(["pt", "zh"]);
const allowedDeviceTypes = new Set(["mobile", "tablet", "desktop"]);

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanUuid(value: unknown) {
  const text = cleanText(value, 36);
  if (!text) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)
    ? text
    : null;
}

function cleanEnum(value: unknown, allowed: Set<string>, maxLength = 32) {
  const text = cleanText(value, maxLength);
  return text && allowed.has(text) ? text : null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ ok: false, saved: false, error: "invalid_payload" }, { status: 400 });
    }

    const eventName = cleanEnum(payload.eventName || payload.event_name || "whatsapp_click", allowedEvents);
    const eventSource = cleanEnum(payload.source, allowedSources);

    if (!eventName || !eventSource) {
      return NextResponse.json({ ok: false, saved: false, error: "invalid_event" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ ok: false, saved: false, error: "missing_supabase_env" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const eventPayload = {
      event_name: eventName,
      event_source: eventSource,
      page_path: cleanText(payload.pagePath, 180),
      locale: cleanEnum(payload.locale, allowedLocales, 8),
      product_id: cleanUuid(payload.productId),
      product_name: cleanText(payload.productName, 160),
      referrer: cleanText(payload.referrer, 240),
      utm_source: cleanText(payload.utmSource, 80),
      utm_medium: cleanText(payload.utmMedium, 80),
      utm_campaign: cleanText(payload.utmCampaign, 120),
      device_type: cleanEnum(payload.deviceType, allowedDeviceTypes, 16),
      visitor_id: cleanText(payload.visitorId, 80),
    };
    const { error } = await supabase.from("analytics_events").insert(eventPayload);

    if (error) {
      console.error("Analytics insert failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: eventPayload,
      });

      return NextResponse.json(
        { ok: false, saved: false, error: "supabase_insert_failed", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, saved: true }, { status: 201 });
  } catch (error) {
    console.error("Analytics route failed", error);
    return NextResponse.json({ ok: false, saved: false, error: "route_exception" }, { status: 500 });
  }
}
