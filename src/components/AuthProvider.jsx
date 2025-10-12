// src/components/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, listenAuth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * We read role from Firestore: users/{uid}.user_role
 * user_role values: "admin" | "editor" | "viewer" (your choice)
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null); // e.g., { user_role: "admin", email, displayName }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenAuth(async (u) => {
      setUser(u);

      if (u) {
        try {
          const userRef = doc(db, "users", u.uid);
          const snap = await getDoc(userRef);

          // Auto-bootstrap a basic user doc if missing (viewer by default)
          if (!snap.exists()) {
            await setDoc(userRef, {
              email: u.email || "",
              displayName: u.displayName || "",
              user_role: "viewer",
              created_at: Date.now(),
            });
            const fresh = await getDoc(userRef);
            setClaims(fresh.exists() ? fresh.data() : null);
          } else {
            setClaims(snap.data());
          }
        } catch (e) {
          // If rules block reads temporarily, just continue as no-claims
          console.warn("users read/bootstrap failed:", e?.message || e);
          setClaims(null);
        }
      } else {
        setClaims(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const api = {
    user,
    claims,
    isAuthenticated: !!user,
    isLoading: loading,

    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },

    async signUp(email, password) {
      await createUserWithEmailAndPassword(auth, email, password);
      // After signUp, the listener above will bootstrap users/{uid}
    },

    async signOut() {
      await signOut(auth);
    },
  };

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
