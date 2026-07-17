"use client";

import {
  BarChart3,
  Building2,
  Contact,
  FileText,
  FolderTree,
  Gauge,
  Globe2,
  ImageIcon,
  Inbox,
  LogOut,
  MousePointerClick,
  Package,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AnalyticsEvent = {
  id: string;
  event_name: string;
  event_source: string | null;
  page_path: string | null;
  locale: string | null;
  product_id: string | null;
  product_name: string | null;
  device_type: string | null;
  visitor_id?: string | null;
  created_at: string | null;
};

const sidebarItems = [
  { title: "Dashboard", icon: Gauge, href: "/admin" },
  { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { title: "Produtos", icon: Package, href: "/admin/produtos" },
  { title: "Categorias", icon: FolderTree, href: "#" },
  { title: "Galeria", icon: ImageIcon, href: "#" },
  { title: "Catalogos", icon: Tags, href: "/admin/catalogos" },
  { title: "Mercados", icon: Globe2, href: "#" },
  { title: "Empresa", icon: Building2, href: "#" },
  { title: "Contato", icon: Contact, href: "#" },
  { title: "Configuracoes", icon: Settings, href: "/admin/configuracoes" },
  { title: "Usuarios", icon: Users, href: "#" },
];

const contentItems = [
  { title: "Site", icon: FileText, href: "/admin/conteudo/site" },
  { title: "Empresa", icon: Building2, href: "/admin/conteudo/empresa" },
  { title: "Mercados", icon: Globe2, href: "/admin/conteudo/mercados" },
  { title: "Processo", icon: FileText, href: "/admin/conteudo/processo" },
  { title: "Contato", icon: Contact, href: "/admin/conteudo/contato" },
  { title: "Rodape", icon: Settings, href: "/admin/conteudo/rodape" },
];

const crmItems = [{ title: "Leads", icon: Inbox, href: "/admin/crm/leads" }];

const periodOptions = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
  { label: "Todo periodo", value: "all" },
] as const;

const sourceLabels: Record<string, string> = {
  site: "Site",
  header: "Header",
  hero: "Hero",
  product: "Produto",
  catalog: "Catalogo",
  cta: "CTA",
  contact: "Contato",
  footer: "Footer",
  floating_button: "Botao flutuante",
  page: "Pagina",
  lead_form: "Formulario",
  test: "Teste",
};

const eventLabels: Record<string, string> = {
  page_view: "Visualizacao de pagina",
  whatsapp_click: "Clique no WhatsApp",
  catalog_download: "Download do catalogo",
  lead_submit: "Lead enviado",
  product_click: "Clique em produto",
  gallery_click: "Clique na galeria",
  phone_click: "Clique no telefone",
  email_click: "Clique no e-mail",
  quotation_click: "Clique em cotacao",
  language_change: "Troca de idioma",
  button_click: "Clique em botao",
  form_start: "Formulario iniciado",
  form_complete: "Formulario concluido",
  test_event: "Evento de teste",
};

function formatAnalyticsLabel(value: string | null | undefined, labels: Record<string, string>) {
  const text = value?.trim();
  if (!text) return "Nao informado";
  return labels[text] || text.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPeriodStart(period: string) {
  const now = new Date();

  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "all") return null;

  const days = period === "90d" ? 90 : period === "30d" ? 30 : 7;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}

function countBy<T>(items: T[], getter: (item: T) => string | null | undefined) {
  return Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const key = getter(item)?.trim() || "Nao informado";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function formatDateTime(value: string | null) {
  return value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
}

function formatDay(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function uniqueVisitors(events: AnalyticsEvent[]) {
  const pageViews = events.filter((event) => event.event_name === "page_view");
  const visitors = new Set(pageViews.map((event) => event.visitor_id).filter(Boolean));
  return visitors.size;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTestEvent, setIsCreatingTestEvent] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<(typeof periodOptions)[number]["value"]>("30d");

  async function loadEvents() {
    await Promise.resolve();
    setIsLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (loadError) {
      setError(`Nao foi possivel carregar analytics: ${loadError.message}`);
      setEvents([]);
    } else {
      setEvents((data ?? []) as AnalyticsEvent[]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadEvents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function refreshData() {
    router.refresh();
    await loadEvents();
  }

  async function createTestEvent() {
    setIsCreatingTestEvent(true);
    setError("");

    try {
      const response = await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "test_event",
          source: "test",
          pagePath: "/admin/analytics",
          locale: "pt",
          productName: "Evento de teste",
          deviceType: "desktop",
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.saved !== true) {
        throw new Error(result?.details || result?.error || "Evento de teste nao foi salvo.");
      }

      await loadEvents();
    } catch (testError) {
      const message = testError instanceof Error ? testError.message : "Falha desconhecida.";
      setError(`Gerar evento de teste falhou: ${message}`);
    } finally {
      setIsCreatingTestEvent(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const start = getPeriodStart(period);
    return events.filter((event) => {
      const createdAt = event.created_at ? new Date(event.created_at) : null;
      return !start || (createdAt && createdAt >= start);
    });
  }, [events, period]);

  const whatsappClicks = filteredEvents.filter((event) => event.event_name === "whatsapp_click");
  const catalogDownloads = filteredEvents.filter((event) => event.event_name === "catalog_download");
  const leadsSent = filteredEvents.filter((event) => event.event_name === "lead_submit");
  const pageViews = filteredEvents.filter((event) => event.event_name === "page_view");
  const productClicks = countBy(
    whatsappClicks.filter((event) => event.event_source === "product"),
    (event) => event.product_name,
  );
  const pageCounts = countBy(pageViews, (event) => event.page_path);
  const eventCounts = countBy(filteredEvents, (event) => formatAnalyticsLabel(event.event_name, eventLabels));
  const sourceCounts = countBy(whatsappClicks, (event) => formatAnalyticsLabel(event.event_source, sourceLabels));
  const maxSource = Math.max(1, ...sourceCounts.map((item) => item.value));
  const maxEvent = Math.max(1, ...eventCounts.map((item) => item.value));
  const maxChart = Math.max(1, ...Array.from({ length: 30 }, (_, index) => index));
  const last30Days = Array.from({ length: 30 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (29 - index));
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const value = events.filter((event) => {
      if (!event.created_at) return false;
      const date = new Date(event.created_at);
      return date >= start && date < end;
    }).length;
    return { label: formatDay(day), value };
  });
  const maxDayValue = Math.max(1, ...last30Days.map((item) => item.value), maxChart ? 1 : 1);

  const kpis = [
    { title: "Visitantes unicos", value: uniqueVisitors(filteredEvents), icon: Users },
    { title: "Visualizacoes de pagina", value: pageViews.length, icon: FileText },
    { title: "Cliques no WhatsApp", value: whatsappClicks.length, icon: MousePointerClick },
    { title: "Downloads do catalogo", value: catalogDownloads.length, icon: Tags },
    { title: "Leads enviados", value: leadsSent.length, icon: Inbox },
    { title: "Produto mais clicado", value: productClicks[0]?.label || "-", icon: Package },
    { title: "Pagina mais acessada", value: pageCounts[0]?.label || "-", icon: FileText },
  ];

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#161616]">
      <div className="grid min-h-screen lg:grid-cols-[18rem_1fr]">
        <aside className="border-b border-black/10 bg-[#080b0d] px-4 py-5 text-white lg:border-b-0 lg:border-r lg:border-white/10 lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <strong className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                TOPMAX
              </strong>
              <p className="mt-3 hidden text-xs font-semibold uppercase tracking-[0.2em] text-[#d6b46a] lg:block">
                Admin CMS
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white transition duration-300 hover:bg-[#d6b46a] hover:text-[#111] lg:hidden"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:grid lg:gap-2 lg:overflow-visible lg:pb-0">
            {sidebarItems.map(({ title, icon: Icon, href }) => (
              <Link
                key={title}
                href={href}
                className={
                  href === "/admin/analytics"
                    ? "inline-flex shrink-0 items-center gap-3 rounded-2xl bg-[#d6b46a] px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#111] shadow-[0_18px_45px_rgba(214,180,106,0.22)]"
                    : "inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition duration-300 hover:bg-white/[0.08] hover:text-white"
                }
              >
                <Icon size={17} strokeWidth={1.9} />
                {title}
              </Link>
            ))}

            <div className="hidden pt-4 lg:block">
              <p className="px-4 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#d6b46a]">
                Conteudo
              </p>
            </div>
            {contentItems.map(({ title, icon: Icon, href }) => (
              <Link key={title} href={href} className="inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition duration-300 hover:bg-white/[0.08] hover:text-white">
                <Icon size={17} strokeWidth={1.9} />
                {title}
              </Link>
            ))}

            <div className="hidden pt-4 lg:block">
              <p className="px-4 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#d6b46a]">CRM</p>
            </div>
            {crmItems.map(({ title, icon: Icon, href }) => (
              <Link key={title} href={href} className="inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition duration-300 hover:bg-white/[0.08] hover:text-white">
                <Icon size={17} strokeWidth={1.9} />
                {title}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <header className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
                TopMax Export
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
                Analytics
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                Visao de visitantes, WhatsApp, catalogo, leads e produtos mais acionados.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={refreshData}
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#111] transition duration-300 hover:bg-[#d6b46a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Atualizar dados
              </button>
              <button
                type="button"
                onClick={createTestEvent}
                disabled={isCreatingTestEvent}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MousePointerClick size={17} />
                {isCreatingTestEvent ? "Gerando..." : "Gerar evento de teste"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#111] transition duration-300 hover:bg-[#111] hover:text-white lg:inline-flex"
              >
                <LogOut size={17} />
                Sair
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
              Carregando analytics
            </div>
          ) : (
            <>
              {error ? (
                <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}

              <section className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                <div className="flex flex-wrap gap-2">
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPeriod(option.value)}
                      className={
                        period === option.value
                          ? "h-10 rounded-full bg-[#111] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white"
                          : "h-10 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-600 transition hover:bg-[#d6b46a] hover:text-[#111]"
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
                {kpis.map(({ title, value, icon: Icon }) => (
                  <article key={title} className="rounded-[1.35rem] border border-white/75 bg-white/80 p-5 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <strong className="line-clamp-2 min-h-9 text-2xl font-semibold tracking-[-0.04em] text-[#111]">{value}</strong>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-[1.5rem] border border-white/75 bg-white/80 p-6 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Grafico ultimos 30 dias</h2>
                  <div className="mt-6 flex h-64 items-end gap-1 border-b border-black/10 pb-2">
                    {last30Days.map((item) => (
                      <div key={item.label} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                        <div
                          title={`${item.label}: ${item.value}`}
                          className="w-full rounded-t bg-[#d6b46a] transition group-hover:bg-[#111]"
                          style={{ height: `${Math.max(4, (item.value / maxDayValue) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    <span>{last30Days[0]?.label}</span>
                    <span>{last30Days[14]?.label}</span>
                    <span>{last30Days[29]?.label}</span>
                  </div>
                </article>

                <article className="rounded-[1.5rem] border border-white/75 bg-white/80 p-6 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Cliques por origem</h2>
                  <div className="mt-6 grid gap-4">
                    {sourceCounts.length === 0 ? (
                      <p className="text-sm leading-6 text-neutral-500">Nenhum clique encontrado.</p>
                    ) : (
                      sourceCounts.map((item) => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-[#141414]">{item.label}</span>
                            <span className="text-neutral-500">{item.value}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-black/5">
                            <div className="h-full rounded-full bg-[#d6b46a]" style={{ width: `${Math.max(8, (item.value / maxSource) * 100)}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </section>

              <section className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-6 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Eventos por tipo</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {eventCounts.length === 0 ? (
                    <p className="text-sm leading-6 text-neutral-500">Nenhum evento encontrado.</p>
                  ) : (
                    eventCounts.map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-[#141414]">{item.label}</span>
                          <span className="text-neutral-500">{item.value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-black/5">
                          <div className="h-full rounded-full bg-[#111]" style={{ width: `${Math.max(8, (item.value / maxEvent) * 100)}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/80 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                <div className="border-b border-black/10 px-5 py-5">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Eventos recentes</h2>
                </div>
                <div className="hidden grid-cols-[10rem_12rem_10rem_1fr_1fr_7rem] gap-4 border-b border-black/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:grid">
                  <span>Data</span>
                  <span>Evento</span>
                  <span>Origem</span>
                  <span>Pagina</span>
                  <span>Produto</span>
                  <span>Idioma</span>
                </div>
                <div className="divide-y divide-black/10">
                  {filteredEvents.slice(0, 80).map((event) => (
                    <div key={event.id} className="grid gap-2 px-5 py-4 text-sm text-neutral-600 lg:grid-cols-[10rem_12rem_10rem_1fr_1fr_7rem] lg:items-center lg:gap-4">
                      <span className="font-semibold text-[#111]">{formatDateTime(event.created_at)}</span>
                      <span>{formatAnalyticsLabel(event.event_name, eventLabels)}</span>
                      <span>{event.event_source ? formatAnalyticsLabel(event.event_source, sourceLabels) : "-"}</span>
                      <span className="break-words">{event.page_path || "-"}</span>
                      <span className="break-words">{event.product_name || "-"}</span>
                      <span>{event.locale === "zh" ? "ZH" : event.locale === "pt" ? "PT" : "-"}</span>
                    </div>
                  ))}
                  {filteredEvents.length === 0 ? (
                    <p className="px-5 py-8 text-sm leading-6 text-neutral-500">Nenhum evento encontrado para o periodo selecionado.</p>
                  ) : null}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
