"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Lock, UserPlus, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar conta.");
      }

      setSuccess(true);
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
      <div className="absolute inset-0 bg-brand-dark z-0">
        <div className="absolute inset-0 bg-radial-at-c from-brand-blue/15 via-transparent to-brand-dark" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-brand-surface/90 border border-brand-surfaceBorder rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-gold shadow-glowGold mb-3">
            <Image
              src="/logo.jfif"
              alt="Top Filmes Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Crie sua Conta no <span className="text-brand-gold">Top Filmes</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Cadastre-se para assistir aos maiores clássicos do cinema e da TV.
          </p>
        </div>

        {success ? (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            <h3 className="text-xl font-bold text-white uppercase">
              Confirmação de E-mail Enviada!
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {message}
            </p>

            {devLink && (
              <div className="p-3 bg-brand-surfaceElevated rounded-xl border border-brand-gold/40 text-left">
                <span className="text-[10px] font-bold text-brand-gold uppercase block mb-1">
                  💡 Modo Desenvolvimento (Link Direto de Ativação):
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
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3 px-6 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-glowGold"
              >
                <span>Ir para a Página de Login</span>
                <ArrowRight className="w-4 h-4" />
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
                Seu Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Seu E-mail (Para confirmação da conta)
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
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Criar Senha (Mínimo 6 dígitos)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
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
                  <UserPlus className="w-4 h-4" />
                  <span>Finalizar Cadastro e Enviar Confirmação</span>
                </>
              )}
            </button>

            <div className="mt-6 text-center text-xs text-gray-400">
              Já possui conta ativada?{" "}
              <Link
                href="/login"
                className="text-brand-gold hover:underline font-bold"
              >
                Fazer Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
