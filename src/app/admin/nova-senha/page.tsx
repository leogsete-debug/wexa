"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Página aberta pelo link "Esqueci minha senha": confirma o link e define a senha nova.
export default function NewPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepare() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (exchangeError) {
          setLinkError("Este link expirou ou já foi usado. Peça um novo em “Esqueci minha senha”.");
          return;
        }
        setReady(true);
        return;
      }

      // Links antigos trazem a sessão no endereço (#access_token); o Supabase lê sozinho.
      await new Promise((resolve) => setTimeout(resolve, 600));
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) setReady(true);
      else setLinkError("Link inválido. Peça um novo em “Esqueci minha senha” na tela de login.");
    }

    prepare();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As duas senhas não são iguais.");
      return;
    }

    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (updateError) {
      setError("Não foi possível salvar a senha. Peça um novo link e tente de novo.");
      return;
    }

    router.replace("/admin/central");
    router.refresh();
  }

  const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#d6b46a]";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[1.5rem] border border-white/75 bg-white/80 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Nova senha</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">Crie uma senha nova para entrar no painel da Top Max.</p>

        {linkError ? (
          <p className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-600">{linkError}</p>
        ) : !ready ? (
          <p className="mt-6 text-sm text-neutral-500">Confirmando o link...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Nova senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className={inputClass}
                placeholder="Mínimo de 8 caracteres"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Repita a senha
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={isSaving} className="h-12 rounded-full bg-[#111] text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60">
              {isSaving ? "Salvando..." : "Salvar e entrar"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
