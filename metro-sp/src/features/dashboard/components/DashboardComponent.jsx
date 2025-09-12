"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config.js";
import { useAuth } from "@/shared/context/AuthContext";
import {
  Home,
  Upload,
  Image as ImageIcon,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

import ImageUploader from "@/features/upload/components/ImageUploader";
import ImageGallery from "@/features/upload/components/ImageGallery";
import UpdateName from "@/features/settings/components/UpdateName";
import UpdatePassword from "@/features/settings/components/UpdatePassword";


export default function DashboardComponent() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [lastUpload, setLastUpload] = useState(null);
  const router = useRouter();

  // 🔎 Buscar último upload
  useEffect(() => {
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

  // 🔒 Logout
  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  if (!user) {
    return <p className="text-white text-center">Carregando usuário...</p>;
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
        {/* Aba Home */}
        {activeTab === "home" && (
          <div>
            <h1 className="text-3xl font-bold">
              Bem-vindo, {user.displayName || "Usuário"}!
            </h1>
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

        {/* Aba Upload */}
        {activeTab === "upload" && <ImageUploader />}

        {/* Aba Galeria */}
        {activeTab === "gallery" && <ImageGallery />}

        {/* Aba Relatórios */}
        {activeTab === "reports" && (
          <div className="p-6 bg-gray-800 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">📊 Relatórios</h2>
            <p className="text-gray-400">
              Em breve: relatórios automáticos do andamento da obra.
            </p>
          </div>
        )}

        {/* Aba Configurações */}
        {activeTab === "settings" && (
          <div className="p-6 bg-gray-800 rounded-2xl shadow-md max-w-md">
            <h2 className="text-xl font-semibold mb-4">⚙️ Configurações</h2>
            <UpdateName /> {/* 🚀 componente separado */}
            <UpdatePassword /> {/* 🚀 componente separado */}
          </div>
        )}
      </main>
    </div>
  );
}
