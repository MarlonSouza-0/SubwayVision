"use client";

import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/shared/context/AuthContext";

export default function ImageUploader() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
      setSuccess("");
    } else {
      setError("Por favor, selecione uma imagem válida.");
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Selecione uma imagem antes de enviar.");
      return;
    }
    if (!user) {
      setError("Você precisa estar logado para enviar imagens.");
      return;
    }

    setError("");
    setSuccess("");
    setProgress(0);

    // Caminho no Firebase Storage
    const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(pct);
      },
      (err) => {
        console.error("Erro no upload:", err);
        setError("Erro ao enviar a imagem.");
      },
      async () => {
        // Upload concluído → pega URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Salva metadados no Firestore
        await addDoc(collection(db, "uploads"), {
          userId: user.uid,
          url: downloadURL,
          fileName: file.name,
          createdAt: serverTimestamp(),
        });

        setSuccess("✅ Upload concluído com sucesso!");
        setFile(null);
        setPreview(null);
        setProgress(0);
      }
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">📤 Enviar imagem</h2>

      {/* Input de arquivo */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Preview */}
      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 rounded-lg shadow-md object-contain"
          />
        </div>
      )}

      {/* Barra de progresso */}
      {progress > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Mensagens */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      {/* Botão */}
      <button
        onClick={handleUpload}
        disabled={!file || !user}
        className="mt-4 w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
      >
        {file ? "Enviar imagem" : "Selecione um arquivo"}
      </button>
    </div>
  );
}
