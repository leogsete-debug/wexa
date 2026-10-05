import type { ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import "./admin-dark.css";

// Painel com cara de terminal: fonte monoespaçada de programador.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-admin-mono", display: "swap" });

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={`admin-dark ${mono.variable}`}>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  );
}
