export type OrderStatus =
  | "lead"
  | "cotacao"
  | "negociacao"
  | "aprovado"
  | "pago"
  | "separacao"
  | "expedido"
  | "entregue"
  | "cancelado";

export type OrderPriority = "baixa" | "normal" | "alta" | "urgente";

export type Order = {
  id: string;
  code: string;
  lead_id: string | null;
  customer_name: string;
  customer_company: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  destination_country: string | null;
  destination_city: string | null;
  status: OrderStatus;
  priority: OrderPriority;
  source: string | null;
  incoterm: string | null;
  currency: string;
  total_amount: number;
  expected_ship_date: string | null;
  tracking_code: string | null;
  assigned_to: string | null;
  notes: string | null;
  status_changed_at: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  created_at: string;
};

export type OrderEvent = {
  id: string;
  order_id: string;
  event_type: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus | null;
  note: string | null;
  actor: string | null;
  created_at: string;
};
