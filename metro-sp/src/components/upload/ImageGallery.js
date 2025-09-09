"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config.js";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { X } from "lucide-react";

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "images"),
      orderBy("createdAt", "desc") // mais recentes primeiro
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setImages(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">📷 Galeria</h2>

      {images.length === 0 ? (
        <p className="text-gray-300">Nenhuma imagem enviada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="relative group cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform"
            >
              <img
                src={img.url}
                alt="Upload"
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <p className="text-sm text-white text-center px-2">
                  {img.userName || "Usuário"} <br />
                  {img.createdAt?.seconds
                    ? new Date(img.createdAt.seconds * 1000).toLocaleString()
                    : "Data não disponível"}
                </p>
              </div>
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
              alt="Selecionada"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-gray-300 mt-2 text-center">
              {selectedImage.userName || "Usuário"} -{" "}
              {selectedImage.createdAt?.seconds
                ? new Date(
                    selectedImage.createdAt.seconds * 1000
                  ).toLocaleString()
                : "Data não disponível"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
