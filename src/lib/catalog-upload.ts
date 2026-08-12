import { CATALOG_BUCKET } from "@/lib/catalogs";
import { supabase } from "@/lib/supabase";

const TUS_VERSION = "1.0.0";
const TUS_CHUNK_SIZE = 6 * 1024 * 1024;
const RETRY_DELAYS = [0, 1_000, 3_000, 5_000, 10_000];

type UploadCatalogPdfOptions = {
  file: File;
  objectPath: string;
  onProgress: (percentage: number) => void;
};

function encodeMetadata(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function getTusEndpoint() {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (url.hostname.endsWith(".supabase.co")) {
    url.hostname = url.hostname.replace(/\.supabase\.co$/, ".storage.supabase.co");
  }
  url.pathname = "/storage/v1/upload/resumable";
  return url.toString();
}

async function requestWithRetry(url: string, init: RequestInit) {
  let lastError: unknown;
  for (const delay of RETRY_DELAYS) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;
      if (response.status < 500 && response.status !== 408 && response.status !== 429) {
        throw new Error(`Upload recusado pelo Storage (${response.status}).`);
      }
      lastError = new Error(`Falha temporária no Storage (${response.status}).`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Falha de conexão durante o upload.");
}

export async function uploadCatalogPdf({ file, objectPath, onProgress }: UploadCatalogPdfOptions) {
  const { data, error } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (error || !accessToken) {
    throw new Error("Sua sessão expirou. Entre novamente para enviar o catálogo.");
  }

  const endpoint = getTusEndpoint();
  const storageKey = `topmax:tus:${CATALOG_BUCKET}:${objectPath}`;
  const commonHeaders = { authorization: `Bearer ${accessToken}`, "Tus-Resumable": TUS_VERSION };
  let uploadUrl = localStorage.getItem(storageKey);
  let offset = 0;

  if (uploadUrl) {
    try {
      const head = await fetch(uploadUrl, { method: "HEAD", headers: commonHeaders });
      if (!head.ok) throw new Error("Upload anterior expirado.");
      offset = Number(head.headers.get("Upload-Offset") ?? 0);
      if (!Number.isFinite(offset) || offset < 0 || offset > file.size) throw new Error("Offset inválido.");
    } catch {
      localStorage.removeItem(storageKey);
      uploadUrl = null;
      offset = 0;
    }
  }

  if (!uploadUrl) {
    const creation = await requestWithRetry(endpoint, {
      method: "POST",
      headers: {
        ...commonHeaders,
        "Upload-Length": String(file.size),
        "Upload-Metadata": [
          `bucketName ${encodeMetadata(CATALOG_BUCKET)}`,
          `objectName ${encodeMetadata(objectPath)}`,
          `contentType ${encodeMetadata("application/pdf")}`,
          `cacheControl ${encodeMetadata("3600")}`,
        ].join(","),
      },
    });
    const location = creation.headers.get("Location");
    if (!location) throw new Error("O Storage não retornou a URL do upload.");
    uploadUrl = new URL(location, endpoint).toString();
    localStorage.setItem(storageKey, uploadUrl);
  }

  onProgress(Math.round((offset / file.size) * 100));
  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + TUS_CHUNK_SIZE, file.size));
    const response = await requestWithRetry(uploadUrl, {
      method: "PATCH",
      headers: { ...commonHeaders, "Content-Type": "application/offset+octet-stream", "Upload-Offset": String(offset) },
      body: chunk,
    });
    offset = Number(response.headers.get("Upload-Offset") ?? offset + chunk.size);
    onProgress(Math.min(100, Math.round((offset / file.size) * 100)));
  }

  localStorage.removeItem(storageKey);
  return supabase.storage.from(CATALOG_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}
