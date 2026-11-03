/**
 * Authentication state for the whole app.
 *   - AuthProvider: listens to Firebase Auth for the signed-in user, then live-
 *     subscribes to that user's profile document (users/{uid}: role, displayName,
 *     alertPrefs...). `loading` stays true until both are known.
 *   - useAuth(): returns { user, profile, loading, login(email, password), logout() }.
 *     Throws if used outside AuthProvider.
 * `profile.role` ("lead" | "student") drives routing and what each screen shows.
 *
 * Appears in the following files:
 *   - AuthProvider: main.jsx
 *   - useAuth: App.jsx, components/layout/AppLayout.jsx, features/auth/Login.jsx,
 *       features/boards/LeadDashboard.jsx, features/boards/StudentDashboard.jsx,
 *       features/projects/ProjectsList.jsx, features/settings/Settings.jsx
 *   - Local helpers (only used in this file): AuthContext
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsubProfile;
  }, [user]);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
