"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Copy, ExternalLink, FileUp, ImagePlus, Save, Trash2 } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import {
  CATALOG_BUCKET,
  CATALOG_MAX_FILE_SIZE,
  catalogStatuses,
  getCatalogStoragePathFromUrl,
  isValidCatalogPdfUrl,
  sanitizeCatalogFileName,
} from "@/lib/catalogs";
import { formatFileSize } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import type { Catalog, CatalogPayload, CatalogStatus } from "@/types/catalog";

type CatalogFormProps = {
  mode: "create" | "edit";
};

type CatalogFormState = {
  title: string;
  description: string;
  language: string;
  status: CatalogStatus;
  is_active: boolean;
  pdf_url: string;
  file_name: string;
  file_size: number | null;
  cover_image_url: string;
};

const initialState: CatalogFormState = {
  title: "",
  description: "",
  language: "pt-BR",
  status: "draft",
  is_active: false,
  pdf_url: "",
  file_name: "",
  file_size: null,
  cover_image_url: "",
};

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function CatalogForm({ mode }: CatalogFormProps) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const catalogId = params.id;
  const [form, setForm] = useState<CatalogFormState>(initialState);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !catalogId) {
      return;
    }

    async function loadCatalog() {
      setIsLoading(true);
      setError("");

      const { data, error: loadError } = await supabase
        .from("catalogs")
        .select("*")
        .eq("id", catalogId)
        .single<Catalog>();

      if (loadError || !data) {
        setError("Não foi possível carregar este catálogo.");
        setIsLoading(false);
        return;
      }

      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        language: data.language ?? "pt-BR",
        status: data.status ?? "draft",
        is_active: Boolean(data.is_active),
        pdf_url: data.pdf_url ?? "",
        file_name: data.file_name ?? "",
        file_size: data.file_size ?? null,
        cover_image_url: data.cover_image_url ?? "",
      });
      setOriginalPdfUrl(data.pdf_url ?? null);
      setIsLoading(false);
    }

    loadCatalog();
  }, [mode, catalogId]);

  function updateField<K extends keyof CatalogFormState>(field: K, value: CatalogFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setError("");
    setMessage("");

    if (!file) {
      setPdfFile(null);
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Selecione um arquivo PDF valido.");
      setPdfFile(null);
      return;
    }

    if (file.size > CATALOG_MAX_FILE_SIZE) {
      setError(`O PDF deve ter no maximo ${formatFileSize(CATALOG_MAX_FILE_SIZE)}.`);
      setPdfFile(null);
      return;
    }

    setPdfFile(file);
    setForm((current) => ({
      ...current,
      file_name: file.name,
      file_size: file.size,
    }));
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCoverFile(event.target.files?.[0] ?? null);
  }

  async function uploadPdfFile(file: File) {
    const fileName = sanitizeCatalogFileName(file.name);
    const filePath = `${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage.from(CATALOG_BUCKET).upload(filePath, file, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      throw new Error("Não foi possível enviar o arquivo.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(filePath);

    return publicUrl;
  }

  async function uploadPdf() {
    if (!pdfFile) {
      return form.pdf_url.trim() || null;
    }

    setIsUploadingPdf(true);
    try {
      return await uploadPdfFile(pdfFile);
    } finally {
      setIsUploadingPdf(false);
    }
  }

  async function uploadCover() {
    if (!coverFile) {
      return form.cover_image_url.trim() || null;
    }

    const fileName = sanitizeCatalogFileName(coverFile.name);
    const filePath = `images/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage.from("media-library").upload(filePath, coverFile, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      throw new Error("Nao foi possivel enviar a imagem de capa.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media-library").getPublicUrl(filePath);

    return publicUrl;
  }

  async function removeCatalogPdf(url?: string | null) {
    const path = getCatalogStoragePathFromUrl(url);
    if (!path) return;

    await supabase.storage.from(CATALOG_BUCKET).remove([path]);
  }

  async function copyPdfUrl() {
    if (!form.pdf_url) return;
    await navigator.clipboard.writeText(form.pdf_url);
    setMessage("Link do PDF copiado.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("O título do catálogo é obrigatório.");
      return;
    }

    setIsSaving(true);

    try {
      const [pdfUrl, coverImageUrl] = await Promise.all([uploadPdf(), uploadCover()]);
      const willBePublished = form.status === "published";
      const willBeActive = willBePublished && form.is_active;

      if (willBePublished && !isValidCatalogPdfUrl(pdfUrl)) {
        throw new Error("Para publicar, envie ou selecione um PDF valido.");
      }

      if (willBeActive) {
        let deactivateQuery = supabase.from("catalogs").update({ is_active: false });
        if (mode === "edit" && catalogId) {
          deactivateQuery = deactivateQuery.neq("id", catalogId);
        }
        await deactivateQuery;
      }

      const payload: CatalogPayload = {
        title: form.title.trim(),
        description: toNullable(form.description),
        language: form.language.trim() || "pt-BR",
        status: form.status || "draft",
        is_active: willBeActive,
        pdf_url: pdfUrl,
        file_name: pdfFile?.name ?? toNullable(form.file_name),
        file_size: pdfFile?.size ?? form.file_size,
        cover_image_url: coverImageUrl,
      };

      const request =
        mode === "edit" && catalogId
          ? supabase.from("catalogs").update(payload).eq("id", catalogId).select("*").single<Catalog>()
          : supabase.from("catalogs").insert(payload).select("*").single<Catalog>();

      const { data: savedCatalog, error: saveError } = await request;

      if (saveError || !savedCatalog) {
        throw saveError;
      }

      if (pdfFile && originalPdfUrl && originalPdfUrl !== savedCatalog.pdf_url) {
        await removeCatalogPdf(originalPdfUrl);
      }

      router.replace(`/admin/catalogos?success=${mode === "edit" ? "updated" : "created"}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o catálogo.");
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!catalogId || !window.confirm("Tem certeza que deseja excluir este catálogo?")) {
      return;
    }

    setIsDeleting(true);
    const { error: deleteError } = await supabase.from("catalogs").delete().eq("id", catalogId);

    if (deleteError) {
      setError("Não foi possível excluir o catálogo.");
      setIsDeleting(false);
      return;
    }

    await removeCatalogPdf(form.pdf_url);
    router.replace("/admin/catalogos?success=deleted");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
        Carregando catálogo
      </div>
    );
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Título *
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="Catálogo comercial TopMax"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Idioma
            <input
              value={form.language}
              onChange={(event) => updateField("language", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="pt-BR"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Status
            <select
              value={form.status}
              onChange={(event) => {
                const status = event.target.value as CatalogStatus;
                updateField("status", status);
                if (status !== "published") {
                  updateField("is_active", false);
                }
              }}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
            >
              {catalogStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-4">
            <span>
              <span className="block text-sm font-semibold text-neutral-800">Catálogo ativo</span>
              <span className="mt-1 block text-xs leading-5 text-neutral-500">
                O site público usa somente o catálogo publicado e ativo mais recente.
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.is_active}
              disabled={form.status !== "published"}
              onChange={(event) => updateField("is_active", event.target.checked)}
              className="h-5 w-5 accent-[#d6b46a] disabled:cursor-not-allowed"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2">
            Descrição
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="min-h-32 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
              placeholder="Resumo do catálogo para uso interno"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Upload do PDF
            <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-center text-sm text-neutral-500 transition hover:border-[#d6b46a]">
              <FileUp size={28} className="text-[#9b7a3e]" />
              {isUploadingPdf ? "Enviando..." : pdfFile ? pdfFile.name : "Clique para selecionar um PDF"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={handlePdfChange}
                disabled={isSaving || isUploadingPdf}
              />
            </span>
            {form.file_name ? (
              <span className="text-xs leading-5 text-neutral-500">
                {form.file_name}
                {form.file_size ? ` - ${formatFileSize(form.file_size)}` : ""}
              </span>
            ) : null}
            {form.pdf_url ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={form.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#111] transition hover:bg-[#111] hover:text-white"
                >
                  <ExternalLink size={14} />
                  Ver PDF
                </a>
                <button
                  type="button"
                  onClick={copyPdfUrl}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#111] transition hover:bg-[#d6b46a]"
                >
                  <Copy size={14} />
                  Copiar link
                </button>
              </div>
            ) : null}
            <MediaPicker
              label="Selecionar PDF"
              folder="pdfs"
              onSelect={(url) => {
                updateField("pdf_url", url);
                updateField("file_name", decodeURIComponent(url.split("/").pop() ?? "catalogo.pdf"));
                updateField("file_size", null);
                setPdfFile(null);
              }}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Upload de imagem de capa opcional
            <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-center text-sm text-neutral-500 transition hover:border-[#d6b46a]">
              <ImagePlus size={28} className="text-[#9b7a3e]" />
              {coverFile ? coverFile.name : "Clique para selecionar uma imagem"}
              <input type="file" accept="image/*" className="sr-only" onChange={handleCoverChange} />
            </span>
            <MediaPicker
              folder="images"
              onSelect={(url) => {
                updateField("cover_image_url", url);
                setCoverFile(null);
              }}
            />
          </label>
        </div>

        {form.cover_image_url ? (
          <div className="relative mt-5 aspect-[16/9] max-w-md overflow-hidden rounded-2xl bg-neutral-200">
            <Image
              src={form.cover_image_url}
              alt={form.title || "Capa do catálogo"}
              fill
              sizes="28rem"
              className="object-cover"
            />
          </div>
        ) : null}
      </section>

      {message ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-6 text-xs font-bold uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={17} />
            {isDeleting ? "Excluindo..." : "Excluir catálogo"}
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={isSaving || isDeleting || isUploadingPdf}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {isUploadingPdf ? "Enviando..." : isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
