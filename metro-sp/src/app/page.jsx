"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Link from "next/link";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // opcional, pode remover depois
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.endsWith("@metrosp.com")) {
      setError("O e-mail precisa terminar com @metrosp.com");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn(email, password); // 🚀 usa AuthContext
      router.push("/dashboard");     // ✅ redireciona só depois de logar
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.code === "auth/user-not-found") {
        setError("Usuário não encontrado.");
      } else if (err.code === "auth/wrong-password") {
        setError("Senha incorreta.");
      } else if (err.code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else {
        setError("Erro ao efetuar login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/metro.png)" }}
    >
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Acesse o sistema
          </h1>

          {/* E-mail */}
          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-12 pl-12 pr-4 bg-transparent border ${
                error ? "border-red-500 focus:ring-red-400" : "border-white/30 focus:ring-blue-400"
              } rounded-full text-white placeholder-white focus:outline-none focus:ring-2`}
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg" />
          </div>

          {/* Senha */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {/* Lembre de mim + Esqueceu senha */}
          <div className="flex items-center justify-between text-sm text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-white"
              />
              Lembre de mim
            </label>
            <Link href="/auth/forgot-password" className="hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Erro */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Botão login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-gray-900 font-semibold rounded-full shadow-md hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Login"}
          </button>

          {/* Registro */}
          <p className="text-sm text-center text-white">
            Não tem uma conta?{" "}
            <Link href="/auth/create-account" className="font-semibold hover:underline">
              Registre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
