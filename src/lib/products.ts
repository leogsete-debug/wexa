import type { ProductStatus } from "@/types/product";

export const productStatuses: Array<{
  value: ProductStatus;
  label: string;
}> = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "hidden", label: "Oculto" },
];

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStatusLabel(status: ProductStatus) {
  return productStatuses.find((item) => item.value === status)?.label ?? status;
}

export function getStatusClasses(status: ProductStatus) {
  if (status === "published") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "hidden") {
    return "border-neutral-500/20 bg-neutral-500/10 text-neutral-600";
  }

  return "border-[#d6b46a]/30 bg-[#d6b46a]/10 text-[#9b7a3e]";
}
