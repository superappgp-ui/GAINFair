// src/components/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, listenAuth, db } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsub = listenAuth(async (fbUser) => {
    if (!fbUser) {            // <-- nothing to read if not signed in
      setUser(null);
      setClaims(null);
      setLoading(false);
      return;
    }
    try {
      const uref = doc(db, "users", fbUser.uid);
      const snap = await getDoc(uref).catch(() => null);
      setUser(fbUser);
      setClaims(snap?.data() || { user_role: "user" });
    } finally {
      setLoading(false);
    }
  });
  return () => unsub();
}, []);

  const api = {
    user, claims,
    isAuthenticated: !!user,
    isLoading: loading,
    async signIn(email, password) { await signInWithEmailAndPassword(auth, email, password); },
    async signUp(email, password) { await createUserWithEmailAndPassword(auth, email, password); },
    async signOut() { await signOut(auth); }
  };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
