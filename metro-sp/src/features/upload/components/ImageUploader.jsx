"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/shared/context/AuthContext";

export default function ImageUploader() {
  const { user } = useAuth();

  const [file, setFile] = useState(null);        // imagem
  const [ifcFile, setIfcFile] = useState(null);  // IFC
  const [preview, setPreview] = useState(null);

  const [colunaId, setColunaId] = useState("");
  const [localObra, setLocalObra] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // ============ handlers ============
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

  const handleIfcChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.toLowerCase().endsWith(".ifc")) {
      setIfcFile(selected);
      setError("");
    } else {
      setError("Por favor, selecione um arquivo IFC válido (.ifc).");
    }
  };

  // ============ fluxo principal ============
  const handleUpload = async () => {
    if (!file) {
      setError("Selecione uma imagem antes de enviar.");
      return;
    }
    if (!ifcFile) {
      setError("Selecione um arquivo IFC antes de enviar.");
      return;
    }
    if (!user) {
      setError("Você precisa estar logado para enviar arquivos.");
      return;
    }

    setError("");
    setSuccess("");
    setLoadingAnalysis(true);

    try {
      console.log("[UPLOAD] Iniciando fluxo...");

      // 1) Envio para o backend FastAPI
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("ifc_file", ifcFile);
      formData.append("coluna_id", colunaId);
      formData.append("local", localObra);

      console.log("[UPLOAD] Enviando para FastAPI /analisar-coluna-ifc ...");

      const response = await fetch("http://127.0.0.1:8000/analisar-coluna-ifc", {
        method: "POST",
        body: formData,
      });

      console.log("[UPLOAD] Status da API:", response.status);

      if (!response.ok) {
        const txt = await response.text();
        console.error("[UPLOAD] Erro FastAPI:", txt);
        setError("Erro ao analisar no backend. Veja o console.");
        setLoadingAnalysis(false);
        return;
      }

      const relatorio = await response.json();
      console.log("[UPLOAD] Relatório recebido:", relatorio);

      // pega URL da imagem gerada/salva pelo backend
      const imageUrl =
        relatorio.image_url ||
        relatorio.caminho_arquivo_imagem ||
        ""; // fallback simples

      if (!imageUrl) {
        console.warn(
          "[UPLOAD] Backend não retornou image_url, a galeria pode não exibir a imagem."
        );
      }

      // 2) Salvar na coleção uploads (usada pela Galeria)
      await addDoc(collection(db, "uploads"), {
        userId: user.uid,
        url: imageUrl,
        fileName: file.name,
        createdAt: serverTimestamp(),
      });

      // 3) Salvar relatório completo na coleção reports
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        imageUrl,
        fileName: file.name,
        colunaId,
        localObra,
        relatorioCompleto: relatorio,
        createdAt: serverTimestamp(),
      });

      setSuccess("✅ Análise concluída e relatório registrado com sucesso!");

      // reset
      setFile(null);
      setIfcFile(null);
      setPreview(null);
      setColunaId("");
      setLocalObra("");
    } catch (err) {
      console.error("[UPLOAD] Erro geral:", err);
      setError("Erro inesperado. Veja o console.");
    } finally {
      setLoadingAnalysis(false);
      console.log("[UPLOAD] Finalizado.");
    }
  };

  // ============ JSX ============
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-md text-white">
      <h2 className="text-xl font-semibold mb-4">📤 Enviar imagem + IFC</h2>

      {/* Imagem */}
      <label className="block text-sm mb-1">Imagem:</label>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 rounded-lg shadow-md object-contain"
          />
        </div>
      )}

      {/* IFC */}
      <label className="block text-sm mb-1">Arquivo IFC:</label>
      <input type="file" accept=".ifc" onChange={handleIfcChange} className="mb-4" />

      {/* Campos extras */}
      <label className="block mb-1">Identificador da coluna:</label>
      <input
        type="text"
        value={colunaId}
        onChange={(e) => setColunaId(e.target.value)}
        placeholder="Ex: C-01"
        className="w-full mb-3 p-2 rounded bg-gray-900 border border-gray-600"
      />

      <label className="block mb-1">Local da obra:</label>
      <input
        type="text"
        value={localObra}
        onChange={(e) => setLocalObra(e.target.value)}
        placeholder="Ex: Plataforma Leste"
        className="w-full mb-4 p-2 rounded bg-gray-900 border border-gray-600"
      />

      {/* Mensagens */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}
      {loadingAnalysis && <p className="text-blue-300 text-sm">🔍 Processando...</p>}

      {/* Botão */}
      <button
        onClick={handleUpload}
        disabled={!file || !ifcFile || !user || loadingAnalysis}
        className="mt-4 w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
      >
        {loadingAnalysis ? "Processando..." : "Enviar para análise"}
      </button>
    </div>
  );
}
