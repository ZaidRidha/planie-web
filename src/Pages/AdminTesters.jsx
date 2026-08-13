/* /admin/testers — did the TestFlight invite actually turn into an app
   account? Filters the same waitlist data the Waitlist tab lists down to
   rows that were actually SENT an invite (betaInviteSentAt, not just flagged
   betaTester — flagging is a queue, sending is the thing that could convert),
   and cross-references signedUp/signedUpAt, which adminListWaitlist already
   computes server-side by matching the waitlist email against users/ and
   Firebase Auth. No new backend endpoint: this is a view over data the shell
   already loaded. */

import { useMemo, useState } from "react";
import { CheckCircle2, Circle, FlaskConical, Search, Store, Users } from "lucide-react";
import { useAdminData } from "./AdminShell";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// Whole days between two ISO timestamps, floored — "3 days" not "3.4 days".
// Negative (signed up before the invite went out, e.g. they already had an
// account from an earlier round) is left as-is rather than clamped, because
// that's a real and useful signal, not a data error.
function daysBetween(fromIso, toIso) {
  const ms = new Date(toIso) - new Date(fromIso);
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

const Stat = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-white border border-[#1C1114]/10 rounded-2xl p-5">
    <div className="flex items-center gap-2 text-[#1C1114]/50">
      <Icon size={15} className={accent ? "text-[#FF4040]" : undefined} />
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className="mt-3 text-3xl font-bold text-[#1C1114]" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
      {value}
    </p>
    {sub && <p className="mt-1 text-sm text-[#1C1114]/45">{sub}</p>}
  </div>
);

const StatusBadge = ({ signedUp }) =>
  signedUp ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-600/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-700 whitespace-nowrap">
      <CheckCircle2 size={11} /> signed up
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#1C1114]/6 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1C1114]/40 whitespace-nowrap">
      <Circle size={11} /> not yet
    </span>
  );

export default function AdminTesters() {
  const { data, loading } = useAdminData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "converted" | "pending"

  const invited = useMemo(() => {
    if (!data) return [];
    // Sent, not just flagged — betaTester can be set without a mail ever
    // going out (marked for a future round), and that's not a tester to
    // measure conversion for yet.
    const withList = (rows, list) => rows.filter((r) => r.betaInviteSentAt).map((r) => ({ ...r, list }));
    return [...withList(data.consumer, "consumer"), ...withList(data.business, "business")]
      .sort((a, b) => new Date(b.betaInviteSentAt) - new Date(a.betaInviteSentAt));
  }, [data]);

  const converted = invited.filter((r) => r.signedUp);
  const conversionRate = invited.length > 0 ? Math.round((converted.length / invited.length) * 100) : 0;

  // Median days-to-convert, for the testers who did — "how long does it take"
  // is the useful follow-up to "how many convert".
  const medianDaysToConvert = useMemo(() => {
    const days = converted
      .filter((r) => r.signedUpAt)
      .map((r) => daysBetween(r.betaInviteSentAt, r.signedUpAt))
      .sort((a, b) => a - b);
    if (days.length === 0) return null;
    const mid = Math.floor(days.length / 2);
    return days.length % 2 ? days[mid] : Math.round((days[mid - 1] + days[mid]) / 2);
  }, [converted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invited.filter((r) => {
      if (statusFilter === "converted" && !r.signedUp) return false;
      if (statusFilter === "pending" && r.signedUp) return false;
      if (!q) return true;
      return r.email.toLowerCase().includes(q) || (r.city ?? "").toLowerCase().includes(q);
    });
  }, [invited, query, statusFilter]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#FF4040]/20 border-t-[#FF4040] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat icon={FlaskConical} label="Invited" value={invited.length.toLocaleString()} sub="Sent a TestFlight link" accent />
        <Stat
          icon={CheckCircle2}
          label="Converted"
          value={`${conversionRate}%`}
          sub={`${converted.length.toLocaleString()} of ${invited.length.toLocaleString()} created an account`}
        />
        <Stat
          icon={Circle}
          label="Median time to convert"
          value={medianDaysToConvert === null ? "—" : `${medianDaysToConvert}d`}
          sub={medianDaysToConvert === null ? "No conversions yet" : "Invite sent → account created"}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1C1114]/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, city…"
            aria-label="Search testers"
            className="w-full rounded-full border border-[#1C1114]/15 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF4040]/25"
          />
        </div>
        <div className="inline-flex rounded-full border border-[#1C1114]/15 bg-white p-0.5">
          {[
            { key: "all", label: "All" },
            { key: "converted", label: "Converted" },
            { key: "pending", label: "Not yet" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              aria-pressed={statusFilter === key}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                statusFilter === key ? "bg-[#1C1114] text-white" : "text-[#1C1114]/60 hover:text-[#1C1114]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[#1C1114]/50 bg-white border border-[#1C1114]/10 rounded-2xl px-4 py-10 text-center">
          {invited.length === 0
            ? "No TestFlight invites sent yet — send one from the Waitlist tab."
            : "Nothing matches that search."}
        </p>
      ) : (
        <div className="bg-white border border-[#1C1114]/10 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-[#1C1114]/10">
                <th className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Email</th>
                <th className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">List</th>
                <th className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Invited</th>
                <th className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Status</th>
                <th className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Signed up</th>
                <th className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Time to convert</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.list}-${r.id}`} className="border-b border-[#1C1114]/5 last:border-0">
                  <td className="px-4 py-3 text-[#1C1114] align-top">{r.email}</td>
                  <td className="px-4 py-3 align-top text-[#1C1114]/60">
                    <span className="inline-flex items-center gap-1">
                      {r.list === "consumer" ? <Users size={12} /> : <Store size={12} />}
                      {r.list === "consumer" ? "Person" : "Business"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#1C1114]/70 align-top whitespace-nowrap">{fmtDate(r.betaInviteSentAt)}</td>
                  <td className="px-4 py-3 align-top"><StatusBadge signedUp={r.signedUp} /></td>
                  <td className="px-4 py-3 text-[#1C1114]/70 align-top whitespace-nowrap">
                    {r.signedUp ? fmtDate(r.signedUpAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#1C1114]/70 align-top whitespace-nowrap">
                    {r.signedUp && r.signedUpAt
                      ? `${daysBetween(r.betaInviteSentAt, r.signedUpAt)}d`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
