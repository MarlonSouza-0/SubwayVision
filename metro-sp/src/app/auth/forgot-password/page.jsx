"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config.js";
import { useRouter } from "next/navigation";
import { FaEnvelope } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@metrosp.com")) {
      setError("O e-mail precisa terminar com @metrosp.com");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("✅ E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar e-mail: " + err.message);
      setSuccess("");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/metro.png)" }}
    >
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Recuperar Senha
        </h1>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Campo de e-mail */}
          <div className="relative">
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg" />
          </div>

          {/* Mensagens */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          {/* Botão enviar */}
          <button
            type="submit"
            className="w-full h-12 bg-white text-gray-900 font-semibold rounded-full shadow-md hover:bg-gray-200 transition"
          >
            Enviar link de recuperação
          </button>

          {/* Voltar para login */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full h-12 bg-gray-600 text-white font-semibold rounded-full shadow-md hover:bg-gray-700 transition"
          >
            Voltar para login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
