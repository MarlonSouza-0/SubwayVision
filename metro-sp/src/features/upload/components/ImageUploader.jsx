"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Upload function
  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);

    const storageRef = ref(storage, `images/${file.name}-${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error(error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "images"), {
          url: downloadURL,
          createdAt: serverTimestamp(),
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  // Handler for input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleUpload(file);
  };

  // Handler for drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-2xl shadow-md text-center text-white">
      <h2 className="text-xl font-semibold mb-4">Upload de Imagem</h2>

      {/* Área de drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-500 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition"
      >
        <p className="mb-2">Arraste sua imagem aqui</p>
        <p className="text-sm text-gray-400">ou</p>

        {/* Botão de upload */}
        <label className="mt-3 inline-block bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-500 transition">
          Escolher arquivo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Progresso */}
      {uploading && (
        <div className="mt-4">
          <p>Enviando: {Math.round(progress)}%</p>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
