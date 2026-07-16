"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { supabase } from "@/lib/supabase";
import type { MarketContent } from "@/types/content";

type MarketForm = {
  id?: string;
  name: string;
  name_zh: string;
  description: string;
  description_zh: string;
  icon: string;
  country: string;
  continent: string;
  image_url: string;
  sort_order: string;
  published: boolean;
};

const initialForm: MarketForm = {
  name: "",
  name_zh: "",
  description: "",
  description_zh: "",
  icon: "globe",
  country: "",
  continent: "",
  image_url: "",
  sort_order: "0",
  published: true,
};

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function MarketsContentPage() {
  const [markets, setMarkets] = useState<MarketContent[]>([]);
  const [form, setForm] = useState<MarketForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadMarkets() {
    const { data, error: loadError } = await supabase
      .from("markets")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Não foi possível carregar os mercados.");
    } else {
      setMarkets((data ?? []) as MarketContent[]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadMarkets();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function editMarket(market: MarketContent) {
    setForm({
      id: market.id,
      name: market.name ?? "",
      name_zh: market.name_zh ?? "",
      description: market.description ?? "",
      description_zh: market.description_zh ?? "",
      icon: market.icon ?? "globe",
      country: market.country ?? "",
      continent: market.continent ?? "",
      image_url: market.image_url ?? "",
      sort_order: String(market.sort_order ?? 0),
      published: market.published ?? true,
    });
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("O nome do mercado é obrigatório.");
      return;
    }

    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      name_zh: toNullable(form.name_zh),
      description: toNullable(form.description),
      description_zh: toNullable(form.description_zh),
      icon: toNullable(form.icon),
      country: toNullable(form.country),
      continent: toNullable(form.continent),
      image_url: toNullable(form.image_url),
      sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
      published: form.published,
    };

    const { error: saveError } = form.id
      ? await supabase.from("markets").update(payload).eq("id", form.id)
      : await supabase.from("markets").insert(payload);

    if (saveError) {
      setError("Não foi possível salvar o mercado.");
      setIsSaving(false);
      return;
    }

    setMessage(form.id ? "Mercado atualizado com sucesso." : "Mercado criado com sucesso.");
    resetForm();
    await loadMarkets();
    setIsSaving(false);
  }

  async function handleDelete(market: MarketContent) {
    if (!window.confirm(`Excluir "${market.name}"?`)) return;

    const { error: deleteError } = await supabase.from("markets").delete().eq("id", market.id);
    if (deleteError) {
      setError("Não foi possível excluir o mercado.");
      return;
    }

    setMarkets((current) => current.filter((item) => item.id !== market.id));
  }

  async function togglePublished(market: MarketContent) {
    const { error: updateError } = await supabase
      .from("markets")
      .update({ published: !market.published })
      .eq("id", market.id);

    if (updateError) {
      setError("Não foi possível alterar a publicação.");
      return;
    }

    setMarkets((current) =>
      current.map((item) => (item.id === market.id ? { ...item, published: !item.published } : item)),
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-black/10 pb-8">
          <Link href="/admin" className="text-sm font-semibold text-[#9b7a3e] transition hover:text-[#111]">
            Voltar para o painel
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
            Conteúdo: Mercados
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">{form.id ? "Editar mercado" : "Adicionar mercado"}</h2>
            {[
              ["name", "Nome"],
              ["name_zh", "Nome em chinês"],
              ["description", "Descrição"],
              ["description_zh", "Descrição em chinês"],
              ["icon", "Ícone"],
              ["country", "País"],
              ["continent", "Continente"],
              ["image_url", "Imagem"],
              ["sort_order", "Ordem"],
            ].map(([name, label]) => (
              <label key={name} className="grid gap-2 text-sm font-semibold text-neutral-700">
                {label}
                <input
                  value={String(form[name as keyof MarketForm] ?? "")}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
                />
                {name === "image_url" ? (
                  <MediaPicker
                    folder="images"
                    onSelect={(url) => setForm((current) => ({ ...current, image_url: url }))}
                  />
                ) : null}
              </label>
            ))}
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold text-neutral-700">
              <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} className="h-4 w-4 accent-[#d6b46a]" />
              Publicado
            </label>
            {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
            <div className="flex gap-3">
              <button type="submit" disabled={isSaving} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#111] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-60">
                {form.id ? <Save size={17} /> : <Plus size={17} />}
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
              {form.id ? <button type="button" onClick={resetForm} className="h-12 rounded-full border border-black/10 bg-white px-5 text-xs font-bold uppercase tracking-[0.12em]">Novo</button> : null}
            </div>
          </form>

          <section className="overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/80 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
            {isLoading ? (
              <div className="px-5 py-10 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">Carregando mercados</div>
            ) : markets.length === 0 ? (
              <div className="px-5 py-10 text-sm text-neutral-600">Nenhum mercado encontrado.</div>
            ) : (
              <div className="divide-y divide-black/10">
                {markets.map((market) => (
                  <article key={market.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_8rem_12rem] lg:items-center">
                    <div>
                      <h2 className="text-lg font-semibold tracking-[-0.03em]">{market.name}</h2>
                      <p className="mt-1 text-sm text-neutral-500">{[market.country, market.continent].filter(Boolean).join(" | ") || "Sem região"}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Ordem {market.sort_order}</p>
                    </div>
                    <span className={market.published ? "w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700" : "w-fit rounded-full border border-neutral-500/20 bg-neutral-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-neutral-600"}>
                      {market.published ? "Publicado" : "Oculto"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => editMarket(market)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] transition hover:bg-[#111] hover:text-white"><Edit3 size={15} />Editar</button>
                      <button type="button" onClick={() => togglePublished(market)} aria-label={market.published ? "Ocultar mercado" : "Publicar mercado"} className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 transition hover:bg-[#d6b46a]">{market.published ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      <button type="button" onClick={() => handleDelete(market)} aria-label="Excluir mercado" className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-3 text-red-700 transition hover:bg-red-600 hover:text-white"><Trash2 size={15} /></button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
