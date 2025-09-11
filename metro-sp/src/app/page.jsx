"use client";

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/config.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.endsWith("@metrosp.com")) {
      setError("O e-mail precisa terminar com @metrosp.com");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔒 Define persistência do Firebase Auth
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      // 🔐 Faz login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );
      const user = userCredential.user;

      // 🔎 Busca dados no Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Usuário não encontrado no banco.");
        return;
      }

      const userData = userSnap.data();
      console.log("Usuário logado:", userData);

      // 💾 Guarda dados p/ Dashboard
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(userData));

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro no login:", err);
      setError("E-mail ou senha inválidos.");
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

          {/* Input Usuário */}
          <div className="relative">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full h-12 pl-4 pr-12 bg-transparent border ${
                error
                  ? "border-red-500 focus:ring-red-400"
                  : "border-white/30 focus:ring-blue-400"
              } rounded-full text-white placeholder-white focus:outline-none focus:ring-2`}
            />
            <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg" />
          </div>

          {/* Input Senha */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-white text-lg"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
            <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg" />
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
            <Link href="/forgot-password" className="hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Mensagem de erro */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Botão */}
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
            <Link href="/createacc" className="font-semibold hover:underline">
              Registre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
