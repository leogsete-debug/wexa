"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Send, X } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import TrackedCatalogStoreLink from "@/components/TrackedCatalogStoreLink";

type SuggestedProduct = { id: string; name: string; image: string };

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  products?: SuggestedProduct[];
};

const text = {
  pt: {
    open: "Fale com a Sofia",
    title: "Sofia · Assistente virtual",
    status: "Online agora",
    greeting:
      "Olá! Sou a Sofia, assistente virtual da Top Max. Posso te ajudar a encontrar produtos com estoque para sua loja e te levar ao catálogo de pedidos. O que você procura?",
    suggestions: ["Quais produtos têm em estoque?", "Como funciona a compra em fardos?", "Quero fazer um pedido"],
    placeholder: "Digite sua mensagem...",
    addToQuote: "Ver no catálogo",
    leaveContact: "Deixar meu contato",
    contactTitle: "Deixe seu contato e nossa equipe comercial retorna:",
    name: "Nome *",
    email: "Email",
    phone: "Telefone/WhatsApp",
    company: "Empresa",
    sendContact: "Enviar contato",
    contactRequired: "Informe seu nome e um email ou telefone.",
    contactThanks: "Obrigado! Recebemos seu contato e nossa equipe comercial vai falar com você em breve.",
    unavailable:
      "Nosso consultor virtual está indisponível no momento. Deixe seu contato abaixo ou fale com a equipe pelo WhatsApp.",
    rateLimited: "Você enviou muitas mensagens em pouco tempo. Aguarde alguns minutos ou deixe seu contato.",
    whatsapp: "Falar no WhatsApp",
    close: "Fechar",
  },
  zh: {
    open: "咨询 Sofia",
    title: "Sofia · 虚拟助理",
    status: "在线",
    greeting: "您好！我是 Top Max 的虚拟助理 Sofia。我可以帮您查找现货产品，并带您前往订购目录。请问您需要什么产品？",
    suggestions: ["有哪些现货产品？", "按包采购怎么操作？", "我想下单"],
    placeholder: "请输入消息...",
    addToQuote: "在目录中查看",
    leaveContact: "留下联系方式",
    contactTitle: "请留下联系方式，我们的销售团队会尽快联系您：",
    name: "姓名 *",
    email: "电子邮箱",
    phone: "电话",
    company: "公司",
    sendContact: "提交",
    contactRequired: "请填写姓名以及电子邮箱或电话。",
    contactThanks: "谢谢！我们已收到您的联系方式，销售团队将尽快与您联系。",
    unavailable: "在线顾问暂时不可用。请留下联系方式或通过 WhatsApp 联系我们。",
    rateLimited: "您发送消息过于频繁，请稍后再试或留下联系方式。",
    whatsapp: "WhatsApp 联系",
    close: "关闭",
  },
};

const inputClass =
  "h-10 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#d6b46a]";

