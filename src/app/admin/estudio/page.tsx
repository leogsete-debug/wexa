"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarPlus, Check, Clapperboard, Compass, Copy, Download, ImageIcon, Loader2, PenLine, Search, Sparkles, Wand2 } from "lucide-react";
import { drawArt, formatSizes, loadImage, renderVideo, type ArtMode, type ArtSlide, type StudioFormat } from "@/lib/studio-render";
import { toDateKey, uploadContentMedia } from "@/lib/content-calendar";
import { supabase } from "@/lib/supabase";

type CatalogItem = {
  key: string;
  name: string;
  piecesPerBale: number;
  balesAvailable: number;
  piecesAvailable: number;
  suggestedPrice: number;
  isNew: boolean;
  isFeatured: boolean;
  photoCount: number;
};

type Tab = "estrategia" | "arte" | "video" | "legenda";

type StrategyPost = {
  dia: number;
  formato: string;
  pilar: string;
  tema: string;
  gancho: string;
  produto: string | null;
  objetivo: string;
  chamada: string;
};

type Strategy = {
  posicionamento: string;
  persona: string;
  tom_de_voz: string;
  bio_sugerida: string;
  pilares: Array<{ nome: string; objetivo: string; porcentagem: number; ideias?: string[] }>;
  frequencia: string;
  calendario: StrategyPost[];
  ganchos?: string[];
  metricas?: string[];
};

type Profile = {
  instagram: string;
  publico: string;
  objetivo: string;
  tom: string;
  seguidores: string;
  referencias: string;
  observacoes: string;
};

const defaultProfile: Profile = {
  instagram: "@topmaxexport",
  publico: "Lojistas de cama, mesa e banho, atacadistas e redes no Brasil",
  objetivo: "Gerar autoridade e levar lojistas ao catálogo para fazer pedidos",
  tom: "Profissional, direto e confiável",
  seguidores: "",
  referencias: "",
  observacoes: "",
};

const profileFields: Array<[keyof Profile, string, string]> = [
  ["instagram", "Instagram", "@seuperfil"],
  ["publico", "Público", "Quem você quer atrair"],
  ["objetivo", "Objetivo", "O que o perfil precisa gerar"],
  ["tom", "Tom de voz", "Como a marca fala"],
  ["seguidores", "Seguidores hoje", "Ex.: 800"],
  ["referencias", "Referências", "Perfis que você admira"],
  ["observacoes", "O que funciona / não funciona", "Ex.: vídeos do contêiner dão mais alcance"],
];
type BadgeOption = "auto" | "Destaque" | "Novidade" | "Últimas unidades" | "Coleção" | "Pronta entrega" | "none";
type Goal = "venda" | "ultimas" | "novidade" | "autoridade" | "colecao";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const photoUrl = (key: string, index = 1) => `/api/catalogo/foto?k=${encodeURIComponent(key)}${index > 1 ? `&n=${index}` : ""}`;

const formatLabels: Record<StudioFormat, string> = { post: "Feed 4:5", story: "Reels/Stories 9:16", square: "Quadrado 1:1" };
const modeLabels: Record<ArtMode, { title: string; hint: string }> = {
  real: { title: "Foto real", hint: "Foto do catálogo + layout Top Max. Grátis e instantâneo." },
  cenario: { title: "Cenário IA + foto real", hint: "A IA cria o ambiente e o produto verdadeiro entra em destaque." },
  ia: { title: "Imagem 100% IA", hint: "Imagem ilustrativa criada do zero pelo prompt." },
};
const goalLabels: Record<Goal, string> = {
  venda: "Vender agora",
  ultimas: "Últimas unidades",
  novidade: "Novidade",
  autoridade: "Autoridade da marca",
  colecao: "Coleção",
};

function suggestScene(name: string) {
  const n = name.toLowerCase();
  if (/toalha|banho|box|pvc/.test(n)) return "bright modern bathroom interior, white tiles, plants, soft daylight";
  if (/mesa|trilho|talher|faqueiro|cozinha|jogo americano/.test(n)) return "elegant dining room, wooden table, warm natural light";
  if (/tapete|prainha/.test(n) && !/box|banho/.test(n)) return "cozy modern living room, sofa, wooden floor, warm afternoon light";
  return "cozy modern bedroom interior, bed with neutral linens, soft warm daylight";
}

