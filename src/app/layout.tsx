import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarZ - Plataforma de Monitoramento Solar",
  description:
    "Plataforma SaaS para integradores de energia solar. Monitoramento, p\u00f3s-venda e gest\u00e3o completa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
