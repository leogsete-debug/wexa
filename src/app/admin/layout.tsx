import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import "./admin-dark.css";

// Painel escuro e verde (dono sensível à luz), com tipografia moderna e legível.
const sans = Inter({ subsets: ["latin"], variable: "--font-admin", display: "swap" });

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={`admin-dark ${sans.variable}`}>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  );
}
