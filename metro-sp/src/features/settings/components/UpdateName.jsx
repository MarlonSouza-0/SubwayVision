"use client";
import { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function UpdateName() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("❌ O nome não pode estar vazio.");
      return;
    }

    try {
      // Atualiza no Firebase Auth
      await updateProfile(user, { displayName: name });
      await user.reload();

      // Sincroniza também no Firestore (coleção users)
      await setDoc(
        doc(db, "users", user.uid),
        { name },
        { merge: true } // só atualiza o campo name
      );

      setMessage("✅ Nome atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao atualizar nome.");
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg text-white">
      <h3 className="text-lg font-semibold mb-2">Atualizar nome</h3>
      <input
        type="text"
        className="p-2 rounded bg-gray-800 w-full mb-2 text-white placeholder-gray-400"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Digite seu nome completo"
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
      >
        Salvar
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
