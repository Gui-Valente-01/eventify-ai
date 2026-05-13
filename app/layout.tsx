import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Eventify — Sites de evento com IA",
    template: "%s · Eventify",
  },
  description:
    "Crie sites editoriais para casamentos, aniversários, festas, eventos corporativos e religiosos. Templates premium curados, preenchidos com IA em minutos.",
  keywords: [
    "site de evento",
    "convite digital",
    "casamento",
    "aniversário",
    "RSVP",
    "templates de evento",
    "convite online",
    "Eventify",
  ],
  authors: [{ name: "Eventify" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Eventify",
    title: "Eventify — Sites de evento com IA",
    description:
      "Templates editoriais curados, preenchidos com IA. Do briefing ao link publicado em uma tarde.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventify",
    description: "Sites de evento com IA. Editorial, sem template genérico.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
