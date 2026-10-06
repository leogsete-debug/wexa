"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Boxes, Check, CheckCircle2, ClipboardCopy, Download, FileUp, Loader2, PackageCheck, Ship, Trash2 } from "lucide-react";
import { toDateKey } from "@/lib/content-calendar";
import { checkPackingList, toChegadasRows, type PackingCheck, type PackingList } from "@/lib/packing-list";
import { supabase } from "@/lib/supabase";

type Tab = "conferencia" | "conteineres" | "estoque";

type CatalogItem = { key: string; name: string; piecesPerBale: number; balesAvailable: number; piecesAvailable: number; isFeatured: boolean };

type Receipt = {
  id: string;
  invoice: string;
  container: string | null;
  supplier: string | null;
  shipping_date: string | null;
  arrival_forecast: string | null;
  status: "em_transito" | "recebido" | "com_divergencia";
  items: Array<{ descricao: string; produto: string; volumes: number | null; qtd_por_volume: number | null; qtd_total: number | null }>;
  totals: Record<string, number | null>;
  validation: { issues?: string[] };
  file_url: string | null;
  file_path: string | null;
  received_at: string | null;
  created_at: string;
};

const BUCKET = "media-library";
const card = "rounded-[1.5rem] border border-white/75 bg-white/85 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09)]";
const input = "h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#d6b46a]";
const primary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-50";
const secondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#111] hover:border-[#d6b46a] disabled:opacity-50";

const statusLabel: Record<Receipt["status"], string> = {
  em_transito: "A caminho",
  recebido: "Recebido",
  com_divergencia: "Com divergência",
};

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function rowsToTsv(rows: string[][]) {
  return rows.map((row) => row.map((cell) => String(cell).replace(/[\t\n]/g, " ")).join("\t")).join("\n");
}

function downloadCsv(rows: string[][], name: string) {
  const header = ["INVOICE", "CONTAINER", "PRODUTO", "FARDOS", "PCS_FARDO", "PREVISAO"];
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}

