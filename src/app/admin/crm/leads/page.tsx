"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, UserCheck, UserPlus, Users, XCircle } from "lucide-react";
import { getLeadMetric, getLeadStatusClasses, leadStatuses } from "@/lib/leads";
import { supabase } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/types/lead";

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [country, setCountry] = useState("");
  const [product, setProduct] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError("");

    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (country.trim()) {
      query = query.ilike("country", `%${country.trim()}%`);
    }

    if (product.trim()) {
      query = query.ilike("product_interest", `%${product.trim()}%`);
    }

    if (search.trim()) {
      const term = search.trim();
      query = query.or(
        `name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,product_interest.ilike.%${term}%`,
      );
    }

    const { data, error: loadError } = await query;

    if (loadError) {
      setError("Não foi possível carregar os leads.");
      setLeads([]);
    } else {
      setLeads((data ?? []) as Lead[]);
    }

    setIsLoading(false);
  }, [country, product, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadLeads();
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [loadLeads]);

  const metrics = useMemo(
    () => [
      { title: "Novos Leads", value: getLeadMetric(leads, "Novo"), icon: UserPlus },
      { title: "Em negociação", value: getLeadMetric(leads, "Negociacao"), icon: Users },
      { title: "Clientes", value: getLeadMetric(leads, "Cliente"), icon: UserCheck },
      { title: "Perdidos", value: getLeadMetric(leads, "Perdido"), icon: XCircle },
    ],
    [leads],
  );

  function openLead(lead: Lead) {
    setSelectedLead(lead);
    setAssignedTo(lead.assigned_to ?? "");
    setNoteDraft("");
  }

  function updateLeadInState(updatedLead: Lead) {
    setLeads((current) => current.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)));
    setSelectedLead(updatedLead);
  }

  async function updateSelectedLead(payload: Partial<Lead>) {
    if (!selectedLead) return;

    const { data, error: updateError } = await supabase
      .from("leads")
      .update(payload)
      .eq("id", selectedLead.id)
      .select("*")
      .single<Lead>();

    if (updateError || !data) {
      setError("Não foi possível atualizar o lead.");
      return;
    }

    updateLeadInState(data);
  }

  async function addNote() {
    if (!selectedLead || !noteDraft.trim()) return;

    const stamp = new Date().toLocaleString("pt-BR");
    const nextNotes = [selectedLead.notes, `[${stamp}] ${noteDraft.trim()}`].filter(Boolean).join("\n\n");
    setNoteDraft("");
    await updateSelectedLead({ notes: nextNotes });
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-black/10 pb-8">
          <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
            CRM
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
            Leads
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Acompanhe contatos recebidos pelo site, funil comercial, responsáveis e histórico.
          </p>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ title, value, icon: Icon }) => (
            <article key={title} className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a]">
                <Icon size={21} strokeWidth={1.8} />
              </div>
              <strong className="text-3xl font-semibold tracking-[-0.04em] text-[#111]">{value}</strong>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-white/75 bg-white/80 p-4 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_13rem_11rem_12rem_auto]">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4">
              <Search size={18} className="text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Pesquisar por nome, empresa, email, telefone ou produto"
              />
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | LeadStatus)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
            >
              <option value="all">Todos os status</option>
              {leadStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
              placeholder="País"
            />

            <input
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
              placeholder="Produto"
            />

            <button
              type="button"
              onClick={loadLeads}
              className="h-12 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111]"
            >
              Buscar
            </button>
          </div>
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/75 bg-white/80 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
          <div className="hidden grid-cols-[1fr_10rem_10rem_9rem_8rem] gap-4 border-b border-black/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 lg:grid">
            <span>Lead</span>
            <span>Status</span>
            <span>País</span>
            <span>Produto</span>
            <span>Data</span>
          </div>

          {isLoading ? (
            <div className="px-5 py-10 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Carregando leads
            </div>
          ) : leads.length === 0 ? (
            <div className="px-5 py-10 text-sm leading-6 text-neutral-600">Nenhum lead encontrado.</div>
          ) : (
            <div className="divide-y divide-black/10">
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => openLead(lead)}
                  className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-white/70 lg:grid-cols-[1fr_10rem_10rem_9rem_8rem] lg:items-center"
                >
                  <span>
                    <strong className="block text-lg font-semibold tracking-[-0.03em] text-[#141414]">{lead.name}</strong>
                    <span className="mt-1 block text-sm text-neutral-500">{lead.company || "Sem empresa"}</span>
                    <span className="mt-2 block text-sm text-neutral-600">{[lead.email, lead.phone].filter(Boolean).join(" | ")}</span>
                  </span>

                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${getLeadStatusClasses(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="text-sm font-semibold text-neutral-600">{lead.country || "-"}</span>
                  <span className="text-sm text-neutral-600">{lead.product_interest || "-"}</span>
                  <span className="text-sm text-neutral-500">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : "-"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedLead ? (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-[#fbfaf7] p-5 text-[#161616] shadow-[-30px_0_90px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9b7a3e]">Lead</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#111]">{selectedLead.name}</h2>
              <p className="mt-2 text-sm text-neutral-500">{selectedLead.company || "Sem empresa"}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <div className="grid flex-1 gap-5 overflow-y-auto py-5">
            <div className="grid gap-3 rounded-[1.25rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_50px_rgba(31,41,55,0.08)]">
              {[
                ["Telefone", selectedLead.phone],
                ["Email", selectedLead.email],
                ["Produto", selectedLead.product_interest],
                ["País", selectedLead.country],
                ["Cidade", selectedLead.city],
                ["Origem", selectedLead.source],
              ].map(([label, value]) => (
                <p key={label} className="text-sm leading-6 text-neutral-600">
                  <strong className="text-[#111]">{label}:</strong> {value || "-"}
                </p>
              ))}
              <p className="text-sm leading-6 text-neutral-600">
                <strong className="text-[#111]">Mensagem:</strong> {selectedLead.message || "-"}
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.25rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_50px_rgba(31,41,55,0.08)]">
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Status
                <select
                  value={selectedLead.status}
                  onChange={(event) => updateSelectedLead({ status: event.target.value as LeadStatus })}
                  className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
                >
                  {leadStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Responsável
                <input
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  onBlur={() => updateSelectedLead({ assigned_to: toNullable(assignedTo) })}
                  className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 rounded-[1.25rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_50px_rgba(31,41,55,0.08)]">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#111]">Observações</h3>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                className="min-h-28 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none"
                placeholder="Adicionar observação"
              />
              <button
                type="button"
                onClick={addNote}
                className="h-11 rounded-full bg-[#111] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111]"
              >
                Adicionar observação
              </button>
              <pre className="max-h-56 whitespace-pre-wrap rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-600">
                {selectedLead.notes || "Sem observações."}
              </pre>
            </div>

            <div className="rounded-[1.25rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_50px_rgba(31,41,55,0.08)]">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#111]">Histórico</h3>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-neutral-600">
                <p>Criado em {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString("pt-BR") : "-"}</p>
                <p>Atualizado em {selectedLead.updated_at ? new Date(selectedLead.updated_at).toLocaleString("pt-BR") : "-"}</p>
                <p>Status atual: {selectedLead.status}</p>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
