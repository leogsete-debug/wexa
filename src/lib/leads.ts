import type { Lead, LeadStatus } from "@/types/lead";

export const leadStatuses: Array<{
  value: LeadStatus;
  label: string;
}> = [
  { value: "Novo", label: "Novo" },
  { value: "Em atendimento", label: "Em atendimento" },
  { value: "Proposta enviada", label: "Proposta enviada" },
  { value: "Negociacao", label: "Negociacao" },
  { value: "Cliente", label: "Cliente" },
  { value: "Perdido", label: "Perdido" },
];

export function getLeadStatusClasses(status: LeadStatus) {
  if (status === "Cliente") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
  }

  if (status === "Perdido") {
    return "border-neutral-500/20 bg-neutral-500/10 text-neutral-600";
  }

  if (status === "Negociacao" || status === "Proposta enviada") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-700";
  }

  if (status === "Em atendimento") {
    return "border-[#d6b46a]/30 bg-[#d6b46a]/10 text-[#9b7a3e]";
  }

  return "border-red-500/20 bg-red-500/10 text-red-700";
}

export function getLeadMetric(leads: Lead[], status: LeadStatus) {
  return leads.filter((lead) => lead.status === status).length;
}
