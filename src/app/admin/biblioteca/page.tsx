"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Eye, FileText, Search, Trash2, Upload, X } from "lucide-react";
import {
  formatFileSize,
  getDefaultMediaFolder,
  getMediaFileType,
  isPreviewableImage,
  mediaAccept,
  mediaFilters,
  sanitizeMediaFileName,
} from "@/lib/media";
import { supabase } from "@/lib/supabase";
import type { MediaFolder, MediaItem, MediaPayload } from "@/types/media";

export default function MediaLibraryPage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("tipo") as MediaFolder | null;
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<"all" | MediaFolder>(initialFilter ?? "all");
  const [search, setSearch] = useState("");
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>("images");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    setError("");

    let query = supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("folder", filter);
    }

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error: loadError } = await query;

    if (loadError) {
      setError("Nao foi possivel carregar a biblioteca.");
      setItems([]);
    } else {
      setItems((data ?? []) as MediaItem[]);
    }

    setIsLoading(false);
  }, [filter, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadMedia();
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [loadMedia]);

  const visibleItems = useMemo(() => items, [items]);

  async function copyUrl(url?: string | null) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setMessage("URL copiada.");
  }

  async function deleteItem(item: MediaItem) {
    if (!window.confirm(`Excluir "${item.name || item.file_name}"?`)) return;

    const { error: deleteError } = await supabase.from("media_library").delete().eq("id", item.id);

    if (deleteError) {
      setError("Nao foi possivel excluir o arquivo.");
      return;
    }

    setItems((current) => current.filter((media) => media.id !== item.id));
    setSelected(null);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsUploading(true);
    setError("");
    setMessage("");

    const folder = uploadFolder || getDefaultMediaFolder(file);
    const fileName = sanitizeMediaFileName(file.name);
    const filePath = `${folder}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage.from("media-library").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      setError("Nao foi possivel enviar o arquivo.");
      setIsUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media-library").getPublicUrl(filePath);

    const payload: MediaPayload = {
      name: file.name.replace(/\.[^/.]+$/, ""),
      file_name: file.name,
      file_type: getMediaFileType(file, folder),
      mime_type: file.type || "application/octet-stream",
      file_url: publicUrl,
      folder,
      size: file.size,
      alt_text: null,
    };

    const { error: insertError } = await supabase.from("media_library").insert(payload);

    if (insertError) {
      setError("Arquivo enviado, mas nao foi possivel registrar na biblioteca.");
      setIsUploading(false);
      return;
    }

    setMessage("Arquivo enviado com sucesso.");
    await loadMedia();
    setIsUploading(false);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
              Biblioteca
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
              Biblioteca de Midia
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Centralize imagens, videos, PDFs e logos reutilizaveis em todo o CMS.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={uploadFolder}
              onChange={(event) => setUploadFolder(event.target.value as MediaFolder)}
              className="h-12 rounded-full border border-black/10 bg-white px-5 text-sm outline-none"
            >
              <option value="images">Imagens</option>
              <option value="videos">Videos</option>
              <option value="pdfs">PDFs</option>
              <option value="logos">Logos</option>
            </select>
            <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111]">
              <Upload size={17} />
              {isUploading ? "Enviando..." : "Enviar Arquivo"}
              <input type="file" accept={mediaAccept} className="sr-only" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </header>

        <section className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-4 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4">
              <Search size={18} className="text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Pesquisar por nome"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {mediaFilters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={
                    filter === item.value
                      ? "h-10 rounded-full bg-[#111] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
                      : "h-10 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-600"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {message ? <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/80 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          {isLoading ? (
            <div className="px-5 py-10 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Carregando arquivos
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="px-5 py-10 text-sm leading-6 text-neutral-600">Nenhum arquivo encontrado.</div>
          ) : (
            <div className="divide-y divide-black/10">
              {visibleItems.map((item) => (
                <article key={item.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[5rem_1fr_8rem_8rem_10rem_14rem] lg:items-center">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-neutral-400"
                  >
                    {item.file_url && isPreviewableImage(item.mime_type) ? (
                      <Image src={item.file_url} alt={item.alt_text || item.name || "Midia"} fill sizes="5rem" className="object-cover" />
                    ) : (
                      <FileText size={24} />
                    )}
                  </button>

                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#141414]">{item.name || item.file_name}</h2>
                    <p className="mt-1 break-all text-xs text-neutral-500">{item.file_url}</p>
                  </div>

                  <span className="text-sm font-semibold capitalize text-neutral-600">{item.file_type}</span>
                  <span className="text-sm text-neutral-600">{formatFileSize(item.size)}</span>
                  <span className="text-sm text-neutral-500">{item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : "-"}</span>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSelected(item)} className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 transition hover:bg-[#111] hover:text-white" aria-label="Visualizar">
                      <Eye size={15} />
                    </button>
                    <button type="button" onClick={() => copyUrl(item.file_url)} className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 transition hover:bg-[#d6b46a]" aria-label="Copiar URL">
                      <Copy size={15} />
                    </button>
                    <button type="button" onClick={() => deleteItem(item)} className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-3 text-red-700 transition hover:bg-red-600 hover:text-white" aria-label="Excluir">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-[#fbfaf7] shadow-[0_40px_120px_rgba(0,0,0,0.32)]">
            <header className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">{selected.name || selected.file_name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{formatFileSize(selected.size)}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white" aria-label="Fechar">
                <X size={18} />
              </button>
            </header>

            <div className="p-5">
              <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
                {selected.file_url && isPreviewableImage(selected.mime_type) ? (
                  <Image src={selected.file_url} alt={selected.alt_text || selected.name || "Midia"} width={1200} height={800} className="max-h-[58vh] w-auto object-contain" />
                ) : (
                  <FileText size={56} className="text-neutral-400" />
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => copyUrl(selected.file_url)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111]">
                  <Copy size={16} />
                  Copiar URL
                </button>
                <button type="button" onClick={() => deleteItem(selected)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-6 text-xs font-bold uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-600 hover:text-white">
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
