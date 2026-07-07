import { createClient } from "@supabase/supabase-js";
import type { Catalog, CatalogStatus } from "@/types/catalog";

export const catalogStatuses: Array<{
  value: CatalogStatus;
  label: string;
}> = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "hidden", label: "Oculto" },
];

export function getCatalogStatusLabel(status: CatalogStatus) {
  return catalogStatuses.find((item) => item.value === status)?.label ?? status;
}

export function getCatalogStatusClasses(status: CatalogStatus) {
  if (status === "published") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "hidden") {
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
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Catalog>();

  if (error || !data) {
    return null;
  }

  return data;
}
