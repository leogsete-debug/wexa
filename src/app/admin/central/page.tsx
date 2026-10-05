"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Boxes,
  CheckCircle2,
  ExternalLink,
  Camera,
  FileText,
  Sparkles,
  Wand2,
  LineChart,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Store,
  XCircle,
} from "lucide-react";
import {
  ago,
  computeCentralReport,
  percent,
  summarizeForManager,
  type AgentRunRow,
  type CatalogHealth,
  type ChatRow,
  type EventRow,
  type Health,
  type LeadRow,
} from "@/lib/central-metrics";
import { supabase } from "@/lib/supabase";

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

type ManagerReport = {
  id: string;
  kind: "semanal" | "mensal" | "anual";
  period_start: string;
  period_end: string;
  analysis: string;
  provider: string | null;
  created_at: string;
};

const reportDays: Record<ManagerReport["kind"], number> = { semanal: 7, mensal: 30, anual: 365 };

function ReportText({ text }: { text: string }) {
  return (
    <div className="grid gap-2 text-sm leading-6 text-neutral-700">
      {text.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={index} className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9b7a3e] first:mt-0">
              {trimmed.slice(3)}
            </h4>
          );
        }
        if (/^[-*•] /.test(trimmed)) {
          return (
            <p key={index} className="flex gap-2">
              <span className="text-[#d6b46a]">•</span>
              <span>{trimmed.slice(2).replace(/\*\*/g, "")}</span>
            </p>
          );
        }
        return <p key={index}>{trimmed.replace(/\*\*/g, "")}</p>;
      })}
    </div>
  );
}

