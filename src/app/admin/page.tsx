"use client";

import {
  Building2,
  Contact,
  FolderTree,
  Gauge,
  Globe2,
  ImageIcon,
  LogOut,
  Package,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const sidebarItems = [
  { title: "Dashboard", icon: Gauge, href: "/admin" },
  { title: "Produtos", icon: Package, href: "/admin/produtos" },
  { title: "Categorias", icon: FolderTree, href: "#" },
  { title: "Galeria", icon: ImageIcon, href: "#" },
  { title: "Catálogos", icon: Tags, href: "#" },
  { title: "Mercados", icon: Globe2, href: "#" },
  { title: "Empresa", icon: Building2, href: "#" },
  { title: "Contato", icon: Contact, href: "#" },
  { title: "Configurações", icon: Settings, href: "#" },
  { title: "Usuários", icon: Users, href: "#" },
];

const dashboardCards = [
  { title: "Produtos", text: "Gerencie produtos e informações comerciais.", icon: Package },
  { title: "Galeria", text: "Organize imagens usadas no site e catálogo.", icon: ImageIcon },
  { title: "Catálogos", text: "Prepare materiais e arquivos comerciais.", icon: Tags },
  { title: "Configurações", text: "Ajuste dados gerais do painel administrativo.", icon: Settings },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
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
          </nav>
        </aside>

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <header className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
                TopMax Export
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
                Painel Administrativo
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                Dashboard inicial conectado ao Supabase Auth e pronto para a próxima etapa do CMS.
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

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardCards.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="rounded-[1.5rem] border border-white/75 bg-white/80 p-6 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a] shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#141414]">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
