/* Staff review console â€” /partners/admin.
   Three queues: pending business verifications, pending listings and pending
   promotions. Only rendered for admins (and every action re-checks the role
   server-side). */

import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, Store, Megaphone, RefreshCw, Check, X, ArrowLeft } from "lucide-react";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import {
  listPendingVerifications,
  reviewVerification,
  listPendingListings,
  reviewListing,
  listPendingPromotions,
  reviewPromotion,
} from "../utils/adminApi";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

function fmtDate(iso) {
  if (!iso) return "â€”";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

/* Deny flow: first click arms an inline reason input, second click submits. */
function DenyControl({ onDeny, busy }) {
  const [armed, setArmed] = useState(false);
  const [reason, setReason] = useState("");
  if (!armed) {
    return (
      <button
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        onClick={() => setArmed(true)}
        disabled={busy}
      >
        <X size={14} /> Deny
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <input
        autoFocus
        className="rounded-lg border border-red-300 px-2.5 py-1.5 text-sm w-52 outline-none focus:ring-2 focus:ring-red-200"
        placeholder="Reason (shown to partner)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        disabled={busy}
      />
      <button
        className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        onClick={() => reason.trim() && onDeny(reason.trim())}
        disabled={busy || !reason.trim()}
      >
        Confirm
      </button>
      <button className="text-sm text-[#1C1114]/50" onClick={() => setArmed(false)} disabled={busy}>
        Cancel
      </button>
    </span>
  );
}

function QueueSection({ icon: Icon, title, empty, items, loading, renderItem }) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1C1114] mb-4">
        <Icon size={19} className="text-[#FF4040]" />
        {title}
        <span className="text-sm font-normal text-[#1C1114]/50">({items.length})</span>
      </h2>
      {loading ? (
        <p className="text-sm text-[#1C1114]/50">Loadingâ€¦</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#1C1114]/50 bg-white border border-[#1C1114]/10 rounded-2xl px-4 py-6 text-center">{empty}</p>
      ) : (
        <div className="space-y-3">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

export default function AdminReview() {
  const { isAdmin, loading: authLoading } = usePartnerAuth();
  const [verifications, setVerifications] = useState([]);
  const [listings, setListings] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, l, p] = await Promise.all([
        listPendingVerifications(),
        listPendingListings(),
        listPendingPromotions(),
      ]);
      setVerifications(v.items ?? []);
      setListings(l.items ?? []);
      setPromotions(p.items ?? []);
    } catch (err) {
      setError(err.message || "Could not load review queues.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (!authLoading && !isAdmin) return <Navigate to="/partners/dashboard" replace />;

  const act = async (id, fn) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={PlanieLogo} alt="Planie" className="h-8 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-[#1C1114]" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>Staff Review</h1>
              <p className="text-sm text-[#1C1114]/50">Approve or deny partner submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 bg-white px-4 py-1.5 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA]"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/partners/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#1C1114]/50 hover:text-[#1C1114]">
              <ArrowLeft size={14} /> Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <QueueSection
          icon={ShieldCheck}
          title="Business verifications"
          empty="No verifications waiting â€” all caught up."
          items={verifications}
          loading={loading}
          renderItem={(v) => (
            <div key={v.uid} className="bg-white border border-[#1C1114]/10 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1C1114]">{v.data?.businessName || v.businessName || "â€”"}</p>
                  <p className="text-sm text-[#1C1114]/50">{v.email} Â· submitted {fmtDate(v.submittedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#178A5E] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    onClick={() => act(v.uid, () => reviewVerification(v.uid, "verified"))}
                    disabled={busyId === v.uid}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <DenyControl
                    busy={busyId === v.uid}
                    onDeny={(reason) => act(v.uid, () => reviewVerification(v.uid, "denied", reason))}
                  />
                </div>
              </div>
              {v.data && (
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                  {[
                    ["Reg. no.", v.data.registrationNumber],
                    ["Country", v.data.country],
                    ["Address", v.data.address],
                    ["Web / Instagram", v.data.websiteOrInstagram],
                    ["Contact", v.data.contactName],
                    ["Contact email", v.data.contactEmail],
                  ].map(([k, val]) => (
                    <div key={k}>
                      <dt className="text-[#9BA1A6] text-xs uppercase tracking-wide">{k}</dt>
                      <dd className="text-[#1C1114] break-words">{val || "â€”"}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        />

        <QueueSection
          icon={Store}
          title="Listings awaiting approval"
          empty="No listings waiting â€” all caught up."
          items={listings}
          loading={loading}
          renderItem={(l) => (
            <div key={l.id} className="bg-white border border-[#1C1114]/10 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1C1114]">{l.name}</p>
                  <p className="text-sm text-[#1C1114]/50">
                    {l.category} Â· {l.city}, {l.country} Â· submitted {fmtDate(l.submittedAt)}
                  </p>
                  {l.description && (
                    <p className="text-sm text-[#1C1114]/50 mt-2 line-clamp-3">{l.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#178A5E] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    onClick={() => act(l.id, () => reviewListing(l.id, "active"))}
                    disabled={busyId === l.id}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <DenyControl
                    busy={busyId === l.id}
                    onDeny={(reason) => act(l.id, () => reviewListing(l.id, "denied", reason))}
                  />
                </div>
              </div>
            </div>
          )}
        />

        <QueueSection
          icon={Megaphone}
          title="Promotions awaiting approval"
          empty="No promotions waiting â€” all caught up."
          items={promotions}
          loading={loading}
          renderItem={(p) => (
            <div key={p.id} className="bg-white border border-[#1C1114]/10 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1C1114]">{p.title || "Untitled promotion"}</p>
                  <p className="text-sm text-[#1C1114]/50">
                    {p.listingName} Â· {p.offerType === "percentage" ? `${p.discountValue}% off`
                      : p.offerType === "fixed" ? `Â£${p.discountValue} off`
                      : p.discountValue} Â· submitted {fmtDate(p.submittedAt)}
                  </p>
                  <p className="text-sm text-[#1C1114]/50 mt-1">
                    {p.discountCode ? `Code ${p.discountCode} Â· ` : ""}
                    {p.validityType === "always" ? "Always on" : "Custom validity"}
                    {(p.applicableOccasions ?? []).length > 0
                      ? ` Â· ${p.applicableOccasions.join(", ")}`
                      : " Â· All bookings"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#178A5E] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    onClick={() => act(p.id, () => reviewPromotion(p.id, "active"))}
                    disabled={busyId === p.id}
                  >
                    <Check size={14} /> Approve
                  </button>
                  <DenyControl
                    busy={busyId === p.id}
                    onDeny={(reason) => act(p.id, () => reviewPromotion(p.id, "denied", reason))}
                  />
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
