import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

// Confere se a chamada vem de alguém logado no painel admin (token do Supabase).
// Usado pelas rotas que gastam IA, para terceiros não consumirem a cota.
export async function getAdminUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await supabase.auth.getUser(token);

  return data.user ? { user: data.user, supabase } : null;
}