function scenePrompt(name: string) {
  return `${suggestScene(name)}, empty center area, professional interior photography, shallow depth of field, no people, no text, no logos, photorealistic`;
}

function aiPrompt(name: string) {
  return `professional product photography of ${name.toLowerCase()} (home textile), ${suggestScene(name)}, high detail, soft light, no text, no logos, photorealistic`;
}

function badgeFor(item: CatalogItem, option: BadgeOption, count: number) {
  if (option === "none") return null;
  if (option !== "auto") return option;
  if (count > 1) return "Coleção";
  if (item.balesAvailable <= 50) return "Últimas unidades";
  if (item.isNew) return "Novidade";
  if (item.isFeatured) return "Destaque";
  return "Pronta entrega";
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Entre de novo no painel.");
  return { Authorization: `Bearer ${token}` };
}

export default function StudioPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>("estrategia");
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [strategyDate, setStrategyDate] = useState<string | null>(null);
  const [strategyBusy, setStrategyBusy] = useState(false);
  const [strategyError, setStrategyError] = useState("");
  const [activeIdea, setActiveIdea] = useState<StrategyPost | null>(null);
  const [format, setFormat] = useState<StudioFormat>("post");
  const [mode, setMode] = useState<ArtMode>("real");
  const [badge, setBadge] = useState<BadgeOption>("auto");
  const [showPrice, setShowPrice] = useState(true);
  const [cta, setCta] = useState("Peça pelo catálogo");
  const [ctaHint, setCtaHint] = useState("link na bio");
  const [prompt, setPrompt] = useState("");
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [imageAiReady, setImageAiReady] = useState<boolean | null>(null);
  const [artError, setArtError] = useState("");
  const [aiError, setAiError] = useState("");
  const [secondsPerSlide, setSecondsPerSlide] = useState(2.5);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoExt, setVideoExt] = useState("mp4");
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoError, setVideoError] = useState("");
  const [goal, setGoal] = useState<Goal>("venda");
  const [caption, setCaption] = useState("");
  const [captionBusy, setCaptionBusy] = useState(false);
  const [captionError, setCaptionError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveDate, setSaveDate] = useState(() => toDateKey(new Date()));
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const previewRef = useRef<HTMLCanvasElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);

  // Última estratégia salva + perfil lembrado neste navegador
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("topmax_studio_profile");
      if (saved) {
        const parsed = { ...defaultProfile, ...JSON.parse(saved) } as Profile;
        window.setTimeout(() => setProfile(parsed), 0);
      }
    } catch {
      // sem localStorage: usa o perfil padrão
    }

    supabase
      .from("content_strategies")
      .select("profile, strategy, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const latest = data?.[0];
        if (!latest) return;
        setStrategy(latest.strategy as Strategy);
        setStrategyDate(latest.created_at);
        if (latest.profile && Object.keys(latest.profile).length) setProfile({ ...defaultProfile, ...(latest.profile as Partial<Profile>) });
      });
  }, []);

  useEffect(() => {
    fetch("/api/conteudo/imagem", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { configured?: boolean }) => setImageAiReady(Boolean(data.configured)))
      .catch(() => setImageAiReady(false));
  }, []);

  useEffect(() => {
    fetch("/api/catalogo/produtos", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { items?: CatalogItem[] }) => {
        const list = (data.items ?? []).filter((item) => item.photoCount > 0);
        setItems(list);
        const first = list.find((item) => item.isFeatured) ?? list[0];
        if (first) setSelected([first.key]);
      })
      .catch(() => setLoadError("Não foi possível carregar o catálogo de pedidos."));
  }, []);

  const selectedItems = useMemo(
    () => selected.map((key) => items.find((item) => item.key === key)).filter(Boolean) as CatalogItem[],
    [selected, items],
  );
  const main = selectedItems[0] ?? null;

  // Prompt sugerido acompanha o produto e o modo (pode ser editado à mão)
  useEffect(() => {
    if (!main) return;
    const timeout = window.setTimeout(() => {
      setPrompt(mode === "ia" ? aiPrompt(main.name) : scenePrompt(main.name));
      setAiImage(null);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [main, mode]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? items.filter((item) => item.name.toLowerCase().includes(term)) : items;
  }, [items, search]);

  const toggleProduct = (key: string) => {
    setSelected((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      const limit = tab === "arte" && mode !== "real" ? 1 : tab === "arte" ? 4 : 8;
      return [...current, key].slice(-limit);
    });
  };

  const buildSlide = useCallback(
    async (item: CatalogItem, group: CatalogItem[], art: ArtMode, ai: string | null): Promise<ArtSlide> => {
      const photos = await Promise.all(group.map((entry) => loadImage(photoUrl(entry.key, photoIndex[entry.key] ?? 1))));
      return {
        mode: art,
        photos,
        aiImage: ai ? await loadImage(ai) : null,
        name: group.length > 1 ? `${group.length} produtos com pronta entrega` : item.name,
        stockLine: group.length > 1 ? "Compra em fardos para lojistas" : `${item.piecesPerBale} pç/fardo · ${item.balesAvailable.toLocaleString("pt-BR")} fardos`,
        priceLine:
          showPrice && group.length === 1 && item.suggestedPrice > 0 ? `Sugerido ${money.format(item.suggestedPrice)}/peça` : null,
        badge: badgeFor(item, badge, group.length),
        cta,
        ctaHint,
      };
    },
    [photoIndex, showPrice, badge, cta, ctaHint],
  );

  // Pré-visualização da arte
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !main || tab !== "arte") return;
    let cancelled = false;
    const [w, h] = formatSizes[format];
    canvas.width = w;
    canvas.height = h;
    const group = mode === "real" ? selectedItems.slice(0, 4) : [main];

    buildSlide(main, group, mode, mode === "real" ? null : aiImage)
      .then((slide) => {
        if (cancelled) return;
        setArtError("");
        const ctx = canvas.getContext("2d");
        if (ctx) drawArt(ctx, slide, 0);
      })
      .catch((error) => {
        if (!cancelled) setArtError(error instanceof Error ? error.message : "Falha ao montar a arte.");
      });

    return () => {
      cancelled = true;
    };
  }, [main, selectedItems, format, mode, aiImage, buildSlide, tab]);

  const generateAiImage = async () => {
    setAiBusy(true);
    setAiError("");
    try {
      const response = await fetch("/api/conteudo/imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.image) {
        throw new Error(
          data.error === "image_ai_not_configured"
            ? "A geração de imagens com IA ainda não está ativada (falta a conta gratuita da Cloudflare). Use o modo Foto real por enquanto."
            : `A IA de imagem não respondeu${data.detail ? ` (${data.detail})` : ""}. Tente de novo.`,
        );
      }
      setAiImage(data.image);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Falha ao gerar imagem.");
    } finally {
      setAiBusy(false);
    }
  };

  const generateStrategy = async () => {
    setStrategyBusy(true);
    setStrategyError("");
    try {
      try {
        window.localStorage.setItem("topmax_studio_profile", JSON.stringify(profile));
      } catch {
        // ignora
      }
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const { data: chats } = await supabase
        .from("chat_messages")
        .select("content, session_id")
        .eq("role", "user")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(80);
      const questions = (chats ?? [])
        .filter((chat) => !String(chat.session_id).startsWith("teste-claude"))
        .map((chat) => chat.content);

      const response = await fetch("/api/conteudo/estrategia", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ profile, questions }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.strategy?.strategy) throw new Error("A IA não conseguiu montar a estratégia agora. Tente de novo em instantes.");
      setStrategy(data.strategy.strategy as Strategy);
      setStrategyDate(data.strategy.created_at ?? new Date().toISOString());
    } catch (error) {
      setStrategyError(error instanceof Error ? error.message : "Falha ao gerar a estratégia.");
    } finally {
      setStrategyBusy(false);
    }
  };

  // "Criar" um post do calendário: abre a ferramenta certa já preenchida
  const createFromIdea = (idea: StrategyPost) => {
    setActiveIdea(idea);
    const match = idea.produto ? items.find((item) => item.name.toLowerCase() === idea.produto?.toLowerCase()) : null;
    if (match) setSelected([match.key]);
    const goalMap: Record<string, Goal> = { venda: "venda", ultimas: "ultimas", novidade: "novidade", autoridade: "autoridade", colecao: "colecao" };
    setGoal(goalMap[idea.objetivo] ?? "venda");
    if (idea.chamada) setCta(idea.chamada.slice(0, 28));
    const isVertical = /reels|story/i.test(idea.formato);
    setFormat(isVertical ? "story" : "post");
    if (idea.objetivo === "ultimas") setBadge("Últimas unidades");
    else if (idea.objetivo === "novidade") setBadge("Novidade");
    else setBadge("auto");
    setCaption("");
    setTab(/reels/i.test(idea.formato) && match ? "video" : match ? "arte" : "legenda");
  };

  // Salva a arte ou o vídeo no calendário da Central (com a legenda atual, se houver)
  const saveToCalendar = async (kind: "arte" | "video") => {
    if (!main) return;
    setSaveBusy(true);
    setSaveMessage("");
    try {
      let blob: Blob | null = null;
      let extension = "png";
      if (kind === "arte") {
        const canvas = previewRef.current;
        if (!canvas) throw new Error("Arte indisponível");
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      } else {
        if (!videoUrl) throw new Error("Gere o vídeo primeiro");
        blob = await (await fetch(videoUrl)).blob();
        extension = videoExt;
      }
      if (!blob) throw new Error("Falha ao preparar a mídia");

      const title = activeIdea?.gancho ?? (selectedItems.length > 1 ? `${selectedItems.length} produtos` : main.name);
      const media = await uploadContentMedia(blob, extension, title);
      const { error } = await supabase.from("content_items").insert({
        scheduled_for: saveDate || null,
        status: caption ? "agendado" : "rascunho",
        kind,
        format: kind === "video" ? "reels" : format === "story" ? "story" : "post",
        title: activeIdea?.tema ?? title,
        pillar: activeIdea?.pilar ?? null,
        hook: title,
        product_name: selectedItems.map((item) => item.name).join(", ") || null,
        caption: caption || null,
        media_url: media.url,
        media_path: media.path,
        strategy_day: activeIdea?.dia ?? null,
        source: "manual",
      });
      if (error) throw new Error(error.message);
      setSaveMessage(`Salvo no calendário para ${new Date(`${saveDate}T12:00:00`).toLocaleDateString("pt-BR")}${caption ? "" : " (sem legenda: gere na aba Legenda e salve de novo, ou edite depois)"}.`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? `Não foi possível salvar: ${error.message}` : "Não foi possível salvar.");
    } finally {
      setSaveBusy(false);
    }
  };

  const saveControls = (kind: "arte" | "video", disabled: boolean) => (
    <div className="grid gap-2 rounded-2xl border border-black/10 p-3">
      <label className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-600">
        Postar em
        <input type="date" value={saveDate} onChange={(event) => setSaveDate(event.target.value)} className="h-9 rounded-full border border-black/10 bg-white px-3 text-xs" />
      </label>
      <button type="button" onClick={() => saveToCalendar(kind)} disabled={disabled || saveBusy} className={primary}>
        {saveBusy ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} Salvar no calendário
      </button>
      {saveMessage ? <p className="text-xs leading-5 text-[#9b7a3e]">{saveMessage}</p> : null}
      <Link href="/admin/central#conteudo" className="text-center text-xs font-semibold text-neutral-500 hover:underline">
        Ver calendário na Central
      </Link>
    </div>
  );

  const downloadArt = () => {
    const canvas = previewRef.current;
    if (!canvas || !main) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `topmax-${main.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${format}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    }, "image/png");
  };

  const generateVideo = async () => {
    const canvas = videoCanvasRef.current;
    if (!canvas || selectedItems.length === 0) return;
    setVideoError("");
    setVideoProgress(0);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);

    try {
      const [w, h] = formatSizes[format];
      canvas.width = w;
      canvas.height = h;
      const slides: ArtSlide[] = [];
      for (const item of selectedItems) {
        const count = Math.min(item.photoCount, selectedItems.length === 1 ? 4 : 2);
        for (let index = 1; index <= count; index += 1) {
          const slide = await buildSlide(item, [item], "real", null);
          slide.photos = [await loadImage(photoUrl(item.key, index))];
          slides.push(slide);
        }
      }

      const { blob, extension } = await renderVideo(
        canvas,
        {
          slides,
          secondsPerSlide,
          intro: {
            title: selectedItems.length === 1 ? selectedItems[0].name : "Pronta entrega em fardos",
            subtitle: "Importação direta para lojistas",
          },
          outro: { title: cta, subtitle: ctaHint },
          footer: "topmax · atacado em fardos",
        },
        setVideoProgress,
      );
      setVideoExt(extension);
      setVideoUrl(URL.createObjectURL(blob));
    } catch (error) {
      setVideoError(error instanceof Error ? error.message : "Falha ao gerar o vídeo.");
    } finally {
      setVideoProgress(null);
    }
  };

  const generateCaption = async () => {
    if (selectedItems.length === 0 && !activeIdea) return;
    setCaptionBusy(true);
    setCaptionError("");
    try {
      const response = await fetch("/api/conteudo/legenda", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({
          goal,
          format: format === "story" ? "reels" : "post",
          strategy: strategy
            ? {
                posicionamento: strategy.posicionamento,
                persona: strategy.persona,
                tom_de_voz: strategy.tom_de_voz,
                ...(activeIdea
                  ? { pilar: activeIdea.pilar, tema: activeIdea.tema, gancho: activeIdea.gancho, chamada: activeIdea.chamada }
                  : {}),
              }
            : null,
          products: selectedItems.map((item) => ({
            nome: item.name,
            pecas_por_fardo: item.piecesPerBale,
            fardos_disponiveis: item.balesAvailable,
            preco_sugerido_por_peca: item.suggestedPrice ? money.format(item.suggestedPrice) : null,
            novidade: item.isNew,
            ultimos_fardos: item.balesAvailable <= 50,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.caption) throw new Error("A IA não conseguiu escrever a legenda agora. Tente de novo.");
      setCaption(data.caption);
    } catch (error) {
      setCaptionError(error instanceof Error ? error.message : "Falha ao gerar legenda.");
    } finally {
      setCaptionBusy(false);
    }
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const chip = (active: boolean) =>
    `rounded-full px-3.5 py-2 text-xs font-bold transition ${active ? "bg-[#111] text-white" : "border border-black/10 bg-white text-neutral-600 hover:border-[#d6b46a]"}`;
  const card = "rounded-[1.5rem] border border-white/75 bg-white/85 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09)]";
  const input = "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#d6b46a]";
  const primary =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-50";

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-black/10 pb-6">
          <Link href="/admin" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-[#111]">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e]">
            Agente de Conteúdo
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">Estúdio de Conteúdo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Artes, vídeos e legendas para as redes sociais, feitos com os produtos e o estoque reais do catálogo.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            ["estrategia", "Estratégia", Compass],
            ["arte", "Arte", ImageIcon],
            ["video", "Vídeo", Clapperboard],
            ["legenda", "Legenda", PenLine],
          ] as const).map(([value, label, Icon]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`${chip(tab === value)} inline-flex items-center gap-2 px-5 py-2.5`}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <span className="mx-2 hidden h-9 w-px bg-black/10 sm:block" />
          {(Object.keys(formatLabels) as StudioFormat[]).map((value) => (
            <button key={value} type="button" onClick={() => setFormat(value)} className={chip(format === value)}>
              {formatLabels[value]}
            </button>
          ))}
        </div>

        {activeIdea && tab !== "estrategia" ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#d6b46a]/40 bg-[#d6b46a]/10 px-4 py-3 text-sm">
            <Compass size={16} className="text-[#9b7a3e]" />
            <span>
              <strong>Dia {activeIdea.dia} · {activeIdea.pilar}:</strong> {activeIdea.gancho}
            </span>
            <button type="button" onClick={() => setActiveIdea(null)} className="ml-auto text-xs font-semibold text-neutral-500 hover:underline">
              Limpar
            </button>
          </div>
        ) : null}

        {tab === "estrategia" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_1fr]">
            <aside className={`${card} grid h-fit gap-3`}>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-500">Seu perfil</h2>
              {profileFields.map(([field, label, placeholder]) => (
                <label key={field} className="grid gap-1 text-xs font-semibold text-neutral-600">
                  {label}
                  {field === "observacoes" || field === "referencias" ? (
                    <textarea
                      value={profile[field]}
                      onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))}
                      placeholder={placeholder}
                      className="min-h-20 rounded-2xl border border-black/10 bg-white p-3 text-sm font-normal outline-none focus:border-[#d6b46a]"
                    />
                  ) : (
                    <input
                      value={profile[field]}
                      onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))}
                      placeholder={placeholder}
                      className={`${input} font-normal`}
                    />
                  )}
                </label>
              ))}
              <button type="button" onClick={generateStrategy} disabled={strategyBusy} className={primary}>
                {strategyBusy ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
                {strategyBusy ? "Montando (até 1 min)..." : strategy ? "Refazer estratégia" : "Criar estratégia"}
              </button>
              <p className="text-xs leading-5 text-neutral-500">Usa o estoque real do catálogo e as perguntas que os clientes fizeram à Sofia.</p>
              {strategyError ? <p className="text-xs text-red-600">{strategyError}</p> : null}
            </aside>

            <section className="grid content-start gap-6">
              {!strategy ? (
                <div className={card}>
                  <p className="text-sm leading-6 text-neutral-600">
                    {strategyBusy
                      ? "O agente está analisando o perfil, o estoque e as dúvidas dos clientes para montar a estratégia..."
                      : "Preencha o perfil e clique em Criar estratégia. O agente monta posicionamento, pilares e um calendário de 14 dias com produtos reais."}
                  </p>
                </div>
              ) : (
                <>
                  <div className={`${card} grid gap-4 md:grid-cols-2`}>
                    {([
                      ["Posicionamento", strategy.posicionamento],
                      ["Cliente ideal", strategy.persona],
                      ["Tom de voz", strategy.tom_de_voz],
                      ["Frequência", strategy.frequencia],
                    ] as const).map(([label, value]) => (
                      <div key={label}>
                        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b7a3e]">{label}</h3>
                        <p className="mt-1 text-sm leading-6 text-neutral-700">{value}</p>
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b7a3e]">Bio sugerida</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <p className="rounded-2xl bg-[#fbfaf7] px-4 py-2 text-sm text-[#111]">{strategy.bio_sugerida}</p>
                        <button type="button" onClick={() => navigator.clipboard.writeText(strategy.bio_sugerida)} className="text-xs font-semibold text-[#9b7a3e] hover:underline">
                          Copiar
                        </button>
                      </div>
                    </div>
                    {strategyDate ? <p className="text-xs text-neutral-400 md:col-span-2">Criada em {new Date(strategyDate).toLocaleString("pt-BR")}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {strategy.pilares.map((pillar) => (
                      <article key={pillar.nome} className={card}>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-[#111]">{pillar.nome}</h3>
                          <span className="rounded-full bg-[#d6b46a]/15 px-2.5 py-1 text-xs font-bold text-[#9b7a3e]">{pillar.porcentagem}%</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">{pillar.objetivo}</p>
                      </article>
                    ))}
                  </div>

                  <div className={card}>
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#111]">Calendário de 14 dias</h3>
                    <div className="mt-4 grid gap-2">
                      {strategy.calendario.map((post) => (
                        <div key={`${post.dia}-${post.gancho}`} className="grid items-center gap-3 rounded-2xl border border-black/5 bg-[#fbfaf7] p-3 sm:grid-cols-[3rem_6rem_1fr_auto]">
                          <span className="text-sm font-bold text-[#9b7a3e]">Dia {post.dia}</span>
                          <span className="w-fit rounded-full bg-[#111] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white">{post.formato}</span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[#111]">{post.gancho}</span>
                            <span className="block text-xs text-neutral-500">
                              {post.pilar} · {post.tema}
                              {post.produto ? ` · ${post.produto}` : ""}
                            </span>
                          </span>
                          <button type="button" onClick={() => createFromIdea(post)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#d6b46a] px-4 text-xs font-bold text-[#111] hover:bg-[#111] hover:text-white">
                            <Wand2 size={13} /> Criar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {strategy.ganchos?.length || strategy.metricas?.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {strategy.ganchos?.length ? (
                        <div className={card}>
                          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b7a3e]">Banco de ganchos</h3>
                          <ul className="mt-2 grid gap-1.5 text-sm text-neutral-700">
                            {strategy.ganchos.map((hook) => (
                              <li key={hook}>• {hook}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {strategy.metricas?.length ? (
                        <div className={card}>
                          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b7a3e]">O que acompanhar</h3>
                          <ul className="mt-2 grid gap-1.5 text-sm text-neutral-700">
                            {strategy.metricas.map((metric) => (
                              <li key={metric}>• {metric}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        ) : null}

        <div className={`mt-6 grid gap-6 lg:grid-cols-[22rem_1fr] ${tab === "estrategia" ? "hidden" : ""}`}>
          {/* Produtos */}
          <aside className={`${card} h-fit`}>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-500">Produtos</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {tab === "arte" && mode !== "real" ? "Escolha 1 produto." : tab === "arte" ? "1 produto ou até 4 para coleção." : "Até 8 produtos."}
            </p>
            <label className="mt-3 flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3">
              <Search size={16} className="text-neutral-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Buscar produto" />
            </label>
            {loadError ? <p className="mt-3 text-sm text-red-600">{loadError}</p> : null}
            <div className="mt-3 grid max-h-[32rem] gap-2 overflow-y-auto pr-1">
              {items.length === 0 && !loadError ? <p className="text-sm text-neutral-500">Carregando catálogo...</p> : null}
              {filtered.map((item) => {
                const active = selected.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleProduct(item.key)}
                    className={`flex items-center gap-3 rounded-2xl border p-2 text-left transition ${active ? "border-[#d6b46a] bg-[#d6b46a]/10" : "border-transparent hover:bg-black/5"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl(item.key)} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#111]">{item.name}</span>
                      <span className="block text-xs text-neutral-500">
                        {item.balesAvailable} fardos · {item.photoCount} fotos{item.isFeatured ? " · destaque" : ""}
                      </span>
                    </span>
                    {active ? <Check size={16} className="shrink-0 text-[#9b7a3e]" /> : null}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="grid content-start gap-6">
            {tab === "arte" ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
                <div className={card}>
                  {artError ? <p className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">{artError}</p> : null}
                  <div className="mx-auto w-full max-w-[26rem]">
                    <canvas ref={previewRef} className="h-auto w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]" />
                  </div>
                  <div className="mx-auto mt-5 grid max-w-[26rem] gap-3">
                    <button type="button" onClick={downloadArt} disabled={!main || (mode !== "real" && !aiImage)} className={primary}>
                      <Download size={16} /> Baixar arte (PNG)
                    </button>
                    {saveControls("arte", !main || (mode !== "real" && !aiImage))}
                  </div>
                </div>

                <div className={`${card} grid content-start gap-5`}>
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Modo</h3>
                    <div className="grid gap-2">
                      {(Object.keys(modeLabels) as ArtMode[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          disabled={value !== "real" && imageAiReady === false}
                          onClick={() => {
                            setMode(value);
                            if (value !== "real") setSelected((current) => current.slice(0, 1));
                          }}
                          className={`rounded-2xl border p-3 text-left transition ${mode === value ? "border-[#d6b46a] bg-[#d6b46a]/10" : "border-black/10 bg-white hover:border-[#d6b46a]/60"}`}
                        >
                          <span className="block text-sm font-bold text-[#111]">{modeLabels[value].title}</span>
                          <span className="block text-xs leading-5 text-neutral-500">
                            {value !== "real" && imageAiReady === false ? "Desativado: falta ativar a Cloudflare (chave CLOUDFLARE_API_TOKEN na Vercel)." : modeLabels[value].hint}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {mode !== "real" ? (
                    <div className="grid gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{mode === "cenario" ? "Ambiente (prompt)" : "Imagem (prompt)"}</h3>
                      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24 rounded-2xl border border-black/10 bg-white p-3 text-xs leading-5 outline-none focus:border-[#d6b46a]" />
                      <button type="button" onClick={generateAiImage} disabled={aiBusy || !main} className={primary}>
                        {aiBusy ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        {aiBusy ? "Gerando..." : aiImage ? "Gerar outra" : "Gerar com IA"}
                      </button>
                      {aiError ? <p className="text-xs leading-5 text-red-600">{aiError}</p> : null}
                      {mode === "ia" ? <p className="text-xs leading-5 text-amber-700">Imagem ilustrativa: o produto pode não ser idêntico ao real.</p> : null}
                    </div>
                  ) : null}

                  {main && mode !== "ia" && main.photoCount > 1 && selectedItems.length === 1 ? (
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Foto</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: main.photoCount }, (_, index) => index + 1).map((index) => (
                          <button key={index} type="button" onClick={() => setPhotoIndex((current) => ({ ...current, [main.key]: index }))} className={`overflow-hidden rounded-xl border-2 ${(photoIndex[main.key] ?? 1) === index ? "border-[#d6b46a]" : "border-transparent"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photoUrl(main.key, index)} alt={`Foto ${index}`} loading="lazy" className="h-12 w-12 object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Textos</h3>
                    <select value={badge} onChange={(event) => setBadge(event.target.value as BadgeOption)} className={input}>
                      <option value="auto">Selo automático</option>
                      {["Destaque", "Novidade", "Últimas unidades", "Coleção", "Pronta entrega"].map((value) => (
                        <option key={value} value={value}>
                          Selo: {value}
                        </option>
                      ))}
                      <option value="none">Sem selo</option>
                    </select>
                    <input value={cta} onChange={(event) => setCta(event.target.value)} className={input} placeholder="Chamada (botão)" maxLength={28} />
                    <input value={ctaHint} onChange={(event) => setCtaHint(event.target.value)} className={input} placeholder="Texto ao lado do botão" maxLength={24} />
                    <label className="flex items-center gap-2 text-sm text-neutral-600">
                      <input type="checkbox" checked={showPrice} onChange={(event) => setShowPrice(event.target.checked)} /> Mostrar preço sugerido
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "video" ? (
              <div className={`${card} grid gap-5 xl:grid-cols-[1fr_20rem]`}>
                <div className="mx-auto w-full max-w-[22rem]">
                  {videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop playsInline className="w-full rounded-2xl bg-black shadow-[0_20px_60px_rgba(0,0,0,0.25)]" />
                  ) : null}
                  <canvas ref={videoCanvasRef} className={`${videoUrl ? "hidden" : "block"} h-auto w-full rounded-2xl bg-[#07100d] shadow-[0_20px_60px_rgba(0,0,0,0.25)]`} />
                </div>
                <div className="grid content-start gap-4">
                  <p className="text-sm leading-6 text-neutral-600">
                    Junta as fotos reais dos produtos selecionados com movimento suave, nome, fardos e preço, abertura e chamada final.
                  </p>
                  <label className="grid gap-1 text-sm font-semibold text-neutral-700">
                    Segundos por foto: {secondsPerSlide.toFixed(1)}s
                    <input type="range" min={1.5} max={4} step={0.5} value={secondsPerSlide} onChange={(event) => setSecondsPerSlide(Number(event.target.value))} />
                  </label>
                  <input value={cta} onChange={(event) => setCta(event.target.value)} className={input} placeholder="Chamada final" maxLength={28} />
                  <button type="button" onClick={generateVideo} disabled={videoProgress !== null || selectedItems.length === 0} className={primary}>
                    {videoProgress !== null ? <Loader2 size={16} className="animate-spin" /> : <Clapperboard size={16} />}
                    {videoProgress !== null ? `Gravando ${Math.round(videoProgress * 100)}%` : "Gerar vídeo"}
                  </button>
                  {videoProgress !== null ? <p className="text-xs text-amber-700">Mantenha esta aba aberta e visível enquanto o vídeo é gravado.</p> : null}
                  {videoError ? <p className="text-xs text-red-600">{videoError}</p> : null}
                  {videoUrl ? (
                    <a href={videoUrl} download={`topmax-video-${format}.${videoExt}`} className={primary}>
                      <Download size={16} /> Baixar vídeo ({videoExt.toUpperCase()})
                    </a>
                  ) : null}
                  {videoUrl ? saveControls("video", false) : null}
                  {videoUrl && videoExt === "webm" ? (
                    <p className="text-xs leading-5 text-neutral-500">Seu navegador gerou WebM. Para o Instagram, use o Chrome atualizado (gera MP4).</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {tab === "legenda" ? (
              <div className={`${card} grid gap-4`}>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(goalLabels) as Goal[]).map((value) => (
                    <button key={value} type="button" onClick={() => setGoal(value)} className={chip(goal === value)}>
                      {goalLabels[value]}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-neutral-600">
                  {selectedItems.length ? `Para: ${selectedItems.map((item) => item.name).join(", ")}` : "Selecione um ou mais produtos."}
                </p>
                <button type="button" onClick={generateCaption} disabled={captionBusy || (selectedItems.length === 0 && !activeIdea)} className={`${primary} w-fit`}>
                  {captionBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {captionBusy ? "Escrevendo..." : caption ? "Escrever outra" : "Escrever legenda"}
                </button>
                {captionError ? <p className="text-sm text-red-600">{captionError}</p> : null}
                {caption ? (
                  <>
                    <textarea value={caption} onChange={(event) => setCaption(event.target.value)} className="min-h-72 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 outline-none focus:border-[#d6b46a]" />
                    <button type="button" onClick={copyCaption} className={`${primary} w-fit`}>
                      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copiada" : "Copiar legenda"}
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
