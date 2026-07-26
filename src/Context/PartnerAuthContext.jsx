/* Auth context for the partner portal.

   Exposes { user, profile, loading, error, refreshProfile, logout } and a
   <RequirePartnerAuth> route guard. On every sign-in it calls the idempotent
   partnerRegisterAccount endpoint, which either returns the partner profile
   or rejects mobile-app accounts (code APP_ACCOUNT) — those are signed out
   immediately so app users can never reach the portal. */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebaseClient";
import { registerPartnerAccount } from "../utils/partnerAccount";
import { syncTierFromProfile } from "../utils/subscription";

const PartnerAuthContext = createContext(null);

export function PartnerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadSeq = useRef(0);

  const loadProfile = useCallback(async (firebaseUser) => {
    const seq = ++loadSeq.current;
    try {
      const { profile: p, isAdmin: admin } = await registerPartnerAccount();
      if (seq !== loadSeq.current) return; // superseded by a newer auth event
      setProfile(p);
      setIsAdmin(admin === true);
      syncTierFromProfile(p);
      setError(null);
    } catch (err) {
      if (seq !== loadSeq.current) return;
      if (err.code === "APP_ACCOUNT") {
        await signOut(auth);
        setProfile(null);
        setIsAdmin(false);
        syncTierFromProfile(null);
        setError(err.message);
      } else {
        setProfile(null);
        setIsAdmin(false);
        syncTierFromProfile(null);
        setError(err.message || "Could not load your partner profile.");
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(true);
        await loadProfile(firebaseUser);
      } else {
        loadSeq.current++;
        setProfile(null);
        setIsAdmin(false);
        syncTierFromProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) await loadProfile(auth.currentUser);
  }, [loadProfile]);

  const logout = useCallback(() => signOut(auth), []);

  const value = { user, profile, isAdmin, loading, error, refreshProfile, logout };
  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) throw new Error("usePartnerAuth must be used inside PartnerAuthProvider");
  return ctx;
}

/* Route guard for /partners/* portal pages: unauthenticated visitors are sent
   to the login page (remembering where they came from). */
export function RequirePartnerAuth({ children }) {
  const { user, loading } = usePartnerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F6]">
        <div className="w-10 h-10 border-4 border-[#FF4040]/20 border-t-[#FF4040] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/partners/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
