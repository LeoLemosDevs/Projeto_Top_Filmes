"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Download, 
  Smartphone, 
  Tv, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Play
} from "lucide-react";

export default function BaixarAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    // Captura evento de instalação PWA no navegador (Chrome/Android)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "Para instalar no seu celular:\n\n1. Toque nos 3 pontinhos (⋮) no topo do seu navegador (Chrome ou Samsung Internet).\n2. Selecione 'Instalar aplicativo' ou 'Adicionar à tela inicial'.\n3. Pronto! O app Top Filmes aparecerá na tela do seu aparelho!"
      );
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* HERO SECTION */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Versão Oficial 2.0 • Android & TV
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Baixar Aplicativo <span className="text-brand-gold">Top Filmes</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Tenha a melhor experiência de streaming com catálogo de Filmes Bíblicos, Faroeste, Anos 80, Anos 90, Sessão da Tarde e Clássicos inesquecíveis direto no seu celular ou Smart TV.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> 100% Gratuito & Seguro
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
              <Zap className="w-4 h-4" /> Carregamento Ultrarrápido
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-gold bg-brand-gold/10 px-3 py-1.5 rounded-full border border-brand-gold/20">
              <Tv className="w-4 h-4" /> Compatível com TV Box
            </span>
          </div>
        </div>

        {/* OPÇÕES DE INSTALAÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* CARD 1: INSTALAR AGORA NO APARELHO (PWA DIRETO) */}
          <div className="relative bg-gradient-to-b from-brand-surfaceElevated to-brand-surface border-2 border-brand-gold/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-brand-gold transition-all">
            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-brand-gold text-brand-dark rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
              Mais Fácil & Instantâneo
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
                <Smartphone className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-white">
                  Instalar App no Celular
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Instale o Top Filmes direto pelo navegador em 3 segundos. Não ocupa espaço na memória, atualiza automaticamente e funciona como um app nativo no Android e iOS.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-brand-surfaceBorder">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sem necessidade de permissões desconhecidas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ícone oficial do Top Filmes na tela inicial</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Player em tela cheia com alta resolução</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                onClick={handleInstallPwa}
                className="w-full py-4 rounded-2xl bg-brand-gold hover:bg-brand-goldHover text-brand-dark font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-glowGold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Smartphone className="w-5 h-5" />
                <span>{isPwaInstalled ? "Aplicativo Já Instalado ✓" : "Instalar no Aparelho Agora"}</span>
              </button>
            </div>
          </div>

          {/* CARD 2: BAIXAR APK NATIVO ANDROID */}
          <div className="bg-gradient-to-b from-brand-surfaceElevated to-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-blue-400/50 transition-all">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Download className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-white">
                  Baixar Pacote APK (Android)
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Baixe o instalador `.apk` da versão 2.0 para instalar manualmente em aparelhos Android, Smart TV Android ou TV Box via pendrive.
                </p>
              </div>

              <div className="bg-brand-surface/60 rounded-xl p-3 border border-brand-surfaceBorder text-[11px] text-gray-400 space-y-1 font-mono">
                <div>• Versão: <span className="text-white">2.0.0</span></div>
                <div>• Pacote: <span className="text-white">com.topfilmes.app</span></div>
                <div>• Sistema Mínimo: <span className="text-white">Android 7.0 (Nougat) ou superior</span></div>
              </div>

              <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-brand-surfaceBorder">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Compatível com Smart TV Box e Celulares</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pronto para publicação na Google Play Store</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              <a
                href="/TopFilmes.apk"
                download="TopFilmes_v2.0.apk"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                <span>Baixar APK Direto (v2.0)</span>
              </a>

              <a
                href="https://github.com/LeoLemosDevs/Projeto_Top_Filmes/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-brand-surface border border-brand-surfaceBorder hover:border-gray-500 text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Baixar APK e AAB dos Builds no GitHub</span>
              </a>

              <p className="text-[10px] text-center text-gray-400">
                Tamanho leve • Livre de anúncios abusivos
              </p>
            </div>
          </div>
        </div>

        {/* GOOGLE PLAY STORE STATUS */}
        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-brand-surfaceBorder shrink-0 bg-black">
              <Image src="/logo.png" alt="Top Filmes" fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-brand-gold tracking-wider">Google Play Console</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">Versão 2.0</span>
              </div>
              <h4 className="text-base font-bold text-white mt-0.5">Top Filmes na Google Play Store</h4>
              <p className="text-xs text-gray-400 mt-1">
                O pacote Android nativo (`com.topfilmes.app`) já está preparado e assinado digitalmente com chave de lançamento para a Play Store.
              </p>
            </div>
          </div>

          <div className="shrink-0 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surfaceElevated border border-brand-surfaceBorder text-gray-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Homologado para Android</span>
            </div>
          </div>
        </div>

        {/* PASSO A PASSO DE INSTALAÇÃO */}
        <div className="bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-xl font-black uppercase text-white flex items-center gap-2 text-brand-gold">
            <HelpCircle className="w-5 h-5" /> Como Instalar o APK no Aparelho Android
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-brand-surfaceElevated border border-brand-surfaceBorder/80 rounded-2xl p-4 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-gold text-brand-dark font-black flex items-center justify-center text-xs">
                1
              </span>
              <h5 className="text-sm font-bold text-white">Baixe o Arquivo</h5>
              <p className="text-xs text-gray-400 leading-relaxed">
                Toque no botão <strong className="text-white">"Baixar APK Direto"</strong> acima para iniciar o download do arquivo.
              </p>
            </div>

            <div className="bg-brand-surfaceElevated border border-brand-surfaceBorder/80 rounded-2xl p-4 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-gold text-brand-dark font-black flex items-center justify-center text-xs">
                2
              </span>
              <h5 className="text-sm font-bold text-white">Confirme o Alerta</h5>
              <p className="text-xs text-gray-400 leading-relaxed">
                Se o Chrome exibir <em>"O arquivo pode ser nocivo"</em>, toque em <strong className="text-white">Fazer download mesmo assim</strong> (alerta padrão para apps baixados fora da loja).
              </p>
            </div>

            <div className="bg-brand-surfaceElevated border border-brand-surfaceBorder/80 rounded-2xl p-4 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-gold text-brand-dark font-black flex items-center justify-center text-xs">
                3
              </span>
              <h5 className="text-sm font-bold text-white">Abra e Instale</h5>
              <p className="text-xs text-gray-400 leading-relaxed">
                Abra a notificação de download ou acesse a pasta <strong className="text-white">Downloads</strong> e clique em <strong className="text-white">Instalar</strong>.
              </p>
            </div>

            <div className="bg-brand-surfaceElevated border border-brand-surfaceBorder/80 rounded-2xl p-4 space-y-2">
              <span className="w-7 h-7 rounded-full bg-brand-gold text-brand-dark font-black flex items-center justify-center text-xs">
                4
              </span>
              <h5 className="text-sm font-bold text-white">Aproveite!</h5>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pronto! Abra o app, faça login na sua conta e divirta-se com os melhores filmes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
