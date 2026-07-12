"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import { supabase } from "@/lib/supabase";

type LeadForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  product_interest: string;
  message: string;
};

const initialForm: LeadForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  product_interest: "",
  message: "",
};

const text = {
  pt: {
    name: "Nome",
    company: "Empresa",
    email: "Email",
    phone: "Telefone",
    country: "País",
    city: "Cidade",
    product: "Produto de interesse",
    message: "Mensagem",
    send: "Enviar mensagem",
    sending: "Enviando...",
    required: "Informe nome e email para enviar sua mensagem.",
    success: "Mensagem enviada com sucesso.",
    error: "Nao foi possivel enviar agora. Tente novamente em instantes.",
  },
  zh: {
    name: "姓名",
    company: "公司",
    email: "电子邮箱",
    phone: "电话",
    country: "国家",
    city: "城市",
    product: "感兴趣的产品",
    message: "留言",
    send: "发送信息",
    sending: "发送中...",
    required: "请填写姓名和电子邮箱后再发送信息。",
    success: "信息发送成功。我们的团队将尽快与您联系。",
    error: "无法发送信息。请稍后再试。",
  },
};

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function ContactLeadForm({ locale = "pt" }: { locale?: SiteLocale }) {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const labels = text[locale];

  function updateField<K extends keyof LeadForm>(field: K, value: LeadForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError(labels.required);
      return;
    }

    setIsSaving(true);

    const { error: insertError } = await supabase.from("leads").insert({
      name: form.name.trim(),
      company: toNullable(form.company),
      email: form.email.trim(),
      phone: toNullable(form.phone),
      country: toNullable(form.country),
      city: toNullable(form.city),
      product_interest: toNullable(form.product_interest),
      message: toNullable(form.message),
      source: "site_contact",
      status: "Novo",
      assigned_to: null,
      notes: null,
    });

    if (insertError) {
      setError(labels.error);
      setIsSaving(false);
      return;
    }

    setForm(initialForm);
    setMessage(labels.success);
    setIsSaving(false);
  }

  return (
    <form className="mt-7 grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
          placeholder={labels.name}
          required
        />
        <input
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
          placeholder={labels.company}
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
          placeholder={labels.email}
          required
        />
        <input
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
          placeholder={labels.phone}
        />
        <input
          value={form.country}
          onChange={(event) => updateField("country", event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
          placeholder={labels.country}
        />
        <input
          value={form.city}
          onChange={(event) => updateField("city", event.target.value)}
          className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
          placeholder={labels.city}
        />
      </div>

      <input
        value={form.product_interest}
        onChange={(event) => updateField("product_interest", event.target.value)}
        className="h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]"
        placeholder={labels.product}
      />

      <textarea
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        className="min-h-28 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
        placeholder={labels.message}
      />

      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#111] px-6 py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:px-7 sm:text-xs sm:tracking-[0.18em]"
      >
        <Send size={17} />
        {isSaving ? labels.sending : labels.send}
      </button>
    </form>
  );
}
