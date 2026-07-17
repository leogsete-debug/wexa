import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

function cleanRequiredText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV !== "production";

  try {
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ ok: false, saved: false, error: "invalid_payload" }, { status: 400 });
    }

    const eventName = cleanRequiredText(payload.eventName ?? payload.event_name);
    const eventSource = cleanRequiredText(payload.eventSource ?? payload.event_source ?? payload.source);

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
      created_at: new Date().toISOString(),
    };
    const supabaseResponse = await supabase.from("analytics_events").insert(eventPayload);
    const { error } = supabaseResponse;

    if (isDevelopment && eventName === "page_view") {
      console.log("Resposta do Supabase", {
        status: supabaseResponse.status,
        statusText: supabaseResponse.statusText,
        data: supabaseResponse.data,
        error: supabaseResponse.error,
      });
    }

    if (error) {
      console.error("Supabase analytics error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return Response.json(
        isDevelopment
          ? {
              success: false,
              error: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          : { success: false, error: "analytics_insert_failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, saved: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar analytics:", error);
    return NextResponse.json({ ok: false, saved: false, error: "route_exception" }, { status: 500 });
  }
}
