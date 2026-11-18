import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import TrafficTracker from "@/components/TrafficTracker";

export const metadata: Metadata = {
  metadataBase: new URL("https://topfilmes-six.vercel.app"),
  title: {
    default: "Top Filmes | O Melhor Streaming Nostálgico de Filmes Clássicos",
    template: "%s | Top Filmes",
  },
  description:
    "Plataforma de streaming gratuita com os grandes clássicos do cinema, décadas de 70, 80, 90 e 2000, Filmes Bíblicos, Faroeste, Guerra, Comédia, Sessão da Tarde e Super Cine.",
  keywords: [
    "Top Filmes",
    "filmes clássicos online",
    "filmes anos 80",
    "filmes anos 90",
    "filmes bíblicos",
    "filmes de faroeste",
    "filmes de guerra",
    "comédia clássica",
    "sessão da tarde",
    "assistir filmes grátis",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://topfilmes-six.vercel.app",
    siteName: "Top Filmes",
    title: "Top Filmes | O Melhor Streaming Nostálgico",
    description:
      "Assista aos maiores clássicos do cinema, filmes bíblicos, faroeste, guerra, ação e comédia online grátis.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Top Filmes" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFC700",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-brand-dark text-white flex flex-col pb-16 lg:pb-0">
        <TrafficTracker />
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
