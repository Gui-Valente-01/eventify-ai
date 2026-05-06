import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Eventify AI — Sites de eventos com IA em minutos",
    template: "%s | Eventify AI",
  },
  description:
    "Crie sites promocionais profissionais para casamentos, aniversários, eventos corporativos e festas. Conteúdo gerado por IA em minutos.",
  keywords: [
    "site de eventos",
    "convite digital",
    "casamento",
    "aniversário",
    "RSVP",
    "site com IA",
    "convite online",
  ],
  authors: [{ name: "Eventify AI" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Eventify AI",
    title: "Eventify AI — Sites de eventos com IA",
    description:
      "Crie sites promocionais profissionais para qualquer evento em minutos. A IA monta layout e conteúdo automaticamente.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventify AI",
    description: "Sites de eventos com IA em minutos.",
  },
  icons: {
    icon: "/favicon.ico",
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
