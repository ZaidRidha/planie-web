/* /admin — dashboard home. Summarizes the same waitlist data the Waitlist
   tab lists in full, so this reads as "the headline numbers", not a second
   source of truth. Built as a card grid on purpose: the next admin surface
   (partner review counts, discovery spend, whatever needs a home next) adds
   another card here rather than a new page. */

import { Link } from "react-router-dom";
import { FlaskConical, Mail, Store, Users, UserX } from "lucide-react";
import { useAdminData } from "./AdminShell";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
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

export default function AdminHome() {
  const { data, loading } = useAdminData();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#FF4040]/20 border-t-[#FF4040] rounded-full animate-spin" />
      </div>
    );
  }

  const consumer = data?.consumer ?? [];
  const business = data?.business ?? [];
  const all = [...consumer, ...business];

  const consumerTotal = data?.counts?.consumer ?? consumer.length;
  const businessTotal = data?.counts?.business ?? business.length;
  const betaTesters = all.filter((r) => r.betaTester);
  const invited = betaTesters.filter((r) => r.betaInviteSentAt);
  const unsubscribed = all.filter((r) => r.unsubscribed);

  const lastInvite = invited
    .slice()
    .sort((a, b) => new Date(b.betaInviteSentAt) - new Date(a.betaInviteSentAt))[0];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={Users}
          label="People"
          value={consumerTotal.toLocaleString()}
          sub={`${businessTotal.toLocaleString()} businesses`}
        />
        <Stat
          icon={FlaskConical}
          label="Beta testers"
          value={betaTesters.length.toLocaleString()}
          sub={`${invited.length.toLocaleString()} sent a TestFlight invite`}
          accent
        />
        <Stat
          icon={Mail}
          label="Last invite sent"
          value={lastInvite ? fmtDate(lastInvite.betaInviteSentAt).split(",")[0] : "—"}
          sub={lastInvite ? lastInvite.email : "No invites sent yet"}
        />
        <Stat
          icon={UserX}
          label="Unsubscribed"
          value={unsubscribed.length.toLocaleString()}
          sub="Excluded from every send"
        />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          to="/admin/waitlist"
          className="flex-1 inline-flex items-center gap-3 rounded-2xl border border-[#1C1114]/10 bg-white px-5 py-4 hover:bg-[#FAFAFA]"
        >
          <div className="w-10 h-10 rounded-full bg-[#FF4040]/10 flex items-center justify-center shrink-0">
            <Users size={16} className="text-[#FF4040]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C1114]">Manage the waitlist</p>
            <p className="text-xs text-[#1C1114]/50">Search, flag beta testers, send invites.</p>
          </div>
        </Link>
        <Link
          to="/admin/waitlist"
          className="flex-1 inline-flex items-center gap-3 rounded-2xl border border-[#1C1114]/10 bg-white px-5 py-4 hover:bg-[#FAFAFA]"
        >
          <div className="w-10 h-10 rounded-full bg-[#1C1114]/8 flex items-center justify-center shrink-0">
            <Store size={16} className="text-[#1C1114]/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C1114]">Business signups</p>
            <p className="text-xs text-[#1C1114]/50">{businessTotal.toLocaleString()} venues on the waitlist.</p>
          </div>
        </Link>
      </div>

      {/* Placeholder for the next thing this dashboard should summarize —
          partner review queues, discovery spend, whatever gets wired in next.
          Kept visible rather than hidden so it reads as "more is coming"
          instead of the page looking finished as-is. */}
      <div className="mt-8 rounded-2xl border border-dashed border-[#1C1114]/15 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-[#1C1114]/60">More summaries land here</p>
        <p className="mt-1 text-xs text-[#1C1114]/40">
          Partner reviews, discovery spend, and other admin surfaces can each get a card once they're wired in.
        </p>
      </div>
    </div>
  );
}
