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
  Package,
  Plus,
  Settings,
  Tags,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Catalog } from "@/types/catalog";
import type { Lead } from "@/types/lead";
import type { MediaItem } from "@/types/media";
import type { Product } from "@/types/product";

const sidebarItems = [
  { title: "Dashboard", icon: Gauge, href: "/admin" },
  { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { title: "Produtos", icon: Package, href: "/admin/produtos" },
  { title: "Categorias", icon: FolderTree, href: "#" },
  { title: "Galeria", icon: ImageIcon, href: "#" },
  { title: "Catálogos", icon: Tags, href: "/admin/catalogos" },
  { title: "Mercados", icon: Globe2, href: "#" },
  { title: "Empresa", icon: Building2, href: "#" },
  { title: "Contato", icon: Contact, href: "#" },
  { title: "Configurações", icon: Settings, href: "/admin/configuracoes" },
  { title: "Usuários", icon: Users, href: "#" },
];

const contentItems = [
  { title: "Site", icon: FileText, href: "/admin/conteudo/site" },
  { title: "Empresa", icon: Building2, href: "/admin/conteudo/empresa" },
  { title: "Mercados", icon: Globe2, href: "/admin/conteudo/mercados" },
  { title: "Processo", icon: FileText, href: "/admin/conteudo/processo" },
  { title: "Contato", icon: Contact, href: "/admin/conteudo/contato" },
  { title: "Rodapé", icon: Settings, href: "/admin/conteudo/rodape" },
];

const libraryItems = [
  { title: "Imagens", icon: ImageIcon, href: "/admin/biblioteca?tipo=images" },
  { title: "Vídeos", icon: FileText, href: "/admin/biblioteca?tipo=videos" },
  { title: "PDFs", icon: Tags, href: "/admin/biblioteca?tipo=pdfs" },
  { title: "Logos", icon: Building2, href: "/admin/biblioteca?tipo=logos" },
];

const crmItems = [{ title: "Leads", icon: Inbox, href: "/admin/crm/leads" }];

function countBy<T>(items: T[], getter: (item: T) => string | null | undefined) {
  return Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const key = getter(item)?.trim() || "Sem categoria";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function maxValue(items: Array<{ value: number }>) {
  return Math.max(1, ...items.map((item) => item.value));
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "-";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const [productsResult, leadsResult, catalogsResult, mediaResult] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("catalogs").select("*").order("updated_at", { ascending: false }),
        supabase.from("media_library").select("*").order("created_at", { ascending: false }),
      ]);

      setProducts((productsResult.data ?? []) as Product[]);
      setLeads((leadsResult.data ?? []) as Lead[]);
      setCatalogs((catalogsResult.data ?? []) as Catalog[]);
      setMedia((mediaResult.data ?? []) as MediaItem[]);
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const categories = useMemo(
    () => new Set(products.map((product) => product.category).filter(Boolean)).size,
    [products],
  );

  const kpis = [
    { title: "Produtos", value: products.length, icon: Package },
    { title: "Categorias", value: categories, icon: FolderTree },
    { title: "Leads", value: leads.length, icon: Inbox },
    { title: "Catálogos", value: catalogs.length, icon: Tags },
    { title: "Arquivos", value: media.length, icon: ImageIcon },
    { title: "Usuários", value: 1, icon: Users },
  ];

  const summaryCards = [
    { title: "Produtos publicados", value: products.filter((item) => item.status === "published").length },
    { title: "Produtos em rascunho", value: products.filter((item) => item.status === "draft").length },
    { title: "Novos Leads", value: leads.filter((item) => item.status === "Novo").length },
    { title: "Clientes", value: leads.filter((item) => item.status === "Cliente").length },
    { title: "Arquivos enviados", value: media.length },
  ];

  const productsByCategory = countBy(products, (product) => product.category);
  const leadsByStatus = countBy(leads, (lead) => lead.status);
  const leadsByCountry = countBy(leads, (lead) => lead.country);
  const catalogDownloads = catalogs.slice(0, 5).map((catalog) => ({
    label: catalog.title,
    value: catalog.pdf_url ? 1 : 0,
  }));

  const recentActivity = [
    ...products.slice(0, 4).map((product) => ({
      title: product.status === "draft" ? "Produto editado" : "Produto criado",
      text: product.name,
      date: product.updated_at || product.created_at,
    })),
    ...leads.slice(0, 4).map((lead) => ({
      title: "Novo Lead",
      text: lead.name,
      date: lead.created_at,
    })),
    ...catalogs.slice(0, 4).map((catalog) => ({
      title: "Catálogo atualizado",
      text: catalog.title,
      date: catalog.updated_at || catalog.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 8);

  const shortcuts = [
    { title: "Novo Produto", href: "/admin/produtos/novo", icon: Plus },
    { title: "Novo Catálogo", href: "/admin/catalogos/novo", icon: FileText },
    { title: "Novo Lead", href: "/admin/crm/leads", icon: Inbox },
    { title: "Nova Imagem", href: "/admin/biblioteca?tipo=images", icon: Upload },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  function renderBars(items: Array<{ label: string; value: number }>, emptyLabel: string) {
    const max = maxValue(items);

    if (items.length === 0) {
      return <p className="text-sm leading-6 text-neutral-500">{emptyLabel}</p>;
    }

    return (
      <div className="grid gap-4">
        {items.slice(0, 6).map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="line-clamp-1 font-semibold text-[#141414]">{item.label}</span>
              <span className="text-neutral-500">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-[#d6b46a]"
                style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
            {sidebarItems.map(({ title, icon: Icon, href }, index) => (
              <Link
                key={title}
                href={href}
                className={
                  index === 0
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
                Conteúdo
              </p>
            </div>

            {contentItems.map(({ title, icon: Icon, href }) => (
              <Link
                key={title}
                href={href}
                className="inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition duration-300 hover:bg-white/[0.08] hover:text-white"
              >
                <Icon size={17} strokeWidth={1.9} />
                {title}
              </Link>
            ))}

            <div className="hidden pt-4 lg:block">
              <p className="px-4 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#d6b46a]">
                Biblioteca
              </p>
            </div>

            {libraryItems.map(({ title, icon: Icon, href }) => (
              <Link
                key={title}
                href={href}
                className="inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition duration-300 hover:bg-white/[0.08] hover:text-white"
              >
                <Icon size={17} strokeWidth={1.9} />
                {title}
              </Link>
            ))}

            <div className="hidden pt-4 lg:block">
              <p className="px-4 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[#d6b46a]">
                CRM
              </p>
            </div>

            {crmItems.map(({ title, icon: Icon, href }) => (
              <Link
                key={title}
                href={href}
                className="inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-white/62 transition duration-300 hover:bg-white/[0.08] hover:text-white"
              >
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
                Dashboard Executivo
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                Visão geral do CMS, funil comercial, catálogo e biblioteca de mídia.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] lg:inline-flex"
            >
              <LogOut size={17} />
              Sair
            </button>
          </header>

          {isLoading ? (
            <div className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-8 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_22px_70px_rgba(31,41,55,0.09)]">
              Carregando indicadores
            </div>
          ) : (
            <>
              <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {kpis.map(({ title, value, icon: Icon }) => (
                  <article
                    key={title}
                    className="rounded-[1.35rem] border border-white/75 bg-white/80 p-5 shadow-[0_18px_55px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a]">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <strong className="text-3xl font-semibold tracking-[-0.04em] text-[#111]">{value}</strong>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
                  </article>
                ))}
              </section>

              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {summaryCards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-[1.25rem] border border-white/75 bg-white/70 p-5 shadow-[0_14px_45px_rgba(31,41,55,0.07)] backdrop-blur-xl"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9b7a3e]">{card.title}</p>
                    <strong className="mt-3 block text-3xl font-semibold tracking-[-0.04em] text-[#111]">{card.value}</strong>
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-5 xl:grid-cols-2">
                {[
                  { title: "Produtos por categoria", items: productsByCategory, empty: "Nenhum produto cadastrado." },
                  { title: "Leads por status", items: leadsByStatus, empty: "Nenhum lead cadastrado." },
                  { title: "Leads por país", items: leadsByCountry, empty: "Nenhum país informado." },
                  { title: "Downloads de catálogo", items: catalogDownloads, empty: "Nenhum catálogo cadastrado." },
                ].map((chart) => (
                  <article
                    key={chart.title}
                    className="rounded-[1.5rem] border border-white/75 bg-white/80 p-6 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a]">
                        <BarChart3 size={19} />
                      </div>
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">{chart.title}</h2>
                    </div>
                    {renderBars(chart.items, chart.empty)}
                  </article>
                ))}
              </section>

              <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_24rem]">
                <article className="rounded-[1.5rem] border border-white/75 bg-white/80 p-6 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#111]">Atividade recente</h2>
                  <div className="mt-5 divide-y divide-black/10">
                    {recentActivity.length === 0 ? (
                      <p className="py-6 text-sm text-neutral-500">Nenhuma atividade encontrada.</p>
                    ) : (
                      recentActivity.map((activity) => (
                        <div key={`${activity.title}-${activity.text}-${activity.date}`} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#9b7a3e]">{activity.title}</p>
                            <p className="mt-1 text-base font-semibold text-[#111]">{activity.text}</p>
                          </div>
                          <span className="text-sm text-neutral-500">{formatDate(activity.date)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                <article className="rounded-[1.5rem] border border-white/75 bg-[#111] p-6 text-white shadow-[0_22px_70px_rgba(31,41,55,0.16)]">
                  <h2 className="text-xl font-semibold tracking-[-0.03em]">Atalhos</h2>
                  <div className="mt-5 grid gap-3">
                    {shortcuts.map(({ title, href, icon: Icon }) => (
                      <Link
                        key={title}
                        href={href}
                        className="inline-flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/78 transition hover:bg-[#d6b46a] hover:text-[#111]"
                      >
                        {title}
                        <Icon size={17} />
                      </Link>
                    ))}
                  </div>
                </article>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
