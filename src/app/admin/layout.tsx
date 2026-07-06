import type { ReactNode } from "react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
