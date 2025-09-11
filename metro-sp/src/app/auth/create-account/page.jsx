"use client";

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.endsWith("@metrosp.com")) {
      setError("O e-mail precisa terminar com @metrosp.com");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        username,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email: username,
        createdAt: serverTimestamp(),
      });

      console.log("✅ Usuário registrado e salvo no Firestore!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError("Erro ao registrar usuário.");
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
            Crie sua conta
          </h1>

          {/* Nome */}
          <div className="relative">
            <input
              type="text"
              placeholder="Nome completo"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg" />
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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

          {/* Confirmar Senha */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Senha"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg"
            >
              {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-gray-900 font-semibold rounded-full shadow-md hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>

          <p className="text-sm text-center text-white">
            Já tem uma conta?{" "}
            <Link href="/" className="font-semibold hover:underline">
              Faça login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
