"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Save, Trash2 } from "lucide-react";
import { createSlug, productStatuses } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import type { Product, ProductPayload, ProductStatus } from "@/types/product";

type ProductFormProps = {
  mode: "create" | "edit";
};

type ProductFormState = {
  name: string;
  category: string;
  short_description: string;
  full_description: string;
  material: string;
  origin: string;
  status: ProductStatus;
  featured: boolean;
  sort_order: string;
  main_image_url: string;
};

const initialState: ProductFormState = {
  name: "",
  category: "",
  short_description: "",
  full_description: "",
  material: "",
  origin: "",
  status: "draft",
  featured: false,
  sort_order: "0",
  main_image_url: "",
};

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({ mode }: ProductFormProps) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const productId = params.id;
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const slug = useMemo(() => createSlug(form.name), [form.name]);

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      return;
    }

    async function loadProduct() {
      setIsLoading(true);
      setError("");

      const { data, error: loadError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single<Product>();

      if (loadError || !data) {
        setError("Não foi possível carregar este produto.");
        setIsLoading(false);
        return;
      }

      setForm({
        name: data.name ?? "",
        category: data.category ?? "",
        short_description: data.short_description ?? "",
        full_description: data.full_description ?? "",
        material: data.material ?? "",
        origin: data.origin ?? "",
        status: data.status ?? "draft",
        featured: data.featured ?? false,
        sort_order: String(data.sort_order ?? 0),
        main_image_url: data.main_image_url ?? "",
      });
      setIsLoading(false);
    }

    loadProduct();
  }, [mode, productId]);

  function updateField<K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFile(event.target.files?.[0] ?? null);
  }

  async function uploadImage() {
    if (!imageFile) {
      return form.main_image_url.trim() || null;
    }

    const baseSlug = slug || "produto";
    const fileName = sanitizeFileName(imageFile.name);
    const filePath = `${baseSlug}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Não foi possível enviar a imagem principal.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("O nome do produto é obrigatório.");
      return;
    }

    if (!slug) {
      setError("Informe um nome válido para gerar o slug do produto.");
      return;
    }

    setIsSaving(true);

    try {
      const imageUrl = await uploadImage();
      const payload: ProductPayload = {
        name: form.name.trim(),
        slug,
        category: toNullable(form.category),
        short_description: toNullable(form.short_description),
        full_description: toNullable(form.full_description),
        material: toNullable(form.material),
        origin: toNullable(form.origin),
        status: form.status || "draft",
        featured: form.featured,
        sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
        main_image_url: imageUrl,
      };

      const request =
        mode === "edit" && productId
          ? supabase.from("products").update(payload).eq("id", productId)
          : supabase.from("products").insert(payload);

      const { error: saveError } = await request;

      if (saveError) {
        throw saveError;
      }

      router.replace(`/admin/produtos?success=${mode === "edit" ? "updated" : "created"}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o produto.");
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId || !window.confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    setIsDeleting(true);
    const { error: deleteError } = await supabase.from("products").delete().eq("id", productId);

    if (deleteError) {
      setError("Não foi possível excluir o produto.");
      setIsDeleting(false);
      return;
    }

    router.replace("/admin/produtos?success=deleted");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
        Carregando produto
      </div>
    );
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Nome *
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="Nome do produto"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Categoria
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="Ex.: Agronegócio"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2">
            Slug automático
            <input
              value={slug}
              readOnly
              className="h-12 rounded-2xl border border-black/10 bg-neutral-100 px-4 text-sm text-neutral-500 outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2">
            Descrição curta
            <textarea
              value={form.short_description}
              onChange={(event) => updateField("short_description", event.target.value)}
              className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
              placeholder="Resumo comercial do produto"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2">
            Descrição completa
            <textarea
              value={form.full_description}
              onChange={(event) => updateField("full_description", event.target.value)}
              className="min-h-40 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
              placeholder="Detalhes, diferenciais, uso comercial e informações adicionais"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Material
            <input
              value={form.material}
              onChange={(event) => updateField("material", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="Ex.: Madeira, alimento, insumo"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Origem
            <input
              value={form.origin}
              onChange={(event) => updateField("origin", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="Ex.: Brasil"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Status
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as ProductStatus)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
            >
              {productStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Ordem
            <input
              type="number"
              value={form.sort_order}
              onChange={(event) => updateField("sort_order", event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
              placeholder="0"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm font-semibold text-neutral-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => updateField("featured", event.target.checked)}
              className="h-4 w-4 accent-[#d6b46a]"
            />
            Produto em destaque
          </label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-start">
          <label className="grid gap-2 text-sm font-semibold text-neutral-700">
            Upload de imagem principal
            <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-4 py-6 text-center text-sm text-neutral-500 transition hover:border-[#d6b46a]">
              <ImagePlus size={28} className="text-[#9b7a3e]" />
              {imageFile ? imageFile.name : "Clique para selecionar uma imagem"}
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
            </span>
          </label>

          {form.main_image_url ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-200">
              <Image
                src={form.main_image_url}
                alt={form.name || "Imagem do produto"}
                fill
                sizes="18rem"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400">
              Sem imagem
            </div>
          )}
        </div>
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
            {isDeleting ? "Excluindo..." : "Excluir produto"}
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
