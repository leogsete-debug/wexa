import type { Lead } from "@/types/lead";
import type { Order, OrderPriority, OrderStatus } from "@/types/order";

export const orderStatuses: Array<{
  value: OrderStatus;
  label: string;
  // Dias na mesma fase até o pedido ser considerado travado.
  stuckAfterDays: number | null;
}> = [
  { value: "lead", label: "Lead", stuckAfterDays: 2 },
  { value: "cotacao", label: "Cotação enviada", stuckAfterDays: 3 },
  { value: "negociacao", label: "Negociação", stuckAfterDays: 7 },
  { value: "aprovado", label: "Aprovado", stuckAfterDays: 3 },
  { value: "pago", label: "Pagamento confirmado", stuckAfterDays: 2 },
  { value: "separacao", label: "Separação", stuckAfterDays: 3 },
  { value: "expedido", label: "Expedido", stuckAfterDays: 30 },
  { value: "entregue", label: "Entregue", stuckAfterDays: null },
  { value: "cancelado", label: "Cancelado", stuckAfterDays: null },
];

export const orderPriorities: Array<{ value: OrderPriority; label: string }> = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export function getOrderStatusLabel(status: OrderStatus | null) {
  return orderStatuses.find((item) => item.value === status)?.label ?? status ?? "-";
}

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  const flow = orderStatuses.filter((item) => item.value !== "cancelado");
  const index = flow.findIndex((item) => item.value === status);
  return index >= 0 && index < flow.length - 1 ? flow[index + 1].value : null;
}

export function getDaysInStatus(order: Order) {
  const since = new Date(order.status_changed_at || order.created_at).getTime();
  return Math.floor((Date.now() - since) / 86_400_000);
}

export function isOrderStuck(order: Order) {
  const limit = orderStatuses.find((item) => item.value === order.status)?.stuckAfterDays;
  return limit != null && getDaysInStatus(order) >= limit;
}

export function getOrderPriorityClasses(priority: OrderPriority) {
  if (priority === "urgente") {
    return "border-red-500/20 bg-red-500/10 text-red-700";
  }

  if (priority === "alta") {
    return "border-[#d6b46a]/30 bg-[#d6b46a]/10 text-[#9b7a3e]";
  }

  if (priority === "baixa") {
    return "border-neutral-500/20 bg-neutral-500/10 text-neutral-600";
  }

  return "border-blue-500/20 bg-blue-500/10 text-blue-700";
}

export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function orderFromLead(lead: Lead) {
  return {
    lead_id: lead.id,
    customer_name: lead.name,
    customer_company: lead.company,
    customer_email: lead.email,
    customer_phone: lead.phone,
    destination_country: lead.country,
    destination_city: lead.city,
    source: lead.source ?? "lead",
    notes: lead.product_interest ? `Interesse: ${lead.product_interest}` : null,
  };
}
