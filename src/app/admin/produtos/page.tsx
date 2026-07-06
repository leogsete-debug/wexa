"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Edit3, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getStatusClasses, getStatusLabel, productStatuses } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import type { Product, ProductStatus } from "@/types/product";

const successMessages: Record<string, string> = {
  created: "Produto cadastrado com sucesso.",
  updated: "Produto atualizado com sucesso.",
  deleted: "Produto excluído com sucesso.",
};

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const success = searchParams.get("success");

  async function loadProducts() {
    setIsLoading(true);
    setError("");

    let query = supabase.from("products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error: loadError } = await query;

    if (loadError) {
      setError("Não foi possível carregar os produtos.");
      setProducts([]);
    } else {
      setProducts((data ?? []) as Product[]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadProducts();
    }, 0);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const visibleProducts = useMemo(() => products, [products]);

  async function handleSearch() {
    await loadProducts();
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Excluir "${product.name}"?`)) {
      return;
    }

    const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);

    if (deleteError) {
      setError("Não foi possível excluir o produto.");
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
  }

  async function handleToggleStatus(product: Product) {
    const nextStatus: ProductStatus = product.status === "published" ? "hidden" : "published";
    const { error: updateError } = await supabase
      .from("products")
      .update({ status: nextStatus })
      .eq("id", product.id);

    if (updateError) {
      setError("Não foi possível alterar o status do produto.");
      return;
    }

    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, status: nextStatus } : item)),
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
              Produtos
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
              Produtos editáveis
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Cadastre, publique, oculte e organize produtos do catálogo administrativo.
            </p>
          </div>

          <Link
            href="/admin/produtos/novo"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111]"
          >
            <Plus size={17} />
            Novo Produto
          </Link>
        </header>

        {success && successMessages[success] ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessages[success]}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-4 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_14rem_auto]">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4">
              <Search size={18} className="text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Buscar por nome"
              />
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | ProductStatus)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
            >
              <option value="all">Todos os status</option>
              {productStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="h-12 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111]"
            >
              Buscar
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/80 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="hidden grid-cols-[5rem_1fr_10rem_8rem_12rem] gap-4 border-b border-black/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:grid">
            <span>Imagem</span>
            <span>Produto</span>
            <span>Status</span>
            <span>Ordem</span>
            <span>Ações</span>
          </div>

          {isLoading ? (
            <div className="px-5 py-10 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Carregando produtos
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="px-5 py-10 text-sm leading-6 text-neutral-600">
              Nenhum produto encontrado.
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[5rem_1fr_10rem_8rem_12rem] lg:items-center"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-neutral-100">
                    {product.main_image_url ? (
                      <Image
                        src={product.main_image_url}
                        alt={product.name}
                        fill
                        sizes="5rem"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#141414]">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">{product.category || "Sem categoria"}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {product.short_description || "Sem descrição curta"}
                    </p>
                  </div>

                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${getStatusClasses(product.status)}`}>
                    {getStatusLabel(product.status)}
                  </span>

                  <span className="text-sm font-semibold text-neutral-600">{product.sort_order}</span>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/produtos/${product.id}/editar`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#111] transition hover:bg-[#111] hover:text-white"
                    >
                      <Edit3 size={15} />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(product)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[#111] transition hover:bg-[#d6b46a]"
                      aria-label={product.status === "published" ? "Ocultar produto" : "Publicar produto"}
                    >
                      {product.status === "published" ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-3 text-red-700 transition hover:bg-red-600 hover:text-white"
                      aria-label="Excluir produto"
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
