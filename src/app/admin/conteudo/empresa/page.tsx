"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { fallbackCompanyContent } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import type { CompanyContent } from "@/types/content";

type Field = {
  name: keyof CompanyContent;
  label: string;
  textarea?: boolean;
};

const fields: Field[] = [
  { name: "company_name", label: "Nome da empresa" },
  { name: "section_title", label: "Titulo da secao" },
  { name: "section_subtitle", label: "Subtitulo", textarea: true },
  { name: "full_text", label: "Texto completo", textarea: true },
  { name: "mission", label: "Missao", textarea: true },
  { name: "vision", label: "Visao", textarea: true },
  { name: "values", label: "Valores", textarea: true },
  { name: "differentials", label: "Diferenciais", textarea: true },
  { name: "stat_20", label: "20+" },
  { name: "stat_35", label: "35+" },
  { name: "stat_500", label: "500+" },
  { name: "stat_100", label: "100%" },
  { name: "main_image_url", label: "Imagem principal" },
  { name: "secondary_image_url", label: "Imagem secundaria" },
];

export default function CompanyContentPage() {
  const [form, setForm] = useState<CompanyContent>(fallbackCompanyContent);
  const [recordId, setRecordId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const { data, error: loadError } = await supabase
        .from("company_content")
        .select("*")
        .limit(1)
        .maybeSingle<CompanyContent>();

      if (!loadError && data) {
        setForm({ ...fallbackCompanyContent, ...data });
        setRecordId(data.id);
      }

      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function updateField(field: keyof CompanyContent, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const payload = {
      company_name: form.company_name,
      section_title: form.section_title,
      section_subtitle: form.section_subtitle,
      full_text: form.full_text,
      mission: form.mission,
      vision: form.vision,
      values: form.values,
      differentials: form.differentials,
      stat_20: form.stat_20,
      stat_35: form.stat_35,
      stat_500: form.stat_500,
      stat_100: form.stat_100,
      main_image_url: form.main_image_url,
      secondary_image_url: form.secondary_image_url,
    };

    const request = recordId
      ? supabase.from("company_content").update(payload).eq("id", recordId).select("*").single<CompanyContent>()
      : supabase.from("company_content").insert(payload).select("*").single<CompanyContent>();

    const { data, error: saveError } = await request;

    if (saveError || !data) {
      setError("Nao foi possivel salvar o conteudo da empresa.");
      setIsSaving(false);
      return;
    }

    setForm({ ...fallbackCompanyContent, ...data });
    setRecordId(data.id);
    setMessage("Conteudo salvo com sucesso.");
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-black/10 pb-8">
          <Link href="/admin" className="text-sm font-semibold text-[#9b7a3e] transition hover:text-[#111]">
            Voltar para o painel
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
            Conteudo: Empresa
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Edite textos, estatisticas e imagens da secao institucional.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
            Carregando conteudo
          </div>
        ) : (
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="grid gap-5 lg:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className={field.textarea ? "grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2" : "grid gap-2 text-sm font-semibold text-neutral-700"}>
                    {field.label}
                    {field.textarea ? (
                      <textarea
                        value={String(form[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
                      />
                    ) : (
                      <input
                        value={String(form[field.name] ?? "")}
                        onChange={(event) => updateField(field.name, event.target.value)}
                        className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
                      />
                    )}
                    {field.name === "main_image_url" || field.name === "secondary_image_url" ? (
                      <MediaPicker folder="images" onSelect={(url) => updateField(field.name, url)} />
                    ) : null}
                  </label>
                ))}
              </div>
            </section>

            {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <div className="flex justify-end">
              <button type="submit" disabled={isSaving} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={17} />
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
