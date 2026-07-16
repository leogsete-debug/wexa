"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import MediaPicker from "@/components/admin/MediaPicker";
import { normalizeCatalogPdfUrl } from "@/lib/catalogs";
import { buildWhatsappUrl, fallbackSiteSettings, normalizeWhatsappNumber, mergeSiteSettings } from "@/lib/site-settings";
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
  { name: "whatsapp_number", label: "Número do WhatsApp" },
  { name: "floating_whatsapp_message", label: "Mensagem automática", type: "textarea" },
  { name: "whatsapp_url", label: "URL gerada automaticamente" },
  { name: "email", label: "E-mail" },
];

const heroFields: TextFieldConfig[] = [
  { name: "hero_badge", label: "Texto pequeno/selo do Hero" },
  { name: "hero_title", label: "Título principal", type: "textarea" },
  { name: "hero_subtitle", label: "Subtítulo", type: "textarea" },
  { name: "hero_primary_button_text", label: "Texto botão principal" },
  { name: "hero_primary_button_url", label: "Link botão principal" },
  { name: "hero_secondary_button_text", label: "Texto botão secundário" },
  { name: "hero_secondary_button_url", label: "Link botão secundário" },
  { name: "hero_image_url", label: "URL da imagem desktop" },
  { name: "hero_mobile_image_url", label: "URL da imagem mobile" },
];

const heroZhFields: TextFieldConfig[] = [
  { name: "company_name_zh", label: "Nome da empresa em chinês" },
  { name: "hero_badge_zh", label: "Selo do Hero em chinês" },
  { name: "hero_title_zh", label: "Título principal em chinês", type: "textarea" },
  { name: "hero_subtitle_zh", label: "Subtítulo em chinês", type: "textarea" },
  { name: "hero_primary_button_text_zh", label: "Texto botão principal em chinês" },
  { name: "hero_secondary_button_text_zh", label: "Texto botão secundário em chinês" },
];

const catalogFields: TextFieldConfig[] = [
  { name: "catalog_title", label: "Título da seção catálogo" },
  { name: "catalog_subtitle", label: "Subtítulo da seção catálogo", type: "textarea" },
  { name: "catalog_title_zh", label: "Título do catálogo em chinês" },
  { name: "catalog_subtitle_zh", label: "Subtítulo do catálogo em chinês", type: "textarea" },
  { name: "catalog_pdf_url", label: "Link do PDF do catálogo" },
];

const seoFields: TextFieldConfig[] = [
  { name: "seo_title", label: "Título SEO" },
  { name: "seo_description", label: "Descrição SEO", type: "textarea" },
  { name: "seo_keywords", label: "Palavras-chave SEO", type: "textarea" },
  { name: "seo_title_zh", label: "Título SEO em chinês" },
  { name: "seo_description_zh", label: "Descrição SEO em chinês", type: "textarea" },
  { name: "seo_og_title", label: "Título Open Graph" },
  { name: "seo_og_description", label: "Descrição Open Graph", type: "textarea" },
  { name: "seo_image_url", label: "Imagem SEO/Open Graph" },
  { name: "seo_canonical", label: "URL canônica" },
];

