import type { MediaFileType, MediaFolder } from "@/types/media";

export const mediaFilters: Array<{
  label: string;
  value: "all" | MediaFolder;
}> = [
  { label: "Todos", value: "all" },
  { label: "Imagens", value: "images" },
  { label: "Videos", value: "videos" },
  { label: "PDFs", value: "pdfs" },
  { label: "Logos", value: "logos" },
];

export const mediaAccept = ".jpg,.jpeg,.png,.webp,.svg,.pdf,.mp4";

export function sanitizeMediaFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMediaFileType(file: File, folder: MediaFolder): MediaFileType {
  if (folder === "logos") return "logo";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "other";
}

export function getDefaultMediaFolder(file: File): MediaFolder {
  if (file.type.startsWith("video/")) return "videos";
  if (file.type === "application/pdf") return "pdfs";
  return "images";
}

export function formatFileSize(size?: number | null) {
  if (!size) return "0 KB";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function isPreviewableImage(mimeType?: string | null) {
  return Boolean(mimeType?.startsWith("image/") && mimeType !== "image/svg+xml");
}
