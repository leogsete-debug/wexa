"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ProcessStepContent } from "@/types/content";

type StepForm = {
  id?: string;
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  icon: string;
  sort_order: string;
  published: boolean;
};

const initialForm: StepForm = {
  title: "",
  title_zh: "",
  description: "",
  description_zh: "",
  icon: "send",
  sort_order: "0",
  published: true,
};

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function ProcessContentPage() {
  const [steps, setSteps] = useState<ProcessStepContent[]>([]);
  const [form, setForm] = useState<StepForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSteps() {
    const { data, error: loadError } = await supabase
      .from("export_process_steps")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Não foi possível carregar o processo.");
    } else {
      setSteps((data ?? []) as ProcessStepContent[]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadSteps();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function editStep(step: ProcessStepContent) {
    setForm({
      id: step.id,
      title: step.title ?? "",
      title_zh: step.title_zh ?? "",
      description: step.description ?? "",
      description_zh: step.description_zh ?? "",
      icon: step.icon ?? "send",
      sort_order: String(step.sort_order ?? 0),
      published: step.published ?? true,
    });
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      title_zh: toNullable(form.title_zh),
      description: toNullable(form.description),
      description_zh: toNullable(form.description_zh),
      icon: toNullable(form.icon),
      sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
      published: form.published,
    };

    const { error: saveError } = form.id
      ? await supabase.from("export_process_steps").update(payload).eq("id", form.id)
      : await supabase.from("export_process_steps").insert(payload);

    if (saveError) {
      setError("Não foi possível salvar a etapa.");
      setIsSaving(false);
      return;
    }

    setMessage(form.id ? "Etapa atualizada com sucesso." : "Etapa criada com sucesso.");
    resetForm();
    await loadSteps();
    setIsSaving(false);
  }

  async function handleDelete(step: ProcessStepContent) {
    if (!window.confirm(`Excluir "${step.title}"?`)) return;

    const { error: deleteError } = await supabase.from("export_process_steps").delete().eq("id", step.id);
    if (deleteError) {
      setError("Não foi possível excluir a etapa.");
      return;
    }

    setSteps((current) => current.filter((item) => item.id !== step.id));
  }

  async function togglePublished(step: ProcessStepContent) {
    const { error: updateError } = await supabase
      .from("export_process_steps")
      .update({ published: !step.published })
      .eq("id", step.id);

    if (updateError) {
      setError("Não foi possível alterar a publicação.");
      return;
    }

    setSteps((current) =>
      current.map((item) => (item.id === step.id ? { ...item, published: !item.published } : item)),
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
            Conteúdo: Processo
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">{form.id ? "Editar etapa" : "Adicionar etapa"}</h2>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Título
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Título em chinês
              <input value={form.title_zh} onChange={(event) => setForm((current) => ({ ...current, title_zh: event.target.value }))} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Descrição
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Descrição em chinês
              <textarea value={form.description_zh} onChange={(event) => setForm((current) => ({ ...current, description_zh: event.target.value }))} className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Ícone
              <select value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]">
                <option value="send">Send</option>
                <option value="clipboard">Clipboard</option>
                <option value="factory">Factory</option>
                <option value="shield">Shield</option>
                <option value="ship">Ship</option>
                <option value="package">Package</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Ordem
              <input value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]" />
            </label>
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
              <div className="px-5 py-10 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">Carregando processo</div>
            ) : steps.length === 0 ? (
              <div className="px-5 py-10 text-sm text-neutral-600">Nenhuma etapa encontrada.</div>
            ) : (
              <div className="divide-y divide-black/10">
                {steps.map((step) => (
                  <article key={step.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_8rem_12rem] lg:items-center">
                    <div>
                      <h2 className="text-lg font-semibold tracking-[-0.03em]">{step.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{step.description}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Ordem {step.sort_order} | Ícone {step.icon}</p>
                    </div>
                    <span className={step.published ? "w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700" : "w-fit rounded-full border border-neutral-500/20 bg-neutral-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-neutral-600"}>
                      {step.published ? "Publicado" : "Oculto"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => editStep(step)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] transition hover:bg-[#111] hover:text-white"><Edit3 size={15} />Editar</button>
                      <button type="button" onClick={() => togglePublished(step)} aria-label={step.published ? "Ocultar etapa" : "Publicar etapa"} className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white px-3 transition hover:bg-[#d6b46a]">{step.published ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      <button type="button" onClick={() => handleDelete(step)} aria-label="Excluir etapa" className="inline-flex h-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-3 text-red-700 transition hover:bg-red-600 hover:text-white"><Trash2 size={15} /></button>
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
