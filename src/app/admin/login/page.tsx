"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos. Verifique os dados e tente novamente.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#080b0d] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(214,180,106,0.18),transparent_28rem),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.08),transparent_24rem)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center">
        <section className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.08] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:p-8">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#d6b46a]/35 bg-[#d6b46a]/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#f0d89a]">
              Admin CMS
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Acesse o painel
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Entre com suas credenciais para gerenciar o conteúdo da TopMax Export.
            </p>
          </div>

          <form className="mt-8 grid gap-5" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-semibold text-white/78">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-12 rounded-2xl border border-white/12 bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-[#d6b46a]/60 focus:bg-white/[0.12]"
                placeholder="admin@topmaxexport.com"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-white/78">
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-12 rounded-2xl border border-white/12 bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-[#d6b46a]/60 focus:bg-white/[0.12]"
                placeholder="Digite sua senha"
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-[#d6b46a] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#111] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f0d89a] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
