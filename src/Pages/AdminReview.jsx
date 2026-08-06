/* Staff review console — /partners/admin.
   Three queues: pending business verifications, pending listings and pending
   promotions. Only rendered for admins (and every action re-checks the role
   server-side). */

import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldCheck, Store, Megaphone, RefreshCw, Check, X, ArrowLeft, ChevronDown, ChevronUp, ImageOff, MapPin, Clock, Tag, Phone, Mail, Globe, Ticket } from "lucide-react";
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
  if (!iso) return "—";
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

/* Thumbnail that degrades to a placeholder if the URL fails to load (e.g. a
   stale Storage URL) instead of showing a broken-image icon. */
function SafeThumb({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center bg-[#1C1114]/5 text-[#1C1114]/30 ${className || ""}`} title="Image unavailable">
        <ImageOff size={18} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
}

/* One pending listing in the staff queue — collapsed to a summary row, expands
   to full detail (photos, location, hours, pricing, contact, booking) so staff
   can review everything before approve/deny. */
function PendingListingCard({ l, busyId, act }) {
  const [open, setOpen] = useState(false);
  const busy = busyId === l.id;
  const images = Array.isArray(l.images) ? l.images : [];
  return (
    <div className="bg-white border border-[#1C1114]/10 rounded-2xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#1C1114]">{l.name}</p>
          <p className="text-sm text-[#1C1114]/50">
            {l.category} · {l.city}, {l.country} · submitted {fmtDate(l.submittedAt)}
          </p>
          {l.description && (
            <p className={`text-sm text-[#1C1114]/50 mt-2 ${open ? "" : "line-clamp-3"}`}>{l.description}</p>
          )}
          <button
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#1C1114]/70 hover:text-[#1C1114]"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {open ? "Hide details" : `View details${images.length ? ` · ${images.length} photo${images.length === 1 ? "" : "s"}` : ""}`}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-full bg-[#178A5E] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            onClick={() => act(l.id, () => reviewListing(l.id, "active"))}
            disabled={busy}
          >
            <Check size={14} /> Approve
          </button>
          <DenyControl
            busy={busy}
            onDeny={(reason) => act(l.id, () => reviewListing(l.id, "denied", reason))}
          />
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-[#1C1114]/10 pt-4">
          {/* Photos */}
          <p className="text-xs uppercase tracking-wide text-[#9BA1A6] mb-2">Photos</p>
          {images.length === 0 ? (
            <p className="text-sm text-[#1C1114]/40 mb-4">No photos submitted.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {images.map((url, i) => (
                <SafeThumb key={i} src={url} alt={`${l.name} photo ${i + 1}`} className="h-24 w-24 rounded-xl object-cover border border-[#1C1114]/10" />
              ))}
            </div>
          )}

          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <Detail icon={MapPin} k="Address" v={[l.address, l.postcode, l.city, l.country].filter(Boolean).join(", ")} />
            <Detail icon={Tag} k="Price range" v={l.priceRange} />
            <Detail icon={Tag} k="Avg booking value" v={l.avgBookingValue ? `£${l.avgBookingValue} pp` : null} />
            <Detail icon={Phone} k="Phone" v={l.phone} />
            <Detail icon={Mail} k="Email" v={l.email} />
            <Detail icon={Globe} k="Website" v={l.website} />
            <Detail icon={Ticket} k="Booking" v={l.bookingPlatform ? `${l.bookingPlatform}${l.bookingUrl ? ` · ${l.bookingUrl}` : ""}` : null} />
            <Detail icon={Clock} k="Occasions" v={(l.occasions || []).join(", ")} />
          </dl>

          {Array.isArray(l.hours) && l.hours.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-[#9BA1A6] mb-1">Opening hours</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-sm sm:grid-cols-3">
                {l.hours.map((h, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[#1C1114]/60">{h.day}</span>
                    <span className="text-[#1C1114]">{h.closed ? "Closed" : `${h.open}–${h.close}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, k, v }) {
  if (!v) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-[#9BA1A6] mt-0.5 shrink-0" />
      <div className="min-w-0">
        <dt className="text-[#9BA1A6] text-xs uppercase tracking-wide">{k}</dt>
        <dd className="text-[#1C1114] break-words">{v}</dd>
      </div>
    </div>
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
        <p className="text-sm text-[#1C1114]/50">Loading…</p>
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
          empty="No verifications waiting — all caught up."
          items={verifications}
          loading={loading}
          renderItem={(v) => (
            <div key={v.uid} className="bg-white border border-[#1C1114]/10 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1C1114]">{v.data?.businessName || v.businessName || "—"}</p>
                  <p className="text-sm text-[#1C1114]/50">{v.email} · submitted {fmtDate(v.submittedAt)}</p>
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
                      <dd className="text-[#1C1114] break-words">{val || "—"}</dd>
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
          empty="No listings waiting — all caught up."
          items={listings}
          loading={loading}
          renderItem={(l) => (
            <PendingListingCard key={l.id} l={l} busyId={busyId} act={act} />
          )}
        />

        <QueueSection
          icon={Megaphone}
          title="Promotions awaiting approval"
          empty="No promotions waiting — all caught up."
          items={promotions}
          loading={loading}
          renderItem={(p) => (
            <div key={p.id} className="bg-white border border-[#1C1114]/10 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1C1114]">{p.title || "Untitled promotion"}</p>
                  <p className="text-sm text-[#1C1114]/50">
                    {p.listingName} · {p.offerType === "percentage" ? `${p.discountValue}% off`
                      : p.offerType === "fixed" ? `£${p.discountValue} off`
                      : p.discountValue} · submitted {fmtDate(p.submittedAt)}
                  </p>
                  <p className="text-sm text-[#1C1114]/50 mt-1">
                    {p.discountCode ? `Code ${p.discountCode} · ` : ""}
                    {p.validityType === "always" ? "Always on" : "Custom validity"}
                    {(p.applicableOccasions ?? []).length > 0
                      ? ` · ${p.applicableOccasions.join(", ")}`
                      : " · All bookings"}
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
