"use client";
import { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

export default function UpdatePassword() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showReauth, setShowReauth] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("❌ Preencha os dois campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("❌ As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("❌ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await updatePassword(user, newPassword);
      setMessage("✅ Senha atualizada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setMessage("⚠️ Você precisa confirmar sua senha atual.");
        setShowReauth(true); // abre modal de reautenticação
      } else {
        setMessage("Erro ao atualizar senha.");
      }
    }
  };

  const handleReauth = async () => {
    if (!currentPassword) {
      setMessage("Digite sua senha atual.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // agora tenta novamente atualizar a senha
      await updatePassword(user, newPassword);
      setMessage("✅ Senha atualizada com sucesso após reautenticação!");
      setShowReauth(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Erro na reautenticação. Verifique a senha atual.");
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg text-white mt-6">
      <h3 className="text-lg font-semibold mb-2">Alterar senha</h3>

      <input
        type="password"
        className="p-2 rounded bg-gray-800 w-full mb-2 text-white placeholder-gray-400"
        placeholder="Nova senha"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        className="p-2 rounded bg-gray-800 w-full mb-2 text-white placeholder-gray-400"
        placeholder="Confirmar nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
      >
        Salvar
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}

      {/* Modal de reautenticação */}
      {showReauth && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              Confirme sua senha atual
            </h3>
            <input
              type="password"
              className="p-2 rounded bg-gray-700 w-full mb-4 text-white placeholder-gray-400"
              placeholder="Senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReauth(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleReauth}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