export default function WarehousePage() {
  const [tab, setTab] = useState<Tab>("conferencia");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [stockDate, setStockDate] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [list, setList] = useState<PackingList | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [forecast, setForecast] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    const { data, error: loadError } = await supabase.from("stock_receipts").select("*").order("created_at", { ascending: false }).limit(200);
    setTableMissing(Boolean(loadError));
    setReceipts((data ?? []) as Receipt[]);
  }, []);

  useEffect(() => {
    fetch("/api/catalogo/produtos", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { stockDate?: string; items?: CatalogItem[] }) => {
        setCatalog(data.items ?? []);
        setStockDate(data.stockDate ?? null);
      })
      .catch(() => undefined);
    const timeout = window.setTimeout(loadReceipts, 0);
    return () => window.clearTimeout(timeout);
  }, [loadReceipts]);

  // A conferência é refeita a cada edição (nada passa sem as contas fecharem)
  const check: PackingCheck | null = useMemo(() => (list ? checkPackingList(list) : null), [list]);
  const productNames = useMemo(() => catalog.map((item) => item.name).sort(), [catalog]);
  const unmatched = list ? list.itens.filter((_, index) => !names[index]).length : 0;
  const rows = list ? toChegadasRows(list, names, forecast) : [];

  const analyze = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setList(null);
    setSaveMessage("");
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Entre de novo no painel.");
      const response = await fetch("/api/armazem/packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pdf: await fileToBase64(file) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.list) throw new Error(data.error || "Não foi possível ler o packing list.");
      const extracted = data.list as PackingList;
      setList(extracted);
      setNames(extracted.itens.map((item) => item.produto_sugerido ?? ""));
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "Falha ao ler o documento.");
    } finally {
      setBusy(false);
    }
  };

  const updateHeader = (field: "invoice" | "conteiner", value: string) => setList((current) => (current ? { ...current, [field]: value } : current));
  const updateItem = (index: number, field: "qtd_por_volume" | "volumes" | "qtd_total", value: string) =>
    setList((current) => {
      if (!current) return current;
      const itens = current.itens.map((item, position) => (position === index ? { ...item, [field]: value === "" ? null : Number(value.replace(",", ".")) } : item));
      return { ...current, itens };
    });

  const copyRows = async (data: string[][], id: string) => {
    await navigator.clipboard.writeText(rowsToTsv(data));
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const register = async () => {
    if (!list || !check) return;
    setSaveMessage("");
    if (!check.ok && !window.confirm("A conferência encontrou divergências. Registrar mesmo assim como \"Com divergência\"?")) return;
    setBusy(true);
    try {
      let fileUrl: string | null = null;
      let filePath: string | null = null;
      if (file) {
        filePath = `armazem/${toDateKey(new Date()).slice(0, 7)}/${Date.now()}-${(list.invoice ?? "pl").replace(/[^A-Za-z0-9-]/g, "")}.pdf`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, { contentType: "application/pdf" });
        if (uploadError) throw new Error(`Falha ao guardar o PDF: ${uploadError.message}`);
        fileUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
      }
      const { error: insertError } = await supabase.from("stock_receipts").insert({
        invoice: (list.invoice ?? "").toUpperCase(),
        order_no: list.pedido ?? null,
        container: list.conteiner,
        supplier: list.fornecedor ?? null,
        origin: list.origem ?? null,
        destination: list.destino ?? null,
        document_date: /^\d{4}-\d{2}-\d{2}$/.test(list.data_documento ?? "") ? list.data_documento : null,
        shipping_date: /^\d{4}-\d{2}-\d{2}$/.test(list.data_embarque ?? "") ? list.data_embarque : null,
        arrival_forecast: forecast || null,
        status: check.ok ? "em_transito" : "com_divergencia",
        items: list.itens.map((item, index) => ({
          descricao: item.descricao,
          produto: names[index] || "",
          volumes: item.volumes,
          qtd_por_volume: item.qtd_por_volume,
          qtd_total: item.qtd_total,
          peso_bruto_kg: item.peso_bruto_kg ?? null,
          peso_liquido_kg: item.peso_liquido_kg ?? null,
          volume_m3: item.volume_m3 ?? null,
        })),
        totals: list.totais_documento ?? {},
        validation: { issues: check.issues, sums: check.sums },
        file_url: fileUrl,
        file_path: filePath,
      });
      if (insertError) {
        if (filePath) await supabase.storage.from(BUCKET).remove([filePath]);
        throw new Error(/duplicate|unique/i.test(insertError.message) ? "Este contêiner (invoice + contêiner) já foi registrado." : insertError.message);
      }
      setSaveMessage("Contêiner registrado. Agora copie as linhas para a aba CHEGADAS do Cadastrar Pedido.");
      await loadReceipts();
    } catch (registerError) {
      setSaveMessage(registerError instanceof Error ? registerError.message : "Falha ao registrar.");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (receipt: Receipt, status: Receipt["status"]) => {
    const { error: updateError } = await supabase.from("stock_receipts").update({ status }).eq("id", receipt.id);
    if (!updateError) await loadReceipts();
  };

  const removeReceipt = async (receipt: Receipt) => {
    if (!window.confirm(`Excluir o registro do contêiner ${receipt.container ?? receipt.invoice}?`)) return;
    const { error: deleteError } = await supabase.from("stock_receipts").delete().eq("id", receipt.id);
    if (deleteError) return;
    if (receipt.file_path) await supabase.storage.from(BUCKET).remove([receipt.file_path]);
    await loadReceipts();
  };

  const receiptRows = (receipt: Receipt) =>
    receipt.items.map((item) => [
      receipt.invoice,
      receipt.container ?? "",
      item.produto || item.descricao,
      String(item.volumes ?? ""),
      String(item.qtd_por_volume ?? ""),
      receipt.arrival_forecast ?? "",
    ]);

  // Estoque do galpão (catálogo) + o que está a caminho (contêineres registrados)
  const inTransit = useMemo(() => {
    const map: Record<string, number> = {};
    (receipts ?? [])
      .filter((receipt) => receipt.status !== "recebido")
      .forEach((receipt) => receipt.items.forEach((item) => {
        if (item.produto) map[item.produto] = (map[item.produto] ?? 0) + (item.volumes ?? 0);
      }));
    return map;
  }, [receipts]);

  const chip = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition ${active ? "bg-[#111] text-white" : "border border-black/10 bg-white text-neutral-600"}`;

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-black/10 pb-6">
          <Link href="/admin/central" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-[#111]">
            <ArrowLeft size={14} /> Central
          </Link>
          <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e]">Agente de Armazém</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">Armazém</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Conferência de packing lists com IA, contêineres a caminho e estoque. O agente lê e confere; as linhas vão para a aba CHEGADAS do seu Cadastrar Pedido.
          </p>
        </header>

        {tableMissing ? (
          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
            As tabelas do Armazém ainda não foram criadas no banco. A conferência funciona, mas registrar contêineres só depois disso.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("conferencia")} className={chip(tab === "conferencia")}>
            <FileUp size={15} /> Conferir packing list
          </button>
          <button type="button" onClick={() => setTab("conteineres")} className={chip(tab === "conteineres")}>
            <Ship size={15} /> Contêineres ({receipts?.length ?? 0})
          </button>
          <button type="button" onClick={() => setTab("estoque")} className={chip(tab === "estoque")}>
            <Boxes size={15} /> Estoque
          </button>
        </div>

        {tab === "conferencia" ? (
          <section className="mt-6 grid gap-6">
            <div className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center`}>
              <input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="text-sm" />
              <button type="button" onClick={analyze} disabled={!file || busy} className={primary}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} {busy ? "Lendo e conferindo..." : "Conferir"}
              </button>
              <p className="text-xs text-neutral-500">Use o PDF original do fornecedor (não traduções). Leva de 10 a 40 segundos.</p>
            </div>
            {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

            {list && check ? (
              <>
                <div className={`${card} ${check.ok ? "border-emerald-500/30" : "border-amber-500/40"}`}>
                  {check.ok ? (
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 size={18} /> Tudo confere: cada linha e a soma das linhas batem com os totais do documento.
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      <p className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                        <AlertTriangle size={18} /> Divergências encontradas: confira no PDF antes de registrar.
                      </p>
                      {check.issues.map((issue) => (
                        <p key={issue} className="text-sm text-neutral-700">• {issue}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`${card} grid gap-4`}>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <label className="grid gap-1 text-xs font-semibold text-neutral-600">
                      Invoice
                      <input value={list.invoice ?? ""} onChange={(event) => updateHeader("invoice", event.target.value)} className={input} />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-neutral-600">
                      Contêiner
                      <input value={list.conteiner ?? ""} onChange={(event) => updateHeader("conteiner", event.target.value)} className={input} />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-neutral-600">
                      Embarque
                      <input value={list.data_embarque ?? ""} readOnly className={input} />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-neutral-600">
                      Previsão de chegada *
                      <input type="date" value={forecast} onChange={(event) => setForecast(event.target.value)} className={input} />
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {list.fornecedor ?? ""} · {list.origem ?? "?"} → {list.destino ?? "?"} · pedido {list.pedido ?? "-"}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[56rem] text-sm">
                      <thead>
                        <tr className="border-b border-black/10 text-left text-xs uppercase tracking-[0.1em] text-neutral-500">
                          <th className="py-2 pr-2">#</th>
                          <th className="py-2 pr-2">Linha do documento</th>
                          <th className="py-2 pr-2">Pç/volume</th>
                          <th className="py-2 pr-2">Volumes</th>
                          <th className="py-2 pr-2">Total</th>
                          <th className="py-2 pr-2">Produto no estoque</th>
                          <th className="py-2">Conferência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.itens.map((item, index) => (
                          <tr key={index} className="border-b border-black/5 align-top">
                            <td className="py-2 pr-2 text-neutral-500">{index + 1}</td>
                            <td className="py-2 pr-2 text-xs leading-5 text-neutral-700">{item.descricao}</td>
                            {(["qtd_por_volume", "volumes", "qtd_total"] as const).map((field) => (
                              <td key={field} className="py-2 pr-2">
                                <input value={item[field] ?? ""} onChange={(event) => updateItem(index, field, event.target.value)} className={`${input} w-24`} inputMode="decimal" />
                              </td>
                            ))}
                            <td className="py-2 pr-2">
                              <select value={names[index] ?? ""} onChange={(event) => setNames((current) => current.map((name, position) => (position === index ? event.target.value : name)))} className={`${input} min-w-56`}>
                                <option value="">— escolher —</option>
                                {productNames.map((name) => (
                                  <option key={name} value={name}>{name}</option>
                                ))}
                              </select>
                              {item.produto_sugerido && names[index] === item.produto_sugerido ? <p className="mt-1 text-[0.65rem] text-[#9b7a3e]">sugerido pela regra (mesmas peças por fardo)</p> : null}
                            </td>
                            <td className="py-2 text-xs">
                              {check.lineIssues[index] ? <span className="text-red-600">{check.lineIssues[index]}</span> : <span className="text-emerald-700"><Check size={14} className="inline" /> ok</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="text-xs text-neutral-600">
                          <td />
                          <td className="py-2 font-semibold">Soma das linhas / total do documento</td>
                          <td />
                          <td className="py-2">{check.sums.volumes} / {list.totais_documento?.volumes ?? "?"}</td>
                          <td className="py-2">{check.sums.qtd} / {list.totais_documento?.qtd_total ?? "?"}</td>
                          <td className="py-2" colSpan={2}>
                            Peso líq. {Math.round(check.sums.pesoLiquido * 10) / 10} / {list.totais_documento?.peso_liquido_kg ?? "?"} kg · Cubagem {Math.round(check.sums.volumeM3 * 1000) / 1000} / {list.totais_documento?.volume_m3 ?? "?"} m³
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {unmatched ? <p className="text-xs text-amber-700">{unmatched} linha(s) sem produto do estoque escolhido: escolha antes de copiar para CHEGADAS.</p> : null}
                  {!forecast ? <p className="text-xs text-amber-700">Informe a previsão de chegada (obrigatória na aba CHEGADAS).</p> : null}

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={register} disabled={busy || tableMissing} className={primary}>
                      <PackageCheck size={16} /> Registrar contêiner
                    </button>
                    <button type="button" onClick={() => copyRows(rows, "atual")} disabled={Boolean(unmatched) || !forecast} className={secondary}>
                      {copied === "atual" ? <Check size={16} /> : <ClipboardCopy size={16} />} Copiar linhas para CHEGADAS
                    </button>
                    <button type="button" onClick={() => downloadCsv(rows, `chegadas-${list.invoice ?? "pl"}.csv`)} disabled={Boolean(unmatched) || !forecast} className={secondary}>
                      <Download size={16} /> Baixar CSV
                    </button>
                  </div>
                  {saveMessage ? <p className="text-sm font-semibold text-[#9b7a3e]">{saveMessage}</p> : null}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {tab === "conteineres" ? (
          <section className={`${card} mt-6 grid gap-3`}>
            {receipts === null ? (
              <p className="text-sm text-neutral-500">Carregando...</p>
            ) : receipts.length === 0 ? (
              <p className="text-sm text-neutral-500">Nenhum contêiner registrado ainda.</p>
            ) : (
              receipts.map((receipt) => (
                <div key={receipt.id} className="grid gap-2 rounded-2xl border border-black/5 bg-white/80 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <strong className="text-[#111]">{receipt.container ?? "sem contêiner"}</strong>
                    <span className="text-neutral-500">invoice {receipt.invoice}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${receipt.status === "recebido" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : receipt.status === "com_divergencia" ? "border-amber-500/25 bg-amber-500/10 text-amber-700" : "border-blue-500/20 bg-blue-500/10 text-blue-700"}`}>
                      {statusLabel[receipt.status]}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {receipt.items.reduce((sum, item) => sum + (item.volumes ?? 0), 0)} volumes · chegada {receipt.arrival_forecast ? new Date(`${receipt.arrival_forecast}T12:00:00`).toLocaleDateString("pt-BR") : "sem previsão"}
                    </span>
                  </div>
                  {receipt.validation?.issues?.length ? <p className="text-xs text-amber-700">{receipt.validation.issues.join(" · ")}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => copyRows(receiptRows(receipt), receipt.id)} className={secondary}>
                      {copied === receipt.id ? <Check size={15} /> : <ClipboardCopy size={15} />} Linhas CHEGADAS
                    </button>
                    {receipt.status !== "recebido" ? (
                      <button type="button" onClick={() => setStatus(receipt, "recebido")} className={primary}>
                        <PackageCheck size={15} /> Marcar recebido
                      </button>
                    ) : (
                      <button type="button" onClick={() => setStatus(receipt, "em_transito")} className={secondary}>Desfazer</button>
                    )}
                    {receipt.file_url ? (
                      <a href={receipt.file_url} target="_blank" rel="noreferrer" className={secondary}>
                        <Download size={15} /> PDF
                      </a>
                    ) : null}
                    <button type="button" onClick={() => removeReceipt(receipt)} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-400 hover:text-red-600" aria-label="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        ) : null}

        {tab === "estoque" ? (
          <section className={`${card} mt-6 overflow-x-auto`}>
            <p className="mb-3 text-xs text-neutral-500">
              Estoque publicado no Cadastrar Pedido{stockDate ? ` em ${new Date(`${stockDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""} (sem descontar reservas) + fardos a caminho nos contêineres registrados.
            </p>
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs uppercase tracking-[0.1em] text-neutral-500">
                  <th className="py-2">Produto</th>
                  <th className="py-2">Pç/fardo</th>
                  <th className="py-2">Fardos no galpão</th>
                  <th className="py-2">A caminho</th>
                  <th className="py-2">Situação</th>
                </tr>
              </thead>
              <tbody>
                {catalog
                  .slice()
                  .sort((a, b) => a.balesAvailable - b.balesAvailable)
                  .map((item) => (
                    <tr key={item.key} className="border-b border-black/5">
                      <td className="py-2 text-[#111]">{item.name}</td>
                      <td className="py-2 text-neutral-600">{item.piecesPerBale}</td>
                      <td className="py-2 font-semibold">{item.balesAvailable.toLocaleString("pt-BR")}</td>
                      <td className="py-2 text-neutral-600">{inTransit[item.name] ? `+${inTransit[item.name]}` : "-"}</td>
                      <td className="py-2 text-xs">
                        {item.balesAvailable <= 50 ? <span className="text-amber-700">Últimos fardos</span> : <span className="text-emerald-700">Ok</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </main>
  );
}
