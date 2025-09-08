"use client";

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      // 🔹 Login no Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );
      const user = userCredential.user;

      // 🔹 Busca dados no Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("Usuário logado:", userData);

        // 🔹 Salva no localStorage para o Dashboard usar
        localStorage.setItem("user", JSON.stringify(userData));

        router.push("/dashboard");
      } else {
        setError("Usuário não encontrado no banco.");
      }
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
          <div className="relative flex flex-col gap-1">
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
          </div>

          {/* Input Senha */}
          <div className="relative">
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg" />
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
