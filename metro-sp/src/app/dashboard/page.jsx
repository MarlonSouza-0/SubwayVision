"use client";

import DashboardComponent from "@/features/dashboard/components/DashboardComponent";
import useAuthUser from "@/shared/hooks/useAuthUser";

export default function DashboardPage() {
  const { user, loading } = useAuthUser("/"); // se não logado, manda para "/"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-lg">Carregando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-lg">Redirecionando para login...</p>
      </div>
    );
  }

  return <DashboardComponent />;
}
