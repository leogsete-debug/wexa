"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { fallbackContactContent } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import type { ContactContent } from "@/types/content";

const fields: Array<{ name: keyof ContactContent; label: string; textarea?: boolean }> = [
  { name: "phone", label: "Telefone" },
  { name: "whatsapp", label: "WhatsApp" },
  { name: "email", label: "Email" },
  { name: "address", label: "Endereco", textarea: true },
  { name: "city", label: "Cidade" },
  { name: "state", label: "Estado" },
  { name: "country", label: "País" },
  { name: "google_maps", label: "Google Maps", textarea: true },
  { name: "business_hours", label: "Horario", textarea: true },
];

export default function ContactContentPage() {
  const [form, setForm] = useState<ContactContent>(fallbackContactContent);
  const [recordId, setRecordId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const { data, error: loadError } = await supabase
        .from("contact_content")
        .select("*")
        .limit(1)
        .maybeSingle<ContactContent>();

      if (!loadError && data) {
        setForm({ ...fallbackContactContent, ...data });
        setRecordId(data.id);
      }

      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function updateField(field: keyof ContactContent, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const payload = {
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      google_maps: form.google_maps,
      business_hours: form.business_hours,
    };

    const request = recordId
      ? supabase.from("contact_content").update(payload).eq("id", recordId).select("*").single<ContactContent>()
      : supabase.from("contact_content").insert(payload).select("*").single<ContactContent>();

    const { data, error: saveError } = await request;

    if (saveError || !data) {
      setError("Não foi possível salvar o contato.");
      setIsSaving(false);
      return;
    }

    setForm({ ...fallbackContactContent, ...data });
    setRecordId(data.id);
    setMessage("Contato salvo com sucesso.");
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
            Conteúdo: Contato
          </h1>
        </header>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">Carregando contato</div>
        ) : (
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="grid gap-5 lg:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className={field.textarea ? "grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2" : "grid gap-2 text-sm font-semibold text-neutral-700"}>
                    {field.label}
                    {field.textarea ? (
                      <textarea value={String(form[field.name] ?? "")} onChange={(event) => updateField(field.name, event.target.value)} className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]" />
                    ) : (
                      <input value={String(form[field.name] ?? "")} onChange={(event) => updateField(field.name, event.target.value)} className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]" />
                    )}
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
