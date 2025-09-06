"use client";

import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Dados de Login:", { username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url(/assets/metro.png)" }}>
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-bold text-center text-white">
            Acesse o sistema
          </h1>

          {/* Input Usuário */}
          <div className="relative">
            <input
              type="text"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-transparent border border-white/30 rounded-full text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg" />
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

          {/* Lembre de mim e Esqueceu senha */}
          <div className="flex items-center justify-between text-sm text-white">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-white" />
              Lembre de mim
            </label>
            <a href="#" className="hover:underline">
              Esqueceu sua senha?
            </a>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full h-12 bg-white text-gray-900 font-semibold rounded-full shadow-md hover:bg-gray-200 transition"
          >
            Login
          </button>

          {/* Registro */}
          <p className="text-sm text-center text-white">
            Não tem uma conta?{" "}
            <a href="#" className="font-semibold hover:underline">
              Registre-se
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
