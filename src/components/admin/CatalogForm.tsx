"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FileUp, ImagePlus, Save, Trash2 } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { catalogStatuses, sanitizeCatalogFileName } from "@/lib/catalogs";
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
  pdf_url: string;
  cover_image_url: string;
};

const initialState: CatalogFormState = {
  title: "",
  description: "",
  language: "pt-BR",
  status: "draft",
  pdf_url: "",
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
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
        setError("Nao foi possivel carregar este catalogo.");
        setIsLoading(false);
        return;
      }

      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        language: data.language ?? "pt-BR",
        status: data.status ?? "draft",
        pdf_url: data.pdf_url ?? "",
        cover_image_url: data.cover_image_url ?? "",
      });
      setIsLoading(false);
    }

    loadCatalog();
  }, [mode, catalogId]);

  function updateField<K extends keyof CatalogFormState>(field: K, value: CatalogFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    setPdfFile(event.target.files?.[0] ?? null);
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCoverFile(event.target.files?.[0] ?? null);
  }

  async function uploadFile(file: File, folder: string) {
    const fileName = sanitizeCatalogFileName(file.name);
    const filePath = `${folder}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage.from("catalog-files").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      throw new Error("Nao foi possivel enviar o arquivo.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("catalog-files").getPublicUrl(filePath);

    return publicUrl;
  }

  async function uploadPdf() {
    if (!pdfFile) {
      return form.pdf_url.trim() || null;
    }

    return uploadFile(pdfFile, "pdfs");
  }

  async function uploadCover() {
    if (!coverFile) {
      return form.cover_image_url.trim() || null;
    }

    return uploadFile(coverFile, "covers");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("O titulo do catalogo e obrigatorio.");
      return;
    }

    setIsSaving(true);

    try {
      const [pdfUrl, coverImageUrl] = await Promise.all([uploadPdf(), uploadCover()]);
      const payload: CatalogPayload = {
        title: form.title.trim(),
        description: toNullable(form.description),
        language: form.language.trim() || "pt-BR",
        status: form.status || "draft",
        pdf_url: pdfUrl,
        cover_image_url: coverImageUrl,
      };

      const request =
        mode === "edit" && catalogId
          ? supabase.from("catalogs").update(payload).eq("id", catalogId)
          : supabase.from("catalogs").insert(payload);

      const { error: saveError } = await request;

      if (saveError) {
        throw saveError;
      }

      router.replace(`/admin/catalogos?success=${mode === "edit" ? "updated" : "created"}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nao foi possivel salvar o catalogo.");
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!catalogId || !window.confirm("Tem certeza que deseja excluir este catalogo?")) {
      return;
    }

    setIsDeleting(true);
    const { error: deleteError } = await supabase.from("catalogs").delete().eq("id", catalogId);

    if (deleteError) {
      setError("Nao foi possivel excluir o catalogo.");
      setIsDeleting(false);
      return;
    }

    router.replace("/admin/catalogos?success=deleted");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
        Carregando catalogo
      </div>
    );
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Titulo *
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="Catalogo comercial TopMax"
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
              onChange={(event) => updateField("status", event.target.value as CatalogStatus)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
            >
              {catalogStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2">
            Descricao
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="min-h-32 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
              placeholder="Resumo do catalogo para uso interno"
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
              {pdfFile ? pdfFile.name : "Clique para selecionar um PDF"}
              <input type="file" accept="application/pdf" className="sr-only" onChange={handlePdfChange} />
            </span>
            {form.pdf_url ? (
              <a href={form.pdf_url} target="_blank" className="text-xs font-semibold text-[#9b7a3e] underline">
                Ver PDF atual
              </a>
            ) : null}
            <MediaPicker
              label="Selecionar PDF"
              folder="pdfs"
              onSelect={(url) => {
                updateField("pdf_url", url);
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
              alt={form.title || "Capa do catalogo"}
              fill
              sizes="28rem"
              className="object-cover"
            />
          </div>
        ) : null}
      </section>

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
            {isDeleting ? "Excluindo..." : "Excluir catalogo"}
          </button>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={isSaving || isDeleting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
