import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Top Filmes | O Melhor Streaming Nostálgico",
  description: "Plataforma de streaming com os grandes clássicos do cinema, décadas de 70, 80, 90 e 2000, Sessão da Tarde, Super Cine e muito mais.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jfif",
    apple: "/logo.jfif",
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
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
