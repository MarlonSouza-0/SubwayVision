"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { X, Trash } from "lucide-react";

export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "uploads"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setImages(list);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Tem certeza que deseja excluir esta imagem?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "uploads", id));
    } catch (err) {
      console.error("Erro ao excluir imagem:", err);
      alert("Erro ao excluir. Veja o console para detalhes.");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        📷 Galeria
      </h2>

      {images.length === 0 ? (
        <p className="text-gray-300">Nenhuma imagem enviada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden shadow-md"
            >
              {/* Imagem clicável para lightbox */}
              <button
                onClick={() => setSelectedImage(img)}
                className="block w-full h-40"
              >
                <img
                  src={img.url}
                  alt={img.fileName || "Upload"}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </button>

              {/* Overlay de info */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <p className="text-sm text-white text-center px-2">
                  {img.userName || "Usuário"} <br />
                  {img.fileName || "Arquivo"} <br />
                  {img.createdAt?.seconds
                    ? new Date(
                        img.createdAt.seconds * 1000
                      ).toLocaleString("pt-BR")
                    : "Data não disponível"}
                </p>
              </div>

              {/* Botão de excluir no canto */}
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md"
                title="Excluir imagem"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-600 p-2 rounded-full hover:bg-red-700 transition"
            >
              <X size={20} className="text-white" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.fileName || "Selecionada"}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-gray-300 mt-2 text-center">
              {selectedImage.userName || "Usuário"} -{" "}
              {selectedImage.fileName || "Arquivo"} -{" "}
              {selectedImage.createdAt?.seconds
                ? new Date(
                    selectedImage.createdAt.seconds * 1000
                  ).toLocaleString("pt-BR")
                : "Data não disponível"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
