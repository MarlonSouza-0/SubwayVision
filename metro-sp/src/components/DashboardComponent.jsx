"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { signOut } from "firebase/auth";
import {
  Home,
  Upload,
  Image as ImageIcon,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

import ImageUploader from "@/components/upload/ImageUploader";
import ImageGallery from "@/components/upload/ImageGallery";

export default function DashboardComponent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [lastUpload, setLastUpload] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    // 🔎 Pegar último upload no Firestore
    const fetchLastUpload = async () => {
      try {
        const q = query(
          collection(db, "uploads"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setLastUpload(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Erro ao buscar último upload:", err);
      }
    };

    fetchLastUpload();
  }, [activeTab]);

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
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8">🚇 Metro-SP</h2>
          <nav className="space-y-4">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === "home" ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <Home size={20} /> Início
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === "upload" ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <Upload size={20} /> Upload
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === "gallery" ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <ImageIcon size={20} /> Galeria
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === "reports" ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <BarChart2 size={20} /> Relatórios
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeTab === "settings" ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <Settings size={20} /> Configurações
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "home" && (
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo, {user.name}!</h1>
            <p className="text-gray-400 mt-2">
              Aqui você pode gerenciar imagens, relatórios e acompanhar a obra.
            </p>

            {lastUpload ? (
              <div className="mt-6 bg-gray-800 p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">
                  Último projeto enviado:
                </h2>
                <img
                  src={lastUpload.url}
                  alt="Último upload"
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                <p className="text-gray-400 mt-2">
                  Enviado em:{" "}
                  {lastUpload.createdAt?.toDate
                    ? lastUpload.createdAt.toDate().toLocaleString()
                    : "Data não disponível"}
                </p>
              </div>
            ) : (
              <p className="mt-6 text-gray-400">
                Nenhum upload encontrado ainda.
              </p>
            )}
          </div>
        )}

        {activeTab === "upload" && <ImageUploader />}

        {activeTab === "gallery" && <ImageGallery />}

        {activeTab === "reports" && (
          <div className="p-6 bg-gray-800 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">📊 Relatórios</h2>
            <p className="text-gray-400">
              Em breve: relatórios automáticos do andamento da obra.
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6 bg-gray-800 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">⚙️ Configurações</h2>
            <p className="text-gray-400">
              Em breve: configurações de conta e preferências.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
