// src/shared/context/AuthContext.jsx
"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase/config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("🔥 Auth state mudou:", firebaseUser);
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: (email, password) =>
        signInWithEmailAndPassword(auth, email, password),
      signOut: () => fbSignOut(auth),
      createAccount: async (name, email, password) => {
        const creds = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(creds.user, { displayName: name });
        return creds.user;
      },
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
    }),
    [user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
