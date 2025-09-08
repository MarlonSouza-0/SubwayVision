"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config.js";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // 🔹 Tenta carregar do localStorage ou sessionStorage
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // 🔹 Se não achar no storage, consulta o Firebase Auth
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUser(data);

            // 🔹 Garante que pelo menos fique na sessão
            sessionStorage.setItem("user", JSON.stringify(data));
          } else {
            router.push("/");
          }
        } else {
          router.push("/"); // não logado
        }
      });

      return () => unsub();
    }
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return <p className="text-white text-center">Carregando...</p>;
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/metro.png)" }}
    >
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white">Bem-vindo!</h1>
        <p className="text-white mt-2">👤 {user.name}</p>
        <p className="text-white">📧 {user.email}</p>

        <button
          onClick={handleLogout}
          className="mt-6 w-full h-12 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
