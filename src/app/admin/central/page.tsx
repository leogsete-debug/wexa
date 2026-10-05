"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Boxes,
  CheckCircle2,
  ExternalLink,
  Camera,
  LineChart,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Store,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Health = "ok" | "atencao" | "problema" | "inativo";

type AgentRunRow = {
  agent: string;
  task: string;
  status: "ok" | "aviso" | "erro";
  provider: string | null;
  duration_ms: number | null;
  detail: string | null;
  created_at: string;
};

type ChatRow = { session_id: string; role: "user" | "assistant"; content: string; provider: string | null; created_at: string };
type EventRow = { event_name: string; event_source: string | null; visitor_id: string | null; product_name: string | null; created_at: string };
type LeadRow = { id: string; name: string; source: string | null; status: string; created_at: string };

type CatalogHealth =
  | { online: true; latencyMs: number; stockDate: string | null; products: number; featured: number; lowStock: string[]; outOfStock: string[] }
  | { online: false; latencyMs: number; error: string };

const systemLinks = [
  { title: "HUB", href: "https://topmax-hub.vercel.app" },
  { title: "Catálogo", href: "https://topmax-catalogo.vercel.app/?lang=pt#admin" },
  { title: "Pedidos", href: "https://topmax-pedidos.vercel.app/#admin" },
  { title: "Vendas", href: "https://topmax-vendas.vercel.app/" },
];

const healthStyle: Record<Health, { label: string; dot: string; badge: string }> = {
  ok: { label: "Funcionando", dot: "bg-emerald-500", badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" },
  atencao: { label: "Atenção", dot: "bg-amber-500", badge: "border-amber-500/25 bg-amber-500/10 text-amber-700" },
  problema: { label: "Problema", dot: "bg-red-500", badge: "border-red-500/20 bg-red-500/10 text-red-700" },
  inativo: { label: "Não iniciado", dot: "bg-neutral-400", badge: "border-neutral-400/25 bg-neutral-400/10 text-neutral-600" },
};

const cardClass =
  "rounded-[1.5rem] border border-white/75 bg-white/85 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)]";

function distinct<T>(values: T[]) {
  return new Set(values.filter((value) => value != null && value !== "")).size;
}

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.round(hours / 24)} d`;
}

function daysSince(dateText: string | null, now: number) {
  if (!dateText) return null;
  const date = new Date(`${dateText}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : Math.floor((now - date.getTime()) / 86_400_000);
}