const cardClass =
  "rounded-[1.5rem] border border-white/75 bg-white/85 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)]";

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
  const [reports, setReports] = useState<ManagerReport[] | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<ManagerReport["kind"] | null>(null);
  const [reportError, setReportError] = useState("");
  const autoReportTried = useRef(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const [runsResult, chatsResult, eventsResult, leadsResult, catalogResult, reportsResult] = await Promise.all([
      supabase.from("agent_runs").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(3000),
      supabase.from("chat_messages").select("session_id, role, content, provider, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(3000),
      supabase.from("analytics_events").select("event_name, event_source, visitor_id, product_name, created_at").gte("created_at", since).limit(10000),
      supabase.from("leads").select("id, name, source, status, created_at").gte("created_at", since).order("created_at", { ascending: false }),
      fetch("/api/admin/catalog-health", { cache: "no-store" })
        .then((response) => response.json() as Promise<CatalogHealth>)
        .catch(() => ({ online: false, latencyMs: 0, error: "Falha ao consultar" }) as CatalogHealth),
      supabase
        .from("manager_reports")
        .select("id, kind, period_start, period_end, analysis, provider, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setMissingTables([runsResult.error ? "agent_runs" : null, chatsResult.error ? "chat_messages" : null].filter(Boolean) as string[]);
    setRuns((runsResult.data ?? []) as AgentRunRow[]);
    setChats((chatsResult.data ?? []) as ChatRow[]);
    setEvents((eventsResult.data ?? []) as EventRow[]);
    setLeads((leadsResult.data ?? []) as LeadRow[]);
    setCatalog(catalogResult);
    setReports(reportsResult.error ? [] : ((reportsResult.data ?? []) as ManagerReport[]));
    setLoadedAt(new Date());
    setIsLoading(false);
  }, [days]);

  useEffect(() => {
    const timeout = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const report = useMemo(
    () => computeCentralReport({ runs, chats, events, leads, catalog, missingTables, now: loadedAt ? loadedAt.getTime() : 0 }),
    [runs, chats, events, leads, catalog, missingTables, loadedAt],
  );

  // Agente Gerente: busca o período atual + o anterior, resume e pede a análise à IA.
  const generateReport = useCallback(
    async (kind: ManagerReport["kind"]) => {
      setGenerating(kind);
      setReportError("");

      try {
        const now = Date.now();
        const span = reportDays[kind] * 86_400_000;
        const cutoff = new Date(now - span).toISOString();
        const since = new Date(now - 2 * span).toISOString();

        const [runsResult, chatsResult, eventsResult, leadsResult, sessionResult] = await Promise.all([
          supabase.from("agent_runs").select("*").gte("created_at", since).limit(20000),
          supabase
            .from("chat_messages")
            .select("session_id, role, content, provider, created_at")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(20000),
          supabase
            .from("analytics_events")
            .select("event_name, event_source, visitor_id, product_name, created_at")
            .gte("created_at", since)
            .limit(50000),
          supabase.from("leads").select("id, name, source, status, created_at").gte("created_at", since),
          supabase.auth.getSession(),
        ]);

        const split = <T extends { created_at: string }>(rows: T[] | null) => ({
          current: (rows ?? []).filter((row) => row.created_at >= cutoff),
          previous: (rows ?? []).filter((row) => row.created_at < cutoff),
        });
        const runRows = split(runsResult.data as AgentRunRow[] | null);
        const chatRows = split(chatsResult.data as ChatRow[] | null);
        const eventRows = split(eventsResult.data as EventRow[] | null);
        const leadRows = split(leadsResult.data as LeadRow[] | null);

        const current = computeCentralReport({
          runs: runRows.current,
          chats: chatRows.current,
          events: eventRows.current,
          leads: leadRows.current,
          catalog,
          missingTables: [],
          now,
        });
        const previous = computeCentralReport({
          runs: runRows.previous,
          chats: chatRows.previous,
          events: eventRows.previous,
          leads: leadRows.previous,
          catalog: null,
          missingTables: [],
          now,
        });

        const token = sessionResult.data.session?.access_token;
        if (!token) throw new Error("Sessão expirada. Entre de novo no painel.");

        const response = await fetch("/api/gerente/relatorio", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            kind,
            periodStart: cutoff,
            periodEnd: new Date(now).toISOString(),
            current: summarizeForManager(current),
            previous: summarizeForManager(previous),
            catalog:
              catalog && catalog.online
                ? {
                    estoque_de: catalog.stockDate,
                    produtos: catalog.products,
                    produtos_no_catalogo: catalog.productNames ?? [],
                    destaques_no_site: catalog.featured,
                    ultimos_fardos: catalog.lowStock,
                    sem_estoque: catalog.outOfStock,
                  }
                : { online: false },
            questions: chatRows.current
              .filter((chat) => chat.role === "user" && !chat.session_id.startsWith("teste-claude"))
              .map((chat) => chat.content),
            alerts: current.alerts.map((alert) => alert.text),
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.report) {
          throw new Error(
            response.status === 401
              ? "Sessão expirada. Entre de novo no painel."
              : "A IA não conseguiu gerar o relatório agora. Tente de novo em alguns minutos.",
          );
        }

        const saved = data.report as ManagerReport;
        setReports((existing) => [saved, ...(existing ?? []).filter((item) => item.id !== saved.id)]);
        setSelectedReportId(saved.id ?? null);
      } catch (error) {
        setReportError(error instanceof Error ? error.message : "Falha ao gerar relatório.");
      } finally {
        setGenerating(null);
      }
    },
    [catalog],
  );

  // Relatório semanal automático: se o último tem mais de 7 dias, o Gerente gera sozinho ao abrir a Central.
  useEffect(() => {
    if (!reports || !loadedAt || !catalog || autoReportTried.current) return;
    const lastWeekly = reports.find((item) => item.kind === "semanal");
    const isStale = !lastWeekly || loadedAt.getTime() - new Date(lastWeekly.created_at).getTime() > 7 * 86_400_000;
    if (!isStale) return;
    autoReportTried.current = true;
    const timeout = window.setTimeout(() => generateReport("semanal"), 0);
    return () => window.clearTimeout(timeout);
  }, [reports, loadedAt, catalog, generateReport]);

  const selectedReport = reports?.find((item) => item.id === selectedReportId) ?? reports?.[0] ?? null;
  const lastWeeklyReport = reports?.find((item) => item.kind === "semanal") ?? null;
  const managerHealth: Health =
    !reports ||
    (lastWeeklyReport && (loadedAt?.getTime() ?? 0) - new Date(lastWeeklyReport.created_at).getTime() <= 8 * 86_400_000)
      ? "ok"
      : "atencao";

  const contentRuns = runs.filter((run) => run.agent === "conteudo");
  const contentErrors = contentRuns.filter((run) => run.status === "erro");
  const contentHealth: Health =
    contentRuns.length === 0 ? "ok" : percent(contentErrors.length, contentRuns.length) >= 30 ? "atencao" : "ok";

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
      health: managerHealth,
      stats: [
        ["Último relatório", reports?.[0] ? `${reports[0].kind} · ${ago(reports[0].created_at)}` : "Nenhum ainda"],
        ["Relatórios salvos", String(reports?.length ?? 0)],
        ["Semanal", "Automático a cada 7 dias"],
      ],
    },
    {
      key: "conteudo",
      title: "Conteúdo · Estúdio",
      role: "Cria artes, vídeos e legendas com os produtos e o estoque reais do catálogo.",
      icon: Wand2,
      health: contentHealth,
      stats: [
        ["Legendas geradas", String(contentRuns.filter((run) => run.task === "legenda" && run.status === "ok").length)],
        ["Imagens com IA", String(contentRuns.filter((run) => run.task === "imagem_ia" && run.status === "ok").length)],
        ["Falhas", String(contentErrors.length)],
      ],
      note: contentErrors[0]?.detail?.includes("not_configured") ? null : contentErrors[0] ? `Último erro: ${contentErrors[0].detail ?? ""}` : null,
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

        <section className="mt-8">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Relatórios do Gerente</h2>
            <div className="flex flex-wrap gap-2">
              {(["semanal", "mensal", "anual"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  disabled={generating !== null}
                  onClick={() => generateReport(kind)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-50"
                >
                  <Sparkles size={14} className={generating === kind ? "animate-pulse" : ""} />
                  {generating === kind ? "Analisando..." : `Gerar ${kind}`}
                </button>
              ))}
            </div>
          </div>

          <div className={`${cardClass} grid gap-5 lg:grid-cols-[16rem_1fr]`}>
            <div className="grid content-start gap-2 lg:border-r lg:border-black/10 lg:pr-5">
              {reports === null ? (
                <p className="text-sm text-neutral-500">Carregando...</p>
              ) : reports.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  {generating ? "O Gerente está preparando o primeiro relatório..." : "Nenhum relatório ainda."}
                </p>
              ) : (
                reports.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedReportId(item.id)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                      selectedReport?.id === item.id ? "bg-[#111] text-white" : "hover:bg-black/5"
                    }`}
                  >
                    <FileText size={16} className="shrink-0 text-[#d6b46a]" />
                    <span>
                      <span className="block font-semibold capitalize">{item.kind}</span>
                      <span className={`block text-xs ${selectedReport?.id === item.id ? "text-white/60" : "text-neutral-500"}`}>
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>

            <div>
              {reportError ? (
                <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
                  {reportError}
                </p>
              ) : null}
              {selectedReport ? (
                <>
                  <p className="mb-4 text-xs text-neutral-500">
                    Relatório {selectedReport.kind} · {new Date(selectedReport.period_start).toLocaleDateString("pt-BR")} a{" "}
                    {new Date(selectedReport.period_end).toLocaleDateString("pt-BR")}
                    {selectedReport.provider ? ` · IA: ${selectedReport.provider}` : ""}
                  </p>
                  <ReportText text={selectedReport.analysis} />
                </>
              ) : (
                <p className="text-sm text-neutral-500">
                  {generating
                    ? "Analisando os números do período e comparando com o anterior..."
                    : "Gere um relatório para ver a análise do Gerente."}
                </p>
              )}
            </div>
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
