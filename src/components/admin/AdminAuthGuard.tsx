"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminAuthGuardProps = {
  children: ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (isLoginPage) {
        setIsChecking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setIsChecking(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isLoginPage && !session) {
        router.replace("/admin/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isChecking && !isLoginPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b0d] px-6 text-white">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] px-6 py-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/70 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          Carregando painel
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
