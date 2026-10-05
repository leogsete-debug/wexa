// Métricas da Central de Comando. Usadas pelo painel e pelo agente Gerente
// (que compara o período atual com o anterior).

export type Health = "ok" | "atencao" | "problema" | "inativo";

export type AgentRunRow = {
  agent: string;
  task: string;
  status: "ok" | "aviso" | "erro";
  provider: string | null;
  duration_ms: number | null;
  detail: string | null;
  created_at: string;
};

export type ChatRow = { session_id: string; role: "user" | "assistant"; content: string; provider: string | null; created_at: string };
export type EventRow = { event_name: string; event_source: string | null; visitor_id: string | null; product_name: string | null; created_at: string };
export type LeadRow = { id: string; name: string; source: string | null; status: string; created_at: string };

export type CatalogHealth =
  | {
      online: true;
      latencyMs: number;
      stockDate: string | null;
      products: number;
      featured: number;
      productNames?: string[];
      lowStock: string[];
      outOfStock: string[];
    }
  | { online: false; latencyMs: number; error: string };

export function distinct<T>(values: T[]) {
  return new Set(values.filter((value) => value != null && value !== "")).size;
}

export function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function ago(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return `há ${Math.round(hours / 24)} d`;
}

export function daysSince(dateText: string | null, now: number) {
  if (!dateText) return null;
  const date = new Date(`${dateText}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : Math.floor((now - date.getTime()) / 86_400_000);
}

export type CentralInput = {
  runs: AgentRunRow[];
  chats: ChatRow[];
  events: EventRow[];
  leads: LeadRow[];
  catalog: CatalogHealth | null;
  missingTables: string[];
  now: number;
};

export function computeCentralReport({ runs, chats, events, leads, catalog, missingTables, now }: CentralInput) {
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
}

export type CentralReport = ReturnType<typeof computeCentralReport>;

// Resumo numérico enviado ao agente Gerente (sem dados pessoais de clientes).
export function summarizeForManager(report: CentralReport) {
  return {
    visitantes: report.site.visitors,
    abriram_chat: report.site.chatOpeners,
    conversas_sofia: report.sofia.conversations,
    foram_ao_catalogo: report.site.storeVisitors,
    taxa_site_para_catalogo_pct: report.site.clickRate,
    cliques_no_catalogo_por_origem: Object.fromEntries(report.site.topSources),
    contatos_deixados: report.funnel.at(-1)?.value ?? 0,
    respostas_sofia: report.sofia.runs,
    falhas_sofia: report.sofia.errors,
    taxa_falha_sofia_pct: report.sofia.errorRate,
    tempo_medio_resposta_s: report.sofia.avgLatency,
    indicacoes_de_produto: report.sofia.recommendations,
    ia_usada: report.sofia.providers,
  };
}

export type ManagerSummary = ReturnType<typeof summarizeForManager>;
