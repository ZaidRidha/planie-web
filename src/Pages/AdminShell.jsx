/* Staff admin dashboard shell — /admin and /admin/waitlist.
   Owns sign-in, the isAdmin gate, and the one waitlist data load that both
   tabs read from (Home summarizes it, Waitlist tab lists/acts on it) — so
   switching tabs never re-fetches.

   Deliberately standalone: it carries its own Firebase sign-in and sits
   OUTSIDE PartnerAuthProvider (see App.js). Admins are ordinary app accounts
   flagged users/{uid}.isAdmin, and the partner provider signs those out on
   sight — sharing it would log every admin straight back out. */

import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LayoutDashboard, ListChecks, LogOut } from "lucide-react";
import { auth } from "../utils/firebaseClient";
import { listWaitlist } from "../utils/waitlistAdminApi";
import AdminSignIn from "./AdminAuth";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

const PAGE_LIMIT = 1000;

const TABS = [
  { to: "/admin", end: true, label: "Home", icon: LayoutDashboard },
  { to: "/admin/waitlist", end: false, label: "Waitlist", icon: ListChecks },
];

// Consumed by AdminHome / AdminWaitlist via useOutletContext() instead of
// props — the router renders them through <Outlet />, which only forwards
// context, not arbitrary props.
export function useAdminData() {
  return useOutletContext();
}

export default function AdminShell() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [denied, setDenied] = useState(null); // { uid, label } of a rejected account

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      // NOT clearing `denied` here: the 403 path signs the user out, which
      // fires this listener — resetting it would wipe the explanation before
      // the sign-in screen could render it. It is cleared on the next
      // successful load instead.
      if (!u) setData(null);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listWaitlist(PAGE_LIMIT));
      setDenied(null);
    } catch (err) {
      // A non-admin gets the sign-in screen back with an explanation rather
      // than an empty panel that looks broken.
      if (err.status === 403) {
        // Captured BEFORE signOut, which clears auth.currentUser.
        const u = auth.currentUser;
        setDenied({
          uid: u?.uid ?? "unknown",
          label: u?.email || u?.phoneNumber || u?.uid || "this account",
        });
        await signOut(auth);
      } else {
        setError(err.message || "Could not load the waitlist.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F1]">
        <div className="w-10 h-10 border-4 border-[#FF4040]/20 border-t-[#FF4040] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AdminSignIn denied={denied} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={PlanieLogo} alt="Planie" className="h-8 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[#1C1114]" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
                Admin
              </h1>
              <p className="text-sm text-[#1C1114]/50">{user.email}</p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1.5 text-sm text-[#1C1114]/50 hover:text-[#1C1114]"
            onClick={() => signOut(auth)}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <nav className="flex flex-wrap items-center gap-2 mb-8">
          {TABS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold border ${
                  isActive
                    ? "bg-[#1C1114] text-white border-[#1C1114]"
                    : "bg-white text-[#1C1114] border-[#1C1114]/15 hover:bg-[#FAFAFA]"
                }`
              }
            >
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <Outlet context={{ data, setData, loading, error, reload: load }} />
      </div>
    </div>
  );
}