export default function CentralPage() {
  const [days, setDays] = useState<7 | 30>(7);
  const [runs, setRuns] = useState<AgentRunRow[]>([]);
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [catalog, setCatalog] = useState<CatalogHealth | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const [runsResult, chatsResult, eventsResult, leadsResult, catalogResult] = await Promise.all([
      supabase.from("agent_runs").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(3000),
      supabase.from("chat_messages").select("session_id, role, content, provider, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(3000),
      supabase.from("analytics_events").select("event_name, event_source, visitor_id, product_name, created_at").gte("created_at", since).limit(10000),
      supabase.from("leads").select("id, name, source, status, created_at").gte("created_at", since).order("created_at", { ascending: false }),
      fetch("/api/admin/catalog-health", { cache: "no-store" })
        .then((response) => response.json() as Promise<CatalogHealth>)
        .catch(() => ({ online: false, latencyMs: 0, error: "Falha ao consultar" }) as CatalogHealth),
    ]);

    setMissingTables([runsResult.error ? "agent_runs" : null, chatsResult.error ? "chat_messages" : null].filter(Boolean) as string[]);
    setRuns((runsResult.data ?? []) as AgentRunRow[]);
    setChats((chatsResult.data ?? []) as ChatRow[]);
    setEvents((eventsResult.data ?? []) as EventRow[]);
    setLeads((leadsResult.data ?? []) as LeadRow[]);
    setCatalog(catalogResult);
    setLoadedAt(new Date());
    setIsLoading(false);
  }, [days]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const report = useMemo(() => {
    const now = loadedAt ? loadedAt.getTime() : 0;
    // Agente Sofia
    const sofiaRuns = runs.filter((run) => run.agent === "sofia");
    const sofiaOk = sofiaRuns.filter((run) => run.status === "ok");
    const sofiaErrors = sofiaRuns.filter((run) => run.status === "erro");
    const sofiaErrorRate = percent(sofiaErrors.length, sofiaRuns.length);
    const okDurations = sofiaOk.map((run) => run.duration_ms ?? 0).filter((value) => value > 0);
    const avgLatency = okDurations.length ? Math.round(okDurations.reduce((sum, value) => sum + value, 0) / okDurations.length / 100) / 10 : 0;
    const lastSofiaError = sofiaErrors[0] ?? null;
    const providers = sofiaOk.reduce<Record<string, number>>((acc, run) => {
      const key = run.provider || "?";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const conversations = distinct(chats.map((chat) => chat.session_id));
    const customerMessages = chats.filter((chat) => chat.role === "user").length;
    const recommendations = sofiaOk.filter((run) => run.detail?.startsWith("Indicou")).length;
    const lastRunIsError = sofiaRuns[0]?.status === "erro";

    let sofiaHealth: Health = "ok";
    if (sofiaRuns.length === 0) sofiaHealth = "ok";
    if (sofiaErrorRate >= 20 || (lastRunIsError && now - new Date(sofiaRuns[0].created_at).getTime() < 3_600_000)) sofiaHealth = "problema";
    else if (sofiaErrorRate >= 5 || avgLatency > 8) sofiaHealth = "atencao";

    // Vitrine (site)
    const pageViews = events.filter((event) => event.event_name === "page_view");
    const visitors = distinct(pageViews.map((event) => event.visitor_id));
    const storeClicks = events.filter((event) => event.event_name === "catalog_store_click");
    const storeVisitors = distinct(storeClicks.map((event) => event.visitor_id));
    const chatOpeners = distinct(events.filter((event) => event.event_name === "chat_open").map((event) => event.visitor_id));
    const clickRate = percent(storeVisitors, visitors);
    const clicksBySource = storeClicks.reduce<Record<string, number>>((acc, event) => {
      const key = event.event_source || "outro";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const topSources = Object.entries(clicksBySource).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const siteHealth: Health = visitors >= 20 && clickRate < 5 ? "atencao" : "ok";

    // Catálogo de pedidos (sistema próprio)
    const stockAge = catalog && catalog.online ? daysSince(catalog.stockDate, now) : null;
    let catalogHealth: Health = "ok";
    if (!catalog || !catalog.online) catalogHealth = "problema";
    else if ((stockAge ?? 0) > 7 || catalog.featured === 0 || catalog.latencyMs > 10_000) catalogHealth = "atencao";

    // Alertas e melhorias
    const alerts: Array<{ level: Health; text: string }> = [];
    if (missingTables.length) alerts.push({ level: "problema", text: `Tabela(s) ${missingTables.join(", ")} não encontrada(s) no Supabase: rode os SQL de supabase/migrations.` });
    if (lastSofiaError?.detail?.includes("Nenhuma chave")) alerts.push({ level: "problema", text: "A Sofia está sem chave de IA configurada: o site mostra só o formulário de contato." });
    else if (sofiaErrorRate >= 5) alerts.push({ level: sofiaErrorRate >= 20 ? "problema" : "atencao", text: `A Sofia falhou em ${sofiaErrorRate}% dos atendimentos. Adicionar uma chave do Gemini como reserva reduz as falhas.` });
    if (avgLatency > 8) alerts.push({ level: "atencao", text: `A Sofia está demorando ${avgLatency}s por resposta. Vale testar outro modelo.` });
    if (!catalog?.online) alerts.push({ level: "problema", text: "O catálogo de pedidos não respondeu. Clientes podem não conseguir fazer pedidos." });
    if (catalog?.online && stockAge != null && stockAge > 7) alerts.push({ level: "atencao", text: `O estoque do catálogo foi atualizado há ${stockAge} dias (${catalog.stockDate}). Atualize para não vender o que acabou.` });
    if (catalog?.online && catalog.featured === 0) alerts.push({ level: "atencao", text: "Nenhum produto marcado como destaque no catálogo: o carrossel do site fica vazio." });
    if (catalog?.online && catalog.outOfStock.length) alerts.push({ level: "atencao", text: `Sem estoque: ${catalog.outOfStock.slice(0, 5).join(", ")}${catalog.outOfStock.length > 5 ? "…" : ""}.` });
    if (catalog?.online && catalog.lowStock.length) alerts.push({ level: "inativo", text: `Últimos fardos (≤ 50): ${catalog.lowStock.slice(0, 6).join(", ")}${catalog.lowStock.length > 6 ? "…" : ""}. Bom momento para planejar reposição ou fazer campanha de "últimas unidades".` });
    if (visitors >= 20 && clickRate < 5) alerts.push({ level: "atencao", text: `Só ${clickRate}% dos visitantes foram ao catálogo. Teste destaques diferentes no carrossel.` });
    if (conversations > 0 && leads.filter((lead) => lead.source === "site_chat").length === 0) alerts.push({ level: "inativo", text: `${conversations} conversa(s) com a Sofia e nenhum contato deixado no chat. Acompanhe se os clientes estão indo direto ao catálogo.` });

    // Últimas conversas
    const sessions = new Map<string, ChatRow[]>();
    for (const chat of chats) {
      if (!sessions.has(chat.session_id)) sessions.set(chat.session_id, []);
      sessions.get(chat.session_id)!.push(chat);
    }
    const recentConversations = [...sessions.entries()]
      .filter(([sessionId]) => !sessionId.startsWith("teste-claude"))
      .slice(0, 6)
      .map(([sessionId, messages]) => {
        const ordered = [...messages].reverse();
        return {
          sessionId,
          firstQuestion: ordered.find((message) => message.role === "user")?.content ?? "",
          lastReply: [...ordered].reverse().find((message) => message.role === "assistant")?.content ?? "",
          count: messages.length,
          at: messages[0].created_at,
        };
      });

    return {
      sofia: { health: sofiaHealth, runs: sofiaRuns.length, errors: sofiaErrors.length, errorRate: sofiaErrorRate, avgLatency, lastError: lastSofiaError, providers, conversations, customerMessages, recommendations },
      site: { health: siteHealth, visitors, storeVisitors, storeClicks: storeClicks.length, clickRate, topSources, chatOpeners },
      catalog: { health: catalogHealth, stockAge },
      funnel: [
        { label: "Visitantes", value: visitors },
        { label: "Abriram o chat", value: chatOpeners },
        { label: "Conversaram com a Sofia", value: conversations },
        { label: "Foram ao catálogo", value: storeVisitors },
        { label: "Deixaram contato", value: leads.length },
      ],
      alerts,
      recentConversations,
    };
  }, [runs, chats, events, leads, catalog, missingTables, loadedAt]);

  const sourceLabels: Record<string, string> = {
    header: "Cabeçalho",
    header_menu: "Menu",
    hero: "Topo",
    carousel: "Carrossel",
    carousel_all: "Ver todos",
    chat_agent: "Sofia",
    catalog_section: "Seção catálogo",
    cta: "Chamada final",
  };

  const agents: Array<{
    key: string;
    title: string;
    role: string;
    icon: typeof Bot;
    health: Health;
    stats: Array<[string, string]>;
    note?: string | null;
  }> = [
    {
      key: "sofia",
      title: "Sofia · Atendimento",
      role: "Atende visitantes no site, indica produtos com estoque e leva ao catálogo.",
      icon: MessageCircle,
      health: report.sofia.health,
      stats: [
        ["Conversas", String(report.sofia.conversations)],
        ["Respostas", String(report.sofia.runs)],
        ["Falhas", `${report.sofia.errors} (${report.sofia.errorRate}%)`],
        ["Tempo médio", report.sofia.avgLatency ? `${report.sofia.avgLatency}s` : "-"],
        ["Indicações de produto", String(report.sofia.recommendations)],
        ["IA usada", Object.entries(report.sofia.providers).map(([name, count]) => `${name} (${count})`).join(", ") || "-"],
      ],
      note: report.sofia.lastError ? `Último erro ${ago(report.sofia.lastError.created_at)}: ${report.sofia.lastError.detail ?? ""}` : null,
    },
    {
      key: "site",
      title: "Vitrine · Site",
      role: "Apresenta a Top Max e os destaques, e encaminha para o catálogo de pedidos.",
      icon: Store,
      health: report.site.health,
      stats: [
        ["Visitantes", String(report.site.visitors)],
        ["Foram ao catálogo", `${report.site.storeVisitors} (${report.site.clickRate}%)`],
        ["Cliques no catálogo", String(report.site.storeClicks)],
        ["De onde clicam", report.site.topSources.map(([source, count]) => `${sourceLabels[source] ?? source} ${count}`).join(" · ") || "-"],
      ],
    },
    {
      key: "catalog",
      title: "Catálogo de pedidos",
      role: "Seu sistema (Apps Script): estoque, propostas e pedidos. Fonte da verdade dos produtos.",
      icon: ShoppingBag,
      health: report.catalog.health,
      stats:
        catalog && catalog.online
          ? [
              ["Produtos", String(catalog.products)],
              ["Destaques no site", String(catalog.featured)],
              ["Estoque de", `${catalog.stockDate ?? "-"}${report.catalog.stockAge != null ? ` (${report.catalog.stockAge}d)` : ""}`],
              ["Tempo de resposta", `${(catalog.latencyMs / 1000).toFixed(1)}s`],
              ["Últimos fardos", String(catalog.lowStock.length)],
            ]
          : [["Status", catalog ? "Fora do ar" : "Verificando..."]],
      note: catalog && !catalog.online ? catalog.error : null,
    },
    {
      key: "gerente",
      title: "Gerente · Análises",
      role: "Lê tudo isso, gera relatórios semanais, mensais e anuais e sugere melhorias.",
      icon: LineChart,
      health: "inativo",
      stats: [["Situação", "Em construção, próximo passo"]],
    },
    {
      key: "armazem",
      title: "Armazém · Estoque",
      role: "Lê packing lists, confere quantidades e pesos e atualiza o estoque.",
      icon: Boxes,
      health: "inativo",
      stats: [["Situação", "Aguardando código do Apps Script"]],
    },
    {
      key: "instagram",
      title: "Conteúdo · Instagram",
      role: "Calendário, artes e legendas para gerar autoridade e trazer clientes.",
      icon: Camera,
      health: "inativo",
      stats: [["Situação", "Não iniciado"]],
    },
    {
      key: "whatsapp",
      title: "Atendimento · WhatsApp",
      role: "A Sofia atendendo também pelo WhatsApp da empresa.",
      icon: Bot,
      health: "inativo",
      stats: [["Situação", "Aguardando o chip"]],
    },
  ];

  const funnelMax = Math.max(1, ...report.funnel.map((step) => step.value));

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/admin" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-[#111]">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e]">
              Ecossistema Top Max
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">Central de Comando</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Cada agente, o que ele faz, como está performando e o que precisa de atenção.
              {loadedAt ? ` Atualizado ${loadedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.` : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([7, 30] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`h-10 rounded-full px-4 text-xs font-bold uppercase tracking-[0.12em] ${days === option ? "bg-[#111] text-white" : "border border-black/10 bg-white text-neutral-600"}`}
              >
                {option} dias
              </button>
            ))}
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-neutral-600 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Atualizar
            </button>
          </div>
        </header>

        <section className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Seu sistema:</span>
          {systemLinks.map((link) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#111] hover:border-[#d6b46a]"
            >
              {link.title} <ExternalLink size={12} />
            </a>
          ))}
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Alertas e melhorias</h2>
          <div className={`${cardClass} grid gap-3`}>
            {isLoading && report.alerts.length === 0 ? (
              <p className="text-sm text-neutral-500">Analisando...</p>
            ) : report.alerts.length === 0 ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={18} /> Tudo funcionando. Nenhuma ação necessária agora.
              </p>
            ) : (
              report.alerts.map((alert, index) => (
                <p key={index} className="flex items-start gap-3 text-sm leading-6 text-neutral-700">
                  {alert.level === "problema" ? (
                    <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                  ) : alert.level === "atencao" ? (
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  ) : (
                    <LineChart size={18} className="mt-0.5 shrink-0 text-[#9b7a3e]" />
                  )}
                  {alert.text}
                </p>
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Agentes</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => {
              const style = healthStyle[agent.health];
              const Icon = agent.icon;

              return (
                <article key={agent.key} className={`${cardClass} flex flex-col ${agent.health === "inativo" ? "opacity-75" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${style.badge}`}>
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} /> {style.label}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#111]">{agent.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{agent.role}</p>
                  <dl className="mt-4 grid gap-2 border-t border-black/10 pt-4 text-sm">
                    {agent.stats.map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-3">
                        <dt className="text-neutral-500">{label}</dt>
                        <dd className="text-right font-semibold text-[#111]">{isLoading && agent.health !== "inativo" ? "…" : value}</dd>
                      </div>
                    ))}
                  </dl>
                  {agent.note ? <p className="mt-3 rounded-xl bg-red-500/5 px-3 py-2 text-xs leading-5 text-red-700">{agent.note}</p> : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111]">Fluxo do cliente ({days} dias)</h2>
            <p className="mt-1 text-sm text-neutral-500">Do primeiro acesso ao catálogo de pedidos.</p>
            <div className="mt-5 grid gap-4">
              {report.funnel.map((step, index) => {
                const previous = index > 0 ? report.funnel[index - 1].value : null;
                return (
                  <div key={step.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#141414]">{step.label}</span>
                      <span className="text-neutral-500">
                        {step.value}
                        {previous ? <span className="ml-2 text-xs text-neutral-400">{percent(step.value, previous)}% da etapa anterior</span> : null}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
                      <div className="h-full rounded-full bg-[#d6b46a]" style={{ width: `${Math.max(2, (step.value / funnelMax) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111]">Últimas conversas da Sofia</h2>
            <p className="mt-1 text-sm text-neutral-500">O que os clientes estão perguntando.</p>
            <div className="mt-4 grid gap-3">
              {report.recentConversations.length === 0 ? (
                <p className="text-sm text-neutral-500">{isLoading ? "Carregando..." : "Nenhuma conversa no período."}</p>
              ) : (
                report.recentConversations.map((conversation) => (
                  <div key={conversation.sessionId} className="rounded-2xl border border-black/5 bg-[#fbfaf7] p-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>{conversation.count} mensagens</span>
                      <span>{ago(conversation.at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#111]">“{conversation.firstQuestion}”</p>
                    {conversation.lastReply ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-600">Sofia: {conversation.lastReply}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
