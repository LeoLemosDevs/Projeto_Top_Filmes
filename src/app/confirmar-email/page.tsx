"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, Home } from "lucide-react";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirmando seu e-mail...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de confirmação não encontrado no link.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha na confirmação.");
        return data;
      })
      .then((data) => {
        setStatus("success");
        setMessage(data.message || "E-mail confirmado com sucesso!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Link inválido ou expirado.");
      });
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-24 relative">
      <div className="relative z-10 w-full max-w-md bg-brand-surface border border-brand-surfaceBorder rounded-3xl p-8 shadow-2xl text-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-gold shadow-glowGold mx-auto mb-6">
          <Image
            src="/logo.png"
            alt="Top Filmes Logo"
            fill
            className="object-cover"
            priority
          />
        </div>

        {status === "loading" && (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wide">
              Validando E-mail
            </h2>
            <p className="text-xs text-gray-400">
              Aguarde um instante enquanto ativamos sua conta...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              Conta Ativada!
            </h2>
            <p className="text-sm text-gray-300">
              {message}
            </p>
            <p className="text-xs text-brand-gold font-semibold">
              Você já está autenticado e pronto para maratonar!
            </p>

            <div className="pt-4">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-brand-dark py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-glowGold"
              >
                <span>Acessar Catálogo de Filmes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4">
            <XCircle className="w-16 h-16 text-brand-red mx-auto" />
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              Falha na Ativação
            </h2>
            <p className="text-sm text-red-300">
              {message}
            </p>
            <p className="text-xs text-gray-400">
              O link pode ter expirado ou sua conta já foi confirmada anteriormente.
            </p>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold text-brand-dark py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                <span>Ir para a Página de Login</span>
              </Link>
              <Link
                href="/"
                className="text-xs text-gray-400 hover:text-white py-2"
              >
                Voltar à Página Inicial
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-dark flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
