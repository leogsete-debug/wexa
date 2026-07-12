import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TopMax Export | Exportação brasileira de alto padrão",
  description:
    "Vitrine internacional de exportação conectando produtos brasileiros a compradores globais com apresentação comercial premium.",
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
      "zh-CN": "/zh",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
