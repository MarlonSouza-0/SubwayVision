"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";

export default function useAuthUser(redirectTo = "/") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // ⛔ só decide depois do carregamento
    if (!user) {
      router.replace(redirectTo);
    }
  }, [loading, user, redirectTo, router]);

  return { user, loading };
}
