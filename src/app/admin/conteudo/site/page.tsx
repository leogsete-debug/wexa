"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { fallbackSiteSections, mergeSections } from "@/lib/site-content";
import { supabase } from "@/lib/supabase";
import type { SiteSection } from "@/types/content";

type EditableSection = SiteSection & {
  json: string;
};

function toEditable(section: SiteSection): EditableSection {
  return {
    ...section,
    json: JSON.stringify(section.content ?? {}, null, 2),
  };
}

export default function SiteContentPage() {
  const [sections, setSections] = useState<EditableSection[]>(fallbackSiteSections.map(toEditable));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const { data, error: loadError } = await supabase
        .from("site_sections")
        .select("*")
        .order("key", { ascending: true });

      if (!loadError) {
        setSections(mergeSections((data ?? []) as SiteSection[]).map(toEditable));
      }

      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function updateSection(key: string, patch: Partial<EditableSection>) {
    setSections((current) => current.map((section) => (section.key === key ? { ...section, ...patch } : section)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = sections.map((section) => ({
        key: section.key,
        title: section.title || section.key,
        enabled: section.enabled,
        content: JSON.parse(section.json || "{}") as Record<string, unknown>,
      }));

      const { data, error: saveError } = await supabase
        .from("site_sections")
        .upsert(payload, { onConflict: "key" })
        .select("*");

      if (saveError || !data) {
        throw saveError ?? new Error("Falha ao salvar.");
      }

      setSections(mergeSections(data as SiteSection[]).map(toEditable));
      setMessage("Conteudo das secoes salvo com sucesso.");
    } catch (saveError) {
      setError(saveError instanceof SyntaxError ? "Existe um JSON invalido. Corrija antes de salvar." : "Nao foi possivel salvar as secoes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-black/10 pb-8">
          <Link href="/admin" className="text-sm font-semibold text-[#9b7a3e] transition hover:text-[#111]">
            Voltar para o painel
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
            Conteudo do site
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Edite textos, links, listas, flags de exibicao e traducoes das secoes publicas sem alterar codigo.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
            Carregando secoes
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            {sections.map((section) => (
              <section
                key={section.key}
                className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7"
              >
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b7a3e]">{section.key}</p>
                    <input
                      value={section.title ?? ""}
                      onChange={(event) => updateSection(section.key, { title: event.target.value })}
                      className="mt-2 h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-lg font-semibold outline-none transition focus:border-[#d6b46a] sm:w-96"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(event) => updateSection(section.key, { enabled: event.target.checked })}
                      className="h-4 w-4 accent-[#d6b46a]"
                    />
                    Mostrar secao
                  </label>
                </div>

                <textarea
                  value={section.json}
                  onChange={(event) => updateSection(section.key, { json: event.target.value })}
                  spellCheck={false}
                  className="min-h-64 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 font-mono text-xs leading-5 outline-none transition focus:border-[#d6b46a]"
                />
              </section>
            ))}

            {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {isSaving ? "Salvando..." : "Salvar secoes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
