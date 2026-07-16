import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Top Max | Importacao da China, India e mercados internacionais",
  description:
    "A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo importacao, desenvolvimento de fornecedores, controle de qualidade e logistica global.",
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
