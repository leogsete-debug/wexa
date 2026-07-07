"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { fallbackSiteSettings, mergeSiteSettings } from "@/lib/site-settings";
import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/types/site-settings";

type SettingsForm = SiteSettings;
type BooleanSettingField = "show_hero_primary_button" | "show_hero_secondary_button";
type TextSettingField = Exclude<
  keyof SettingsForm,
  BooleanSettingField | "id" | "created_at" | "updated_at"
>;

type TextFieldConfig = {
  name: TextSettingField;
  label: string;
  type?: "input" | "textarea";
};

const generalFields: TextFieldConfig[] = [
  { name: "company_name", label: "Nome da empresa" },
  { name: "whatsapp_number", label: "WhatsApp" },
  { name: "whatsapp_url", label: "Link do WhatsApp" },
  { name: "email", label: "E-mail" },
];

const heroFields: TextFieldConfig[] = [
  { name: "hero_badge", label: "Texto pequeno/selo do Hero" },
  { name: "hero_title", label: "Titulo principal", type: "textarea" },
  { name: "hero_subtitle", label: "Subtitulo", type: "textarea" },
  { name: "hero_primary_button_text", label: "Texto botao principal" },
  { name: "hero_primary_button_url", label: "Link botao principal" },
  { name: "hero_secondary_button_text", label: "Texto botao secundario" },
  { name: "hero_secondary_button_url", label: "Link botao secundario" },
  { name: "hero_image_url", label: "URL da imagem desktop" },
  { name: "hero_mobile_image_url", label: "URL da imagem mobile" },
];

const catalogFields: TextFieldConfig[] = [
  { name: "catalog_title", label: "Titulo da secao catalogo" },
  { name: "catalog_subtitle", label: "Subtitulo da secao catalogo", type: "textarea" },
  { name: "catalog_pdf_url", label: "Link do PDF do catalogo" },
];

const heroVisibilityFields: Array<{
  name: BooleanSettingField;
  label: string;
  description: string;
}> = [
  {
    name: "show_hero_primary_button",
    label: "Mostrar botao principal",
    description: "Exibe ou oculta o CTA principal do Hero no site publico.",
  },
  {
    name: "show_hero_secondary_button",
    label: "Mostrar botao secundario",
    description: "Exibe ou oculta o CTA secundario do Hero no site publico.",
  },
];

function SettingsTextField({
  field,
  settings,
  onChange,
}: {
  field: TextFieldConfig;
  settings: SettingsForm;
  onChange: (field: TextSettingField, value: string) => void;
}) {
  const fieldClass =
    field.type === "textarea"
      ? "grid gap-2 text-sm font-semibold text-neutral-700 lg:col-span-2"
      : "grid gap-2 text-sm font-semibold text-neutral-700";

  const pickerFolder =
    field.name === "catalog_pdf_url"
      ? "pdfs"
      : field.name === "hero_image_url" || field.name === "hero_mobile_image_url"
        ? "images"
        : null;

  return (
    <label className={fieldClass}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea
          value={String(settings[field.name] ?? "")}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
        />
      ) : (
        <input
          value={String(settings[field.name] ?? "")}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a]"
        />
      )}
      {pickerFolder ? (
        <MediaPicker
          folder={pickerFolder}
          onSelect={(url) => onChange(field.name, url)}
        />
      ) : null}
    </label>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(fallbackSiteSettings);
  const [recordId, setRecordId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoading(true);

      const { data, error: loadError } = await supabase
        .from("site_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle<SiteSettings>();

      if (!isMounted) {
        return;
      }

      if (loadError || !data) {
        setSettings(fallbackSiteSettings);
        setRecordId(undefined);
        setIsLoading(false);
        return;
      }

      setSettings(mergeSiteSettings(data));
      setRecordId(data.id);
      setIsLoading(false);
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField(field: TextSettingField, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function updateBooleanField(field: BooleanSettingField, value: boolean) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const payload = {
      whatsapp_url: settings.whatsapp_url,
      whatsapp_number: settings.whatsapp_number,
      email: settings.email,
      company_name: settings.company_name,
      hero_badge: settings.hero_badge,
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_primary_button_text: settings.hero_primary_button_text,
      hero_primary_button_url: settings.hero_primary_button_url,
      hero_secondary_button_text: settings.hero_secondary_button_text,
      hero_secondary_button_url: settings.hero_secondary_button_url,
      hero_image_url: settings.hero_image_url,
      hero_mobile_image_url: settings.hero_mobile_image_url,
      show_hero_primary_button: settings.show_hero_primary_button,
      show_hero_secondary_button: settings.show_hero_secondary_button,
      catalog_title: settings.catalog_title,
      catalog_subtitle: settings.catalog_subtitle,
      catalog_pdf_url: settings.catalog_pdf_url,
    };

    const request = recordId
      ? supabase.from("site_settings").update(payload).eq("id", recordId).select("*").single<SiteSettings>()
      : supabase.from("site_settings").insert(payload).select("*").single<SiteSettings>();

    const { data, error: saveError } = await request;

    if (saveError || !data) {
      setError("Nao foi possivel salvar as configuracoes.");
      setIsSaving(false);
      return;
    }

    setSettings(mergeSiteSettings(data));
    setRecordId(data.id);
    setMessage("Configuracoes salvas com sucesso.");
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
            Configuracoes do Site
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Edite dados gerais, Hero, WhatsApp, e-mail e catalogo sem mexer no codigo.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
            Carregando configuracoes
          </div>
        ) : (
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Dados gerais</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Informacoes principais de contato e identificacao da empresa.
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {generalFields.map((field) => (
                  <SettingsTextField key={field.name} field={field} settings={settings} onChange={updateField} />
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Hero Principal</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Controle textos, imagens, links e exibicao dos botoes principais da primeira dobra.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {heroFields.map((field) => (
                  <SettingsTextField key={field.name} field={field} settings={settings} onChange={updateField} />
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {heroVisibilityFields.map((field) => (
                  <label
                    key={field.name}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-4"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-neutral-800">{field.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-neutral-500">{field.description}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings[field.name]}
                      onChange={(event) => updateBooleanField(field.name, event.target.checked)}
                      className="h-5 w-5 accent-[#d6b46a]"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Catalogo</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Ajuste o convite e o arquivo usado na secao de catalogo do site publico.
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {catalogFields.map((field) => (
                  <SettingsTextField key={field.name} field={field} settings={settings} onChange={updateField} />
                ))}
              </div>
            </section>

            {message ? (
              <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">
                {message}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {isSaving ? "Salvando..." : "Salvar alteracoes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