function getSessionId() {
  const key = "topmax_chat_session";

  try {
    const current = window.sessionStorage.getItem(key);
    if (current) return current;

    const next = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(key, next);
    return next;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

export default function ChatAgent({ locale = "pt", whatsappUrl }: { locale?: SiteLocale; whatsappUrl: string }) {
  const labels = text[locale];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatEntry[]>([{ role: "assistant", content: labels.greeting }]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", company: "" });
  const [contactError, setContactError] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const sessionId = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, showContact]);

  function openChat() {
    setIsOpen(true);
    trackAnalyticsEvent({ eventName: "chat_open", source: "chat_agent", locale, debug: false });
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim().slice(0, 1000);
    if (!trimmed || isThinking) return;

    if (!sessionId.current) sessionId.current = getSessionId();

    const nextMessages: ChatEntry[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setDraft("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId.current,
          locale,
          // A saudação inicial é fixa no site; o modelo recebe só a conversa real.
          messages: nextMessages.slice(1).map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.reply) {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: response.status === 429 ? labels.rateLimited : labels.unavailable },
        ]);
        setShowContact(true);
        return;
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply, products: data.products ?? [] }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: labels.unavailable }]);
      setShowContact(true);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(draft);
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactError("");

    if (!contact.name.trim() || (!contact.email.trim() && !contact.phone.trim())) {
      setContactError(labels.contactRequired);
      return;
    }

    const transcript = messages
      .slice(1)
      .map((message) => `${message.role === "user" ? "Cliente" : "Agente"}: ${message.content}`)
      .join("\n")
      .slice(-3000);

    const { error } = await supabase.from("leads").insert({
      name: contact.name.trim(),
      email: contact.email.trim() || null,
      phone: contact.phone.trim() || null,
      company: contact.company.trim() || null,
      message: transcript || null,
      source: "site_chat",
      status: "Novo",
      notes: sessionId.current ? `Sessão do chat: ${sessionId.current}` : null,
    });

    if (error) {
      setContactError(labels.unavailable);
      return;
    }

    trackAnalyticsEvent({ eventName: "lead_submit", source: "chat_agent", locale, productName: "Chat", debug: false });
    setContactSent(true);
    setShowContact(false);
    setMessages((current) => [...current, { role: "assistant", content: labels.contactThanks }]);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openChat}
        aria-label={labels.open}
        className="group fixed bottom-4 right-4 z-50 flex items-center gap-3 sm:bottom-7 sm:right-7"
      >
        <span className="hidden rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#111] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition group-hover:-translate-x-1 sm:inline">
          {labels.open}
        </span>
        <span className="relative block h-14 w-14 rounded-full border-2 border-[#d6b46a] bg-white shadow-[0_18px_50px_rgba(214,180,106,0.45)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 sm:h-16 sm:w-16">
          <Image src="/images/sofia.webp" alt="Sofia, assistente virtual" fill sizes="64px" className="rounded-full object-cover" />
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
      </button>
    );
  }

  return (
    <section className="fixed inset-0 z-[55] flex flex-col bg-[#fbfaf7] text-[#161616] shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:inset-auto sm:bottom-7 sm:right-7 sm:h-[36rem] sm:w-[24rem] sm:overflow-hidden sm:rounded-[1.5rem] sm:border sm:border-black/10">
      <header className="flex items-center justify-between gap-3 bg-[#111] px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <span className="relative block h-10 w-10 shrink-0 rounded-full border-2 border-[#d6b46a]">
            <Image src="/images/sofia.webp" alt="Sofia" fill sizes="40px" className="rounded-full object-cover" />
          </span>
          <div>
            <p className="text-sm font-semibold">{labels.title}</p>
            <p className="text-[0.7rem] text-emerald-300">● {labels.status}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label={labels.close}
        >
          <X size={18} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className="max-w-[85%]">
              <p
                className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                  message.role === "user" ? "rounded-br-sm bg-[#111] text-white" : "rounded-bl-sm bg-white text-[#161616] shadow-[0_6px_20px_rgba(31,41,55,0.06)]"
                }`}
              >
                {message.content}
              </p>

              {message.products?.length ? (
                <div className="mt-2 grid gap-2">
                  {message.products.map((product) => (
                    <div key={product.id} className="flex items-center gap-2 rounded-xl border border-black/5 bg-white p-2">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                        <Image src={product.image} alt={product.name} fill sizes="40px" unoptimized={product.image.startsWith("/api/")} className="object-cover" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{product.name}</span>
                      <TrackedCatalogStoreLink
                        source="chat_agent"
                        productName={product.name}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#d6b46a] px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#111]"
                      >
                        {labels.addToQuote} <ArrowUpRight size={12} />
                      </TrackedCatalogStoreLink>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {isThinking ? (
          <div className="flex justify-start">
            <span className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-neutral-400 shadow-[0_6px_20px_rgba(31,41,55,0.06)]">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce [animation-delay:120ms]">•</span>
                <span className="animate-bounce [animation-delay:240ms]">•</span>
              </span>
            </span>
          </div>
        ) : null}

        {messages.length === 1 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {labels.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-[#d6b46a]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#9b7a3e] transition hover:bg-[#d6b46a] hover:text-[#111]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        {showContact && !contactSent ? (
          <form onSubmit={submitContact} className="grid gap-2 rounded-2xl border border-[#d6b46a]/30 bg-white p-3">
            <p className="text-xs font-semibold leading-5 text-neutral-600">{labels.contactTitle}</p>
            <input value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} className={inputClass} placeholder={labels.name} />
            <input value={contact.company} onChange={(event) => setContact((current) => ({ ...current, company: event.target.value }))} className={inputClass} placeholder={labels.company} />
            <input type="email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} className={inputClass} placeholder={labels.email} />
            <input value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} className={inputClass} placeholder={labels.phone} />
            {contactError ? <p className="text-xs font-semibold text-red-600">{contactError}</p> : null}
            <button type="submit" className="h-10 rounded-full bg-[#111] text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#d6b46a] hover:text-[#111]">
              {labels.sendContact}
            </button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-center text-xs font-semibold text-emerald-700 hover:underline">
              {labels.whatsapp}
            </a>
          </form>
        ) : null}
      </div>

      <div className="border-t border-black/10 bg-white px-3 pb-3 pt-2">
        {!contactSent && !showContact ? (
          <button type="button" onClick={() => setShowContact(true)} className="mb-2 text-xs font-semibold text-[#9b7a3e] hover:underline">
            {labels.leaveContact}
          </button>
        ) : null}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-11 flex-1 rounded-full border border-black/10 bg-[#fbfaf7] px-4 text-sm outline-none focus:border-[#d6b46a]"
            placeholder={labels.placeholder}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isThinking || !draft.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}
