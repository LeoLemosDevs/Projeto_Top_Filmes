"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token de recuperação ausente ou inválido.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao redefinir senha.");

      setSuccess(true);
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
              src="/logo.jfif"
              alt="Top Filmes Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Nova <span className="text-brand-gold">Senha</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Escolha uma nova senha segura para a sua conta.
          </p>
        </div>

        {success ? (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            <h3 className="text-xl font-bold text-white uppercase">
              Senha Redefinida!
            </h3>
            <p className="text-xs text-gray-300">
              Sua senha foi atualizada com sucesso. Você já pode fazer login na plataforma.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-glowGold"
              >
                <span>Fazer Login Agora</span>
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
                Nova Senha (Mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-brand-surfaceElevated border border-brand-surfaceBorder rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Atualizar Minha Senha</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
