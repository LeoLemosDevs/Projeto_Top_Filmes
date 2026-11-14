"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na solicitação.");

      setSubmitted(true);
      setMessage(data.message);
      if (data.devLink) setDevLink(data.devLink);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-24 relative">
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
            Recuperar <span className="text-brand-gold">Senha</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Digite seu e-mail para receber as instruções de redefinição.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
            <h3 className="text-lg font-bold text-white uppercase">
              E-mail Enviado!
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {message}
            </p>

            {devLink && (
              <div className="p-3 bg-brand-surfaceElevated rounded-xl border border-brand-gold/40 text-left">
                <span className="text-[10px] font-bold text-brand-gold uppercase block mb-1">
                  💡 Modo Desenvolvimento (Link Direto):
                </span>
                <a
                  href={devLink}
                  className="text-xs text-blue-400 hover:underline break-all"
                >
                  {devLink}
                </a>
              </div>
            )}

            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold hover:underline uppercase"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-brand-red/10 border border-brand-red text-red-300 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Seu E-mail Cadastrado
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-glowGold hover:scale-[1.02] active:scale-[0.98] mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Enviar Link de Recuperação</span>
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
