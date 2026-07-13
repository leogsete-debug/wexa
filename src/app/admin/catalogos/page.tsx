"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Copy, Edit3, Eye, EyeOff, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CATALOG_BUCKET,
  getCatalogStatusClasses,
  getCatalogStatusLabel,
  getCatalogStoragePathFromUrl,
  isValidCatalogPdfUrl,
} from "@/lib/catalogs";
import { formatFileSize } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import type { Catalog, CatalogStatus } from "@/types/catalog";

const successMessages: Record<string, string> = {
  created: "Catálogo cadastrado com sucesso.",
  updated: "Catálogo atualizado com sucesso.",
  deleted: "Catálogo excluído com sucesso.",
};

export default function AdminCatalogsPage() {
  const searchParams = useSearchParams();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const success = searchParams.get("success");

  async function loadCatalogs() {
    setIsLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("catalogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Não foi possível carregar os catálogos.");
      setCatalogs([]);
    } else {
      setCatalogs((data ?? []) as Catalog[]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadCatalogs();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const visibleCatalogs = useMemo(() => catalogs, [catalogs]);

  async function handleDelete(catalog: Catalog) {
    if (!window.confirm(`Excluir "${catalog.title}"?`)) {
      return;
    }

    const { error: deleteError } = await supabase.from("catalogs").delete().eq("id", catalog.id);

    if (deleteError) {
      setError("Não foi possível excluir o catálogo.");
      return;
    }

    const storagePath = getCatalogStoragePathFromUrl(catalog.pdf_url);
    if (storagePath) {
      await supabase.storage.from(CATALOG_BUCKET).remove([storagePath]);
    }

    setCatalogs((current) => current.filter((item) => item.id !== catalog.id));
  }

  async function handleToggleStatus(catalog: Catalog) {
    const nextStatus: CatalogStatus = catalog.status === "published" ? "archived" : "published";
    const nextIsActive = nextStatus === "published";

    if (nextIsActive && !isValidCatalogPdfUrl(catalog.pdf_url)) {
      setError("Envie um PDF valido antes de publicar o catálogo.");
      return;
    }

    if (nextIsActive) {
      await supabase.from("catalogs").update({ is_active: false }).neq("id", catalog.id);
    }

    const { error: updateError } = await supabase
      .from("catalogs")
      .update({ status: nextStatus, is_active: nextIsActive })
      .eq("id", catalog.id);

    if (updateError) {
      setError("Não foi possível alterar o status do catálogo.");
      return;
    }

    setCatalogs((current) =>
      current.map((item) =>
        item.id === catalog.id
          ? { ...item, status: nextStatus, is_active: nextIsActive }
          : nextIsActive
            ? { ...item, is_active: false }
            : item,
      ),
    );
  }

  async function copyUrl(url?: string | null) {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setMessage("Link do PDF copiado.");
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
              Catálogos
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
              Catálogos PDF
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Envie, publique e troque materiais comerciais em PDF usados no site público.
            </p>
          </div>

          <Link
            href="/admin/catalogos/novo"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111]"
          >
            <Plus size={17} />
            Novo Catálogo
          </Link>
        </header>

        {success && successMessages[success] ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessages[success]}
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/80 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="hidden grid-cols-[5rem_1fr_9rem_8rem_9rem_13rem] gap-4 border-b border-black/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:grid">
            <span>Capa</span>
            <span>Catálogo</span>
            <span>Status</span>
            <span>Ativo</span>
            <span>Idioma</span>
            <span>Ações</span>
          </div>

          {isLoading ? (
            <div className="px-5 py-10 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Carregando catálogos
            </div>
          ) : visibleCatalogs.length === 0 ? (
            <div className="px-5 py-10 text-sm leading-6 text-neutral-600">
              Nenhum catálogo encontrado.
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {visibleCatalogs.map((catalog) => (
                <article
                  key={catalog.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[5rem_1fr_9rem_8rem_9rem_13rem] lg:items-center"
                >
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-neutral-400">
                    {catalog.cover_image_url ? (
                      <Image
                        src={catalog.cover_image_url}
                        alt={catalog.title}
                        fill
                        sizes="5rem"
                        className="object-cover"
                      />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#141414]">
                      {catalog.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {catalog.description || "Sem descrição"}
                    </p>
                    {catalog.file_name ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        {catalog.file_name}
                        {catalog.file_size ? ` - ${formatFileSize(catalog.file_size)}` : ""}
                      </p>
                    ) : null}
                    {catalog.pdf_url ? (
                      <a href={catalog.pdf_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-semibold text-[#9b7a3e] underline">
                        Ver PDF
                      </a>
                    ) : null}
                  </div>

                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${getCatalogStatusClasses(catalog.status)}`}>
                    {getCatalogStatusLabel(catalog.status)}
                  </span>

                  <span className="text-sm font-semibold text-neutral-600">{catalog.is_active ? "Sim" : "Não"}</span>

                  <span className="text-sm font-semibold text-neutral-600">{catalog.language}</span>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/catalogos/${catalog.id}/editar`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#111] transition hover:bg-[#111] hover:text-white"
                    >
                      <Edit3 size={15} />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(catalog)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[#111] transition hover:bg-[#d6b46a]"
                      aria-label={catalog.status === "published" ? "Ocultar catálogo" : "Publicar catálogo"}
                    >
                      {catalog.status === "published" ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {catalog.pdf_url ? (
                      <button
                        type="button"
                        onClick={() => copyUrl(catalog.pdf_url)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[#111] transition hover:bg-[#d6b46a]"
                        aria-label="Copiar link"
                      >
                        <Copy size={15} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleDelete(catalog)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-3 text-red-700 transition hover:bg-red-600 hover:text-white"
                      aria-label="Excluir catálogo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
