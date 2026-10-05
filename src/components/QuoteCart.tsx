"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { ClipboardList, Send, Trash2, X } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { clearQuoteCart, removeFromQuoteCart, setQuoteCartQuantity, useQuoteCart } from "@/lib/quote-cart";
import { supabase } from "@/lib/supabase";

const text = {
  pt: {
    open: "Minha cotação",
    title: "Pedido de cotação",
    subtitle: "Informe as quantidades e seus dados. Nossa equipe retorna com preços e prazos.",
    quantity: "Quantidade",
    remove: "Remover",
    name: "Nome *",
    company: "Empresa",
    email: "Email",
    phone: "Telefone/WhatsApp",
    city: "Cidade/Estado",
    message: "Observações (cores, tamanhos, marca própria...)",
    contactRequired: "Informe seu nome e um email ou telefone.",
    send: "Enviar pedido de cotação",
    sending: "Enviando...",
    success: "Pedido de cotação enviado! Seu protocolo é",
    successHint: "Nossa equipe comercial entrará em contato em breve.",
    error: "Não foi possível enviar agora. Tente novamente em instantes.",
    rateLimited: "Você já enviou várias cotações recentemente. Aguarde um pouco ou fale conosco pelo WhatsApp.",
    empty: "Nenhum produto na cotação.",
    close: "Fechar",
  },
  zh: {
    open: "我的询价单",
    title: "询价申请",
    subtitle: "请填写数量和联系方式，我们的团队将回复价格和交期。",
    quantity: "数量",
    remove: "删除",
    name: "姓名 *",
    company: "公司",
    email: "电子邮箱",
    phone: "电话",
    city: "城市",
    message: "备注（颜色、尺寸、自有品牌等）",
    contactRequired: "请填写姓名以及电子邮箱或电话。",
    send: "提交询价",
    sending: "提交中...",
    success: "询价已提交！您的编号是",
    successHint: "我们的销售团队将尽快与您联系。",
    error: "无法提交，请稍后再试。",
    rateLimited: "您最近已提交多次询价，请稍后再试或通过 WhatsApp 联系我们。",
    empty: "询价单中没有产品。",
    close: "关闭",
  },
};

const initialForm = { name: "", company: "", email: "", phone: "", city: "", message: "" };
const inputClass =
  "h-12 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm outline-none transition focus:border-[#d6b46a]";

export default function QuoteCart({ locale = "pt" }: { locale?: SiteLocale }) {
  const items = useQuoteCart();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const labels = text[locale];

  useEffect(() => {
    const open = () => {
      setOrderCode("");
      setIsOpen(true);
    };

    window.addEventListener("topmax-quote-cart-open", open);
    return () => window.removeEventListener("topmax-quote-cart-open", open);
  }, []);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError(labels.contactRequired);
      return;
    }

    setIsSaving(true);

    const { data, error: submitError } = await supabase.rpc("submit_quote_request", {
      payload: {
        ...form,
        locale,
        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      },
    });

    setIsSaving(false);

    if (submitError || !data) {
      setError(submitError?.message.includes("rate_limited") ? labels.rateLimited : labels.error);
      return;
    }

    await trackAnalyticsEvent({
      eventName: "quote_submit",
      source: "quote_cart",
      locale,
      productName: items.map((item) => item.name).join(", "),
      debug: false,
    });

    setOrderCode(String(data));
    setForm(initialForm);
    clearQuoteCart();
  }

  if (items.length === 0 && !isOpen) return null;

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-[#111] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_20px_55px_rgba(0,0,0,0.3)] transition hover:-translate-y-1 hover:bg-[#d6b46a] hover:text-[#111] sm:bottom-7 sm:left-7"
        >
          <ClipboardList size={18} />
          {labels.open}
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#d6b46a] px-1.5 text-[#111]">
            {items.length}
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/30" onClick={() => setIsOpen(false)}>
          <aside
            className="flex h-full w-full max-w-lg flex-col bg-[#fbfaf7] text-[#161616] shadow-[-30px_0_90px_rgba(0,0,0,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/10 p-5 sm:p-7">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111] sm:text-3xl">{labels.title}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white"
                aria-label={labels.close}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {orderCode ? (
                <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-800">
                  <p className="font-semibold">
                    {labels.success} <strong>{orderCode}</strong>.
                  </p>
                  <p className="mt-2">{labels.successHint}</p>
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-neutral-500">{labels.empty}</p>
              ) : (
                <>
                  <ul className="grid gap-3">
                    {items.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3 rounded-2xl border border-white bg-white p-3 shadow-[0_10px_30px_rgba(31,41,55,0.06)]">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#111]">{item.name}</p>
                          <label className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                            {labels.quantity}
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) => setQuoteCartQuantity(item.productId, Number(event.target.value) || 1)}
                              className="h-9 w-24 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#d6b46a]"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromQuoteCart(item.productId)}
                          className="text-neutral-400 hover:text-red-600"
                          aria-label={labels.remove}
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
                    <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} placeholder={labels.name} required />
                    <input value={form.company} onChange={(event) => updateField("company", event.target.value)} className={inputClass} placeholder={labels.company} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className={inputClass} placeholder={labels.email} />
                      <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className={inputClass} placeholder={labels.phone} />
                    </div>
                    <input value={form.city} onChange={(event) => updateField("city", event.target.value)} className={inputClass} placeholder={labels.city} />
                    <textarea
                      value={form.message}
                      onChange={(event) => updateField("message", event.target.value)}
                      className="min-h-24 rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#d6b46a]"
                      placeholder={labels.message}
                      maxLength={2000}
                    />

                    {error ? (
                      <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-60"
                    >
                      <Send size={15} />
                      {isSaving ? labels.sending : labels.send}
                    </button>
                  </form>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
