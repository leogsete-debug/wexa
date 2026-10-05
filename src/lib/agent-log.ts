import { createClient } from "@supabase/supabase-js";

// Todo agente registra aqui cada tarefa (sucesso, aviso ou erro). É a base da
// Central de Comando e das análises do agente Gerente.
export type AgentRun = {
  agent: "sofia" | "gerente" | "armazem" | "instagram" | "whatsapp";
  task: string;
  status: "ok" | "aviso" | "erro";
  provider?: string | null;
  durationMs?: number | null;
  detail?: string | null;
};

export async function logAgentRun(run: AgentRun) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("agent_runs").insert({
    agent: run.agent,
    task: run.task.slice(0, 80),
    status: run.status,
    provider: run.provider?.slice(0, 40) ?? null,
    duration_ms: run.durationMs != null ? Math.round(run.durationMs) : null,
    detail: run.detail?.slice(0, 1000) ?? null,
  });

  if (error) console.error("[agent-log] falha ao registrar:", error.message);
}
