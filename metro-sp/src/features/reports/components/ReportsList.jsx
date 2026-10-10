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
import { Trash } from "lucide-react";

export default function ReportsList() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setReports(list);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteReport = async (id) => {
    const ok = window.confirm("Tem certeza que deseja excluir este relatório?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "reports", id));
    } catch (err) {
      console.error("Erro ao excluir relatório:", err);
      alert("Erro ao excluir relatório. Veja o console.");
    }
  };

  if (reports.length === 0) {
    return <p className="text-gray-400">Nenhum relatório gerado ainda.</p>;
  }

  return (
    <div className="space-y-4">
      {reports.map((r) => {
        const status = r.relatorioCompleto?.status;
        const mensagem = r.relatorioCompleto?.mensagem;

        let statusColor = "bg-gray-600";
        if (status === "OK") statusColor = "bg-green-600";
        if (status && status.startsWith("ALERTA")) statusColor = "bg-yellow-600";
        if (status === "IFC_INVALIDO") statusColor = "bg-red-600";

        return (
          <div
            key={r.id}
            className="bg-gray-900 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4"
          >
            {r.imageUrl && (
              <div className="w-full md:w-1/3">
                <img
                  src={r.imageUrl}
                  alt={r.fileName}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${statusColor}`}
                  >
                    {status || "Sem status"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {r.createdAt?.seconds
                      ? new Date(
                          r.createdAt.seconds * 1000
                        ).toLocaleString("pt-BR")
                      : "Data não disponível"}
                  </span>
                </div>

                {/* Botão excluir relatório */}
                <button
                  onClick={() => handleDeleteReport(r.id)}
                  className="bg-red-700 hover:bg-red-800 text-white p-1 rounded-full"
                  title="Excluir relatório"
                >
                  <Trash size={16} />
                </button>
              </div>

              <p className="text-sm text-gray-200 mb-2">
                <strong>Mensagem:</strong> {mensagem || "—"}
              </p>

              <p className="text-sm text-gray-300">
                <strong>Coluna:</strong> {r.colunaId || "—"} <br />
                <strong>Local:</strong> {r.localObra || "—"}
              </p>

              {r.relatorioCompleto?.ifc && (
                <p className="text-xs text-gray-400 mt-2">
                  <strong>IFC:</strong>{" "}
                  {r.relatorioCompleto.ifc?.arquivo ||
                    (r.relatorioCompleto.ifc?.total_colunas_ifc !== undefined
                      ? `${r.relatorioCompleto.ifc.total_colunas_ifc} colunas no modelo`
                      : "Informação não disponível")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