const heroVisibilityFields: Array<{
  name: BooleanSettingField;
  label: string;
  description: string;
}> = [
  {
    name: "show_hero_primary_button",
    label: "Mostrar botão principal",
    description: "Exibe ou oculta o CTA principal do Hero no site público.",
  },
  {
    name: "show_hero_secondary_button",
    label: "Mostrar botão secundário",
    description: "Exibe ou oculta o CTA secundário do Hero no site público.",
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
      : field.name === "hero_image_url" || field.name === "hero_mobile_image_url" || field.name === "seo_image_url"
        ? "images"
        : null;

  return (
    <label className={fieldClass}>
      {field.label}
      {field.type === "textarea" ? (
        <textarea
          value={String(settings[field.name] ?? "")}
          onChange={(event) => onChange(field.name, event.target.value)}
          readOnly={field.name === "whatsapp_url"}
          className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
        />
      ) : (
        <input
          value={String(settings[field.name] ?? "")}
          onChange={(event) => onChange(field.name, event.target.value)}
          readOnly={field.name === "whatsapp_url"}
          className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-[#d6b46a] read-only:bg-neutral-50 read-only:text-neutral-500"
        />
      )}
      {field.name === "whatsapp_url" ? (
        <span className="text-xs font-medium leading-5 text-neutral-500">
          Gerada automaticamente a partir do número e da mensagem.
        </span>
      ) : null}
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
    setSettings((current) => {
      const next = { ...current, [field]: value };

      if (field === "whatsapp_number" || field === "floating_whatsapp_message") {
        const whatsappNumber = normalizeWhatsappNumber(field === "whatsapp_number" ? value : next.whatsapp_number);
        const whatsappMessage = String(
          field === "floating_whatsapp_message" ? value : next.floating_whatsapp_message,
        );

        next.whatsapp_number = whatsappNumber;
        next.floating_whatsapp_number = whatsappNumber;
        next.floating_whatsapp_message = whatsappMessage;
        next.whatsapp_url = buildWhatsappUrl(whatsappNumber, whatsappMessage);
      }

      return next;
    });
  }

  function updateBooleanField(field: BooleanSettingField, value: boolean) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const catalogPdfUrl = normalizeCatalogPdfUrl(settings.catalog_pdf_url);
    const whatsappNumber = normalizeWhatsappNumber(settings.whatsapp_number);
    const whatsappMessage = String(settings.floating_whatsapp_message ?? "");
    const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappMessage);
    const payload = {
      whatsapp_url: whatsappUrl,
      whatsapp_number: whatsappNumber,
      floating_whatsapp_number: whatsappNumber,
      floating_whatsapp_message: whatsappMessage,
      floating_whatsapp_message_zh: settings.floating_whatsapp_message_zh,
      floating_whatsapp_aria_label: settings.floating_whatsapp_aria_label,
      floating_whatsapp_aria_label_zh: settings.floating_whatsapp_aria_label_zh,
      show_floating_whatsapp: settings.show_floating_whatsapp,
      floating_whatsapp_position: settings.floating_whatsapp_position,
      floating_whatsapp_size: settings.floating_whatsapp_size,
      email: settings.email,
      company_name: settings.company_name,
      company_name_zh: settings.company_name_zh,
      hero_badge: settings.hero_badge,
      hero_badge_zh: settings.hero_badge_zh,
      hero_title: settings.hero_title,
      hero_title_zh: settings.hero_title_zh,
      hero_subtitle: settings.hero_subtitle,
      hero_subtitle_zh: settings.hero_subtitle_zh,
      hero_primary_button_text: settings.hero_primary_button_text,
      hero_primary_button_text_zh: settings.hero_primary_button_text_zh,
      hero_primary_button_url: settings.hero_primary_button_url,
      hero_secondary_button_text: settings.hero_secondary_button_text,
      hero_secondary_button_text_zh: settings.hero_secondary_button_text_zh,
      hero_secondary_button_url: settings.hero_secondary_button_url,
      hero_image_url: settings.hero_image_url,
      hero_mobile_image_url: settings.hero_mobile_image_url,
      show_hero_primary_button: settings.show_hero_primary_button,
      show_hero_secondary_button: settings.show_hero_secondary_button,
      catalog_title: settings.catalog_title,
      catalog_title_zh: settings.catalog_title_zh,
      catalog_subtitle: settings.catalog_subtitle,
      catalog_subtitle_zh: settings.catalog_subtitle_zh,
      catalog_pdf_url: catalogPdfUrl,
      seo_title: settings.seo_title,
      seo_title_zh: settings.seo_title_zh,
      seo_description: settings.seo_description,
      seo_description_zh: settings.seo_description_zh,
      seo_keywords: settings.seo_keywords,
      seo_og_title: settings.seo_og_title,
      seo_og_description: settings.seo_og_description,
      seo_image_url: settings.seo_image_url,
      seo_canonical: settings.seo_canonical,
      seo_indexable: settings.seo_indexable,
    };

    const request = recordId
      ? supabase.from("site_settings").update(payload).eq("id", recordId).select("*").single<SiteSettings>()
      : supabase.from("site_settings").insert(payload).select("*").single<SiteSettings>();

    const { data, error: saveError } = await request;

    if (saveError || !data) {
      setError("Não foi possível salvar as configurações.");
      setIsSaving(false);
      return;
    }

    setSettings(mergeSiteSettings(data));
    setRecordId(data.id);
    setMessage("Configurações salvas com sucesso.");
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
            Configurações do Site
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Edite dados gerais, Hero, WhatsApp, e-mail e catálogo sem mexer no código.
          </p>
        </header>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
            Carregando configurações
          </div>
        ) : (
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Dados gerais</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Informações principais de contato e identificação da empresa.
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
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">SEO</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Ajuste títulos, descrições, palavras-chave e compartilhamento social.
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {seoFields.map((field) => (
                  <SettingsTextField key={field.name} field={field} settings={settings} onChange={updateField} />
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-7">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Hero Principal</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Controle textos, imagens, links e exibição dos botões principais da primeira dobra.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {heroFields.map((field) => (
                  <SettingsTextField key={field.name} field={field} settings={settings} onChange={updateField} />
                ))}
              </div>

              <div className="mt-7 border-t border-black/10 pt-6">
                <h3 className="text-base font-semibold tracking-[-0.02em] text-[#111]">Versão chinesa</h3>
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  {heroZhFields.map((field) => (
                    <SettingsTextField key={field.name} field={field} settings={settings} onChange={updateField} />
                  ))}
                </div>
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
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Catálogo</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Ajuste o convite e o arquivo usado na seção de catálogo do site público.
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
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
