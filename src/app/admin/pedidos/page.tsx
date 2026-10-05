"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, ClipboardList, PackageCheck, Plus, Search, Trash2, Truck, Wallet } from "lucide-react";
import {
  formatMoney,
  getDaysInStatus,
  getNextOrderStatus,
  getOrderPriorityClasses,
  getOrderStatusLabel,
  isOrderStuck,
  orderPriorities,
  orderStatuses,
} from "@/lib/orders";
import { supabase } from "@/lib/supabase";
import type { Order, OrderEvent, OrderItem, OrderPriority, OrderStatus } from "@/types/order";
import type { Product } from "@/types/product";

type ProductOption = Pick<Product, "id" | "name">;

const cardClass =
  "rounded-[1.25rem] border border-white/75 bg-white/80 p-5 shadow-[0_16px_50px_rgba(31,41,55,0.08)]";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none";
const darkButtonClass =
  "h-11 rounded-full bg-[#111] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111] disabled:opacity-50";

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const emptyNewOrder = {
  customer_name: "",
  customer_company: "",
  customer_email: "",
  customer_phone: "",
  destination_country: "",
};

const emptyItem = { product_id: "", description: "", quantity: "1", unit: "un", unit_price: "0" };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [search, setSearch] = useState("");
  const [showCanceled, setShowCanceled] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrder, setNewOrder] = useState(emptyNewOrder);
  const [itemDraft, setItemDraft] = useState(emptyItem);
  const [noteDraft, setNoteDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (search.trim()) {
      const term = search.trim();
      query = query.or(
        `code.ilike.%${term}%,customer_name.ilike.%${term}%,customer_company.ilike.%${term}%,destination_country.ilike.%${term}%`,
      );
    }

    const { data, error: loadError } = await query;

    if (loadError) {
      setError("Não foi possível carregar os pedidos. Verifique se o SQL create_orders.sql foi executado no Supabase.");
      setOrders([]);
    } else {
      setOrders((data ?? []) as Order[]);
    }

    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadOrders();
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [loadOrders]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name")
      .order("name")
      .then(({ data }) => setProducts((data ?? []) as ProductOption[]));
  }, []);

  // Abre direto um pedido criado a partir do CRM (/admin/pedidos?pedido=<id>)
  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("pedido");
    if (!orderId) return;

    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single<Order>()
      .then(({ data }) => {
        if (data) openOrder(data);
      });
  }, []);

  const metrics = useMemo(() => {
    const active = orders.filter((order) => !["entregue", "cancelado"].includes(order.status));
    const inPipeline = orders.filter((order) => ["cotacao", "negociacao"].includes(order.status));
    const inOperation = orders.filter((order) => ["aprovado", "pago", "separacao"].includes(order.status));

    return [
      { title: "Pedidos ativos", value: String(active.length), icon: ClipboardList },
      { title: "Em negociação", value: String(inPipeline.length), icon: Wallet },
      { title: "Em operação", value: String(inOperation.length), icon: PackageCheck },
      { title: "Travados", value: String(active.filter(isOrderStuck).length), icon: AlertTriangle },
    ];
  }, [orders]);

  const columns = useMemo(
    () =>
      orderStatuses
        .filter((status) => showCanceled || status.value !== "cancelado")
        .map((status) => ({
          ...status,
          orders: orders.filter((order) => order.status === status.value),
        })),
    [orders, showCanceled],
  );

  async function openOrder(order: Order) {
    setSelectedOrder(order);
    setItemDraft(emptyItem);
    setNoteDraft("");

    const [itemsResult, eventsResult] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id).order("created_at"),
      supabase.from("order_events").select("*").eq("order_id", order.id).order("created_at", { ascending: false }),
    ]);

    setItems((itemsResult.data ?? []) as OrderItem[]);
    setEvents((eventsResult.data ?? []) as OrderEvent[]);
  }

  async function refreshSelected(orderId: string) {
    const { data } = await supabase.from("orders").select("*").eq("id", orderId).single<Order>();
    if (!data) return;

    setOrders((current) => current.map((order) => (order.id === data.id ? data : order)));
    await openOrder(data);
  }

  async function updateSelectedOrder(payload: Partial<Order>) {
    if (!selectedOrder) return;

    const { error: updateError } = await supabase.from("orders").update(payload).eq("id", selectedOrder.id);

    if (updateError) {
      setError("Não foi possível atualizar o pedido.");
      return;
    }

    await refreshSelected(selectedOrder.id);
  }

  async function createOrder() {
    if (!newOrder.customer_name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    const { data, error: createError } = await supabase
      .from("orders")
      .insert({
        customer_name: newOrder.customer_name.trim(),
        customer_company: toNullable(newOrder.customer_company),
        customer_email: toNullable(newOrder.customer_email),
        customer_phone: toNullable(newOrder.customer_phone),
        destination_country: toNullable(newOrder.destination_country),
      })
      .select("*")
      .single<Order>();

    if (createError || !data) {
      setError("Não foi possível criar o pedido.");
      return;
    }

    setIsCreating(false);
    setNewOrder(emptyNewOrder);
    setOrders((current) => [data, ...current]);
    await openOrder(data);
  }

  async function addItem() {
    if (!selectedOrder) return;

    const product = products.find((item) => item.id === itemDraft.product_id);
    const description = itemDraft.description.trim() || product?.name || "";
    const quantity = Number(itemDraft.quantity.replace(",", "."));
    const unitPrice = Number(itemDraft.unit_price.replace(",", "."));

    if (!description || !(quantity > 0) || !(unitPrice >= 0)) {
      setError("Item inválido: informe produto ou descrição, quantidade e preço.");
      return;
    }

    const { error: insertError } = await supabase.from("order_items").insert({
      order_id: selectedOrder.id,
      product_id: product?.id ?? null,
      description,
      quantity,
      unit: itemDraft.unit.trim() || "un",
      unit_price: unitPrice,
    });

    if (insertError) {
      setError("Não foi possível adicionar o item.");
      return;
    }

    setItemDraft(emptyItem);
    await refreshSelected(selectedOrder.id);
  }

  async function removeItem(itemId: string) {
    if (!selectedOrder) return;

    await supabase.from("order_items").delete().eq("id", itemId);
    await refreshSelected(selectedOrder.id);
  }

  async function addNote() {
    if (!selectedOrder || !noteDraft.trim()) return;

    await supabase.from("order_events").insert({
      order_id: selectedOrder.id,
      event_type: "note",
      note: noteDraft.trim(),
    });

    setNoteDraft("");
    await refreshSelected(selectedOrder.id);
  }

  const nextStatus = selectedOrder ? getNextOrderStatus(selectedOrder.status) : null;

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[110rem]">
        <header className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-[#111]"
            >
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <p className="mb-3 inline-flex rounded-full border border-[#d6b46a]/30 bg-white/75 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9b7a3e] shadow-[0_14px_40px_rgba(31,41,55,0.06)]">
              Operação
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">Pedidos</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Cada pedido em sua fase, do primeiro contato à entrega. Pedidos parados além do prazo da fase aparecem como travados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#111] px-6 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#d6b46a] hover:text-[#111]"
          >
            <Plus size={16} /> Novo pedido
          </button>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ title, value, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-[0_22px_70px_rgba(31,41,55,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111] text-[#d6b46a]">
                <Icon size={21} strokeWidth={1.8} />
              </div>
              <strong className="text-3xl font-semibold tracking-[-0.04em] text-[#111]">{value}</strong>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4">
            <Search size={18} className="text-neutral-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Pesquisar por código, cliente, empresa ou país"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600">
            <input type="checkbox" checked={showCanceled} onChange={(event) => setShowCanceled(event.target.checked)} />
            Mostrar cancelados
          </label>
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">Carregando pedidos</div>
        ) : (
          <section className="mt-6 flex gap-4 overflow-x-auto pb-6">
            {columns.map((column) => (
              <div key={column.value} className="w-72 shrink-0 rounded-[1.5rem] border border-black/5 bg-black/[0.03] p-3">
                <div className="flex items-center justify-between px-2 py-2">
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-600">{column.label}</h2>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-neutral-500">
                    {column.orders.length}
                  </span>
                </div>

                <div className="mt-2 grid gap-3">
                  {column.orders.map((order) => {
                    const stuck = isOrderStuck(order);

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => openOrder(order)}
                        className={`rounded-2xl border bg-white p-4 text-left shadow-[0_10px_30px_rgba(31,41,55,0.06)] transition hover:-translate-y-0.5 ${
                          stuck ? "border-red-500/40" : "border-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold tracking-[0.08em] text-[#9b7a3e]">{order.code}</span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${getOrderPriorityClasses(order.priority)}`}
                          >
                            {order.priority}
                          </span>
                        </div>
                        <strong className="mt-2 block text-base font-semibold tracking-[-0.02em] text-[#141414]">
                          {order.customer_name}
                        </strong>
                        <span className="block text-sm text-neutral-500">
                          {[order.customer_company, order.destination_country].filter(Boolean).join(" · ") || "-"}
                        </span>
                        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                          <span className="font-semibold text-[#111]">{formatMoney(Number(order.total_amount), order.currency)}</span>
                          <span className={stuck ? "inline-flex items-center gap-1 font-bold text-red-600" : ""}>
                            {stuck ? <AlertTriangle size={12} /> : null}
                            {getDaysInStatus(order)}d na fase
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {isCreating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-[#fbfaf7] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#111]">Novo pedido</h2>
            <div className="mt-5 grid gap-3">
              {(
                [
                  ["customer_name", "Cliente *"],
                  ["customer_company", "Empresa"],
                  ["customer_email", "Email"],
                  ["customer_phone", "Telefone"],
                  ["destination_country", "País de destino"],
                ] as const
              ).map(([field, label]) => (
                <input
                  key={field}
                  value={newOrder[field]}
                  onChange={(event) => setNewOrder((current) => ({ ...current, [field]: event.target.value }))}
                  className={inputClass}
                  placeholder={label}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="h-11 rounded-full border border-black/10 bg-white px-5 text-xs font-bold uppercase tracking-[0.16em]"
              >
                Cancelar
              </button>
              <button type="button" onClick={createOrder} className={darkButtonClass}>
                Criar pedido
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedOrder ? (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-[#fbfaf7] p-5 text-[#161616] shadow-[-30px_0_90px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9b7a3e]">{selectedOrder.code}</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#111]">{selectedOrder.customer_name}</h2>
              <p className="mt-2 text-sm text-neutral-500">
                {getOrderStatusLabel(selectedOrder.status)} há {getDaysInStatus(selectedOrder)} dia(s)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <div className="grid flex-1 content-start gap-5 overflow-y-auto py-5">
            <div className={`${cardClass} grid gap-4`}>
              {nextStatus ? (
                <button
                  type="button"
                  onClick={() => updateSelectedOrder({ status: nextStatus })}
                  className={`${darkButtonClass} inline-flex items-center justify-center gap-2`}
                >
                  Avançar para {getOrderStatusLabel(nextStatus)} <ArrowRight size={14} />
                </button>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                  Fase
                  <select
                    value={selectedOrder.status}
                    onChange={(event) => updateSelectedOrder({ status: event.target.value as OrderStatus })}
                    className={inputClass}
                  >
                    {orderStatuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                  Prioridade
                  <select
                    value={selectedOrder.priority}
                    onChange={(event) => updateSelectedOrder({ priority: event.target.value as OrderPriority })}
                    className={inputClass}
                  >
                    {orderPriorities.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["incoterm", "Incoterm (FOB, CIF...)"],
                    ["currency", "Moeda (USD, BRL...)"],
                    ["expected_ship_date", "Previsão de embarque"],
                    ["tracking_code", "Rastreio / BL"],
                    ["assigned_to", "Responsável"],
                    ["destination_city", "Cidade de destino"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={`${selectedOrder.id}-${field}`} className="grid gap-2 text-sm font-semibold text-neutral-700">
                    {label}
                    <input
                      type={field === "expected_ship_date" ? "date" : "text"}
                      defaultValue={selectedOrder[field] ?? ""}
                      onBlur={(event) => {
                        const value =
                          field === "currency" ? event.target.value.trim().toUpperCase() || "USD" : toNullable(event.target.value);
                        if (value !== selectedOrder[field]) updateSelectedOrder({ [field]: value });
                      }}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#111]">Itens</h3>
                <strong className="text-lg">{formatMoney(Number(selectedOrder.total_amount), selectedOrder.currency)}</strong>
              </div>

              <div className="mt-3 divide-y divide-black/10">
                {items.length === 0 ? <p className="py-3 text-sm text-neutral-500">Nenhum item ainda.</p> : null}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#111]">{item.description}</p>
                      <p className="text-neutral-500">
                        {Number(item.quantity)} {item.unit} × {formatMoney(Number(item.unit_price), selectedOrder.currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-400 hover:text-red-600"
                      aria-label="Remover item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 border-t border-black/10 pt-4">
                <select
                  value={itemDraft.product_id}
                  onChange={(event) => setItemDraft((current) => ({ ...current, product_id: event.target.value }))}
                  className={inputClass}
                >
                  <option value="">Produto do catálogo (opcional)</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  value={itemDraft.description}
                  onChange={(event) => setItemDraft((current) => ({ ...current, description: event.target.value }))}
                  className={inputClass}
                  placeholder="Descrição (se vazio, usa o nome do produto)"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    value={itemDraft.quantity}
                    onChange={(event) => setItemDraft((current) => ({ ...current, quantity: event.target.value }))}
                    className={inputClass}
                    placeholder="Qtd"
                    inputMode="decimal"
                  />
                  <input
                    value={itemDraft.unit}
                    onChange={(event) => setItemDraft((current) => ({ ...current, unit: event.target.value }))}
                    className={inputClass}
                    placeholder="Unidade"
                  />
                  <input
                    value={itemDraft.unit_price}
                    onChange={(event) => setItemDraft((current) => ({ ...current, unit_price: event.target.value }))}
                    className={inputClass}
                    placeholder="Preço unit."
                    inputMode="decimal"
                  />
                </div>
                <button type="button" onClick={addItem} className={darkButtonClass}>
                  Adicionar item
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#111]">Cliente</h3>
              <div className="mt-3 grid gap-1 text-sm leading-6 text-neutral-600">
                {[
                  ["Empresa", selectedOrder.customer_company],
                  ["Email", selectedOrder.customer_email],
                  ["Telefone", selectedOrder.customer_phone],
                  ["País", selectedOrder.destination_country],
                  ["Origem", selectedOrder.source],
                ].map(([label, value]) => (
                  <p key={label}>
                    <strong className="text-[#111]">{label}:</strong> {value || "-"}
                  </p>
                ))}
                {selectedOrder.lead_id ? (
                  <Link href="/admin/crm/leads" className="mt-2 font-semibold text-[#9b7a3e] hover:underline">
                    Ver lead de origem no CRM
                  </Link>
                ) : null}
              </div>
            </div>

            <div className={`${cardClass} grid gap-4`}>
              <h3 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-[#111]">
                <Truck size={18} /> Histórico
              </h3>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                className="min-h-24 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none"
                placeholder="Adicionar observação ao histórico"
              />
              <button type="button" onClick={addNote} className={darkButtonClass}>
                Adicionar observação
              </button>
              <ol className="grid gap-3 border-l border-black/10 pl-4">
                {events.map((event) => (
                  <li key={event.id} className="text-sm leading-6 text-neutral-600">
                    <span className="block text-xs text-neutral-400">
                      {new Date(event.created_at).toLocaleString("pt-BR")} · {event.actor || "admin"}
                    </span>
                    {event.event_type === "created"
                      ? `Pedido criado em ${getOrderStatusLabel(event.to_status)}`
                      : event.event_type === "status_change"
                        ? `${getOrderStatusLabel(event.from_status)} → ${getOrderStatusLabel(event.to_status)}`
                        : event.note}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
