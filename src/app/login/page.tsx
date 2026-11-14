"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, ArrowRight, AlertTriangle, Send } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResendFeedback(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.unverified) {
          setUnverifiedEmail(data.email || email);
        }
        throw new Error(data.error || "Falha no login.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      setResendFeedback(data.message || "Link reenviado com sucesso!");
    } catch {
      setResendFeedback("Falha ao reenviar e-mail.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-24 relative">
      <div className="absolute inset-0 bg-brand-dark z-0">
        <div className="absolute inset-0 bg-radial-at-c from-brand-blue/15 via-transparent to-brand-dark" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-brand-surface/90 border border-brand-surfaceBorder rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-gold shadow-glowGold mb-3">
            <Image
              src="/logo.png"
              alt="Top Filmes Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Entrar no <span className="text-brand-gold">Top Filmes</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Acesse seu histórico, lista de favoritos e muito mais.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-red/10 border border-brand-red text-red-300 text-xs font-medium space-y-2">
            <p className="text-center">{error}</p>
            {unverifiedEmail && (
              <div className="pt-2 border-t border-brand-red/30 text-center">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold text-brand-dark font-extrabold text-[11px] uppercase tracking-wider shadow-sm hover:scale-105 transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>{resending ? "Reenviando..." : "Reenviar Link de Confirmação"}</span>
                </button>
                {resendFeedback && (
                  <p className="text-[11px] text-green-400 mt-2 font-bold">{resendFeedback}</p>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Senha
              </label>
              <Link
                href="/esqueci-senha"
                className="text-[11px] text-brand-gold hover:underline font-semibold"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-glowGold hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Acessar Plataforma</span>
              </>
            )}
          </button>
        </form>

        {/* ADMIN & USER CREDENTIALS HINT */}
        <div className="mt-6 p-3 bg-brand-surfaceElevated/60 border border-brand-surfaceBorder/60 rounded-xl text-[11px] text-gray-400 space-y-2">
          <div>
            <span className="font-bold text-brand-gold uppercase text-[10px]">👑 Administrador (Acesso Total):</span>
            <p className="text-gray-300">E-mail: <span className="text-white font-mono">professorleolemos@gmail.com</span></p>
            <p className="text-gray-300">Senha: <span className="text-brand-gold font-mono">leo250778</span></p>
          </div>
          <div className="pt-1.5 border-t border-brand-surfaceBorder/40">
            <span className="font-bold text-blue-400 uppercase text-[10px]">👤 Usuário Comum:</span>
            <p className="text-gray-300">E-mail: <span className="text-white font-mono">leojulhos@gmail.com</span></p>
            <p className="text-gray-300">Senha: <span className="text-brand-gold font-mono">123456</span></p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Ainda não tem conta?{" "}
          <Link
            href="/cadastro"
            className="text-brand-gold hover:underline font-bold inline-flex items-center gap-1"
          >
            Criar conta grátis <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
