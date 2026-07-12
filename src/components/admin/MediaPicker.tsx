"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FileText, ImageIcon, Search, X } from "lucide-react";
import { formatFileSize, isPreviewableImage } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import type { MediaFolder, MediaItem } from "@/types/media";

type MediaPickerProps = {
  label?: string;
  folder?: MediaFolder;
  onSelect: (url: string) => void;
};

export default function MediaPicker({ label = "Selecionar da Biblioteca", folder, onSelect }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(async () => {
      setIsLoading(true);

      let query = supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (folder) {
        query = query.eq("folder", folder);
      }

      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      const { data } = await query;
      setItems((data ?? []) as MediaItem[]);
      setIsLoading(false);
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [folder, isOpen, search]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#111] transition hover:bg-[#111] hover:text-white"
      >
        <ImageIcon size={15} />
        {label}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-[#fbfaf7] shadow-[0_40px_120px_rgba(0,0,0,0.32)]">
            <header className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Biblioteca de Mídia</h2>
                <p className="mt-1 text-sm text-neutral-500">Selecione um arquivo existente para reutilizar.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </header>

            <div className="p-5">
              <label className="mb-5 flex h-12 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4">
                <Search size={18} className="text-neutral-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Pesquisar por nome"
                />
              </label>

              {isLoading ? (
                <div className="py-12 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Carregando arquivos
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-sm text-neutral-600">Nenhum arquivo encontrado.</div>
              ) : (
                <div className="grid max-h-[56vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.file_url) {
                          onSelect(item.file_url);
                          setIsOpen(false);
                        }
                      }}
                      className="overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:-translate-y-1 hover:border-[#d6b46a]/50"
                    >
                      <div className="relative flex aspect-[4/3] items-center justify-center bg-neutral-100 text-neutral-400">
                        {item.file_url && isPreviewableImage(item.mime_type) ? (
                          <Image src={item.file_url} alt={item.alt_text || item.name || "Mídia"} fill sizes="16rem" className="object-cover" />
                        ) : (
                          <FileText size={28} />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-1 text-sm font-semibold text-[#111]">{item.name || item.file_name}</p>
                        <p className="mt-1 text-xs text-neutral-500">{formatFileSize(item.size)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
