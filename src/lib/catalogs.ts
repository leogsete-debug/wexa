import { createClient } from "@supabase/supabase-js";
import type { Catalog, CatalogStatus } from "@/types/catalog";

export const CATALOG_BUCKET = "catalogs";
export const CATALOG_MAX_FILE_SIZE = 30 * 1024 * 1024;

export const catalogStatuses: Array<{
  value: CatalogStatus;
  label: string;
}> = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
];

export function getCatalogStatusLabel(status: CatalogStatus) {
  return catalogStatuses.find((item) => item.value === status)?.label ?? status;
}

export function getCatalogStatusClasses(status: CatalogStatus) {
  if (status === "published") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "archived") {
    return "border-neutral-500/20 bg-neutral-500/10 text-neutral-600";
  }

  return "border-[#d6b46a]/30 bg-[#d6b46a]/10 text-[#9b7a3e]";
}

export function sanitizeCatalogFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCatalogPdfUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.pathname.toLowerCase().endsWith(".pdf") ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isValidCatalogPdfUrl(value?: string | null) {
  return Boolean(normalizeCatalogPdfUrl(value));
}

export function resolveCatalogPdfUrl(latestCatalogPdfUrl?: string | null, settingsCatalogPdfUrl?: string | null) {
  return normalizeCatalogPdfUrl(latestCatalogPdfUrl) ?? normalizeCatalogPdfUrl(settingsCatalogPdfUrl);
}

export function getCatalogStoragePathFromUrl(value?: string | null) {
  if (!value) return null;

  const marker = `/storage/v1/object/public/${CATALOG_BUCKET}/`;
  const markerIndex = value.indexOf(marker);

  if (markerIndex < 0) {
    return null;
  }

  return decodeURIComponent(value.slice(markerIndex + marker.length));
}

export async function getLatestPublishedCatalog(): Promise<Catalog | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
        }),
    },
  });

  const { data, error } = await publicSupabase
    .from("catalogs")
    .select("*")
    .eq("status", "published")
    .eq("is_active", true)
    .not("pdf_url", "is", null)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Catalog>();

  if (error || !data || !isValidCatalogPdfUrl(data.pdf_url)) {
    return null;
  }

  return data;
}
