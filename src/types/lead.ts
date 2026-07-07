export type LeadStatus =
  | "Novo"
  | "Em atendimento"
  | "Proposta enviada"
  | "Negociacao"
  | "Cliente"
  | "Perdido";

export type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  product_interest: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadPayload = {
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  product_interest: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;
};
