/* Shows the partner's business-verification state at the top of the portal.
   unverified → prompt to verify; pending → under review; denied → reason +
   resubmit. Renders nothing when verified (or while profile is loading). */

import { useState } from "react";
import { ShieldCheck, Clock, ShieldX } from "lucide-react";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import VerifyBusinessModal from "./VerifyBusinessModal";

export default function VerificationBanner() {
  const { profile } = usePartnerAuth();
  const [open, setOpen] = useState(false);

  const status = profile?.verification?.status;
  if (!status || status === "verified") return null;

  const styles = {
    unverified: "border-amber-200 bg-amber-50 text-amber-900",
    pending: "border-sky-200 bg-sky-50 text-sky-900",
    denied: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <>
      <div className={`mb-5 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${styles[status]}`}>
        {status === "unverified" && (
          <>
            <ShieldCheck size={18} className="shrink-0" />
            <span className="flex-1 min-w-[200px]">
              <b>Verify your business</b> to unlock listings, promotions and campaigns.
            </span>
            <button
              className="rounded-lg bg-amber-500 px-3.5 py-1.5 font-semibold text-white hover:bg-amber-600"
              onClick={() => setOpen(true)}
            >
              Verify business
            </button>
          </>
        )}
        {status === "pending" && (
          <>
            <Clock size={18} className="shrink-0" />
            <span className="flex-1">
              <b>Verification under review.</b> Our team usually responds within 24–48 hours.
            </span>
          </>
        )}
        {status === "denied" && (
          <>
            <ShieldX size={18} className="shrink-0" />
            <span className="flex-1 min-w-[200px]">
              <b>Verification denied.</b>{" "}
              {profile?.verification?.denialReason || "Please review your details and resubmit."}
            </span>
            <button
              className="rounded-lg bg-red-500 px-3.5 py-1.5 font-semibold text-white hover:bg-red-600"
              onClick={() => setOpen(true)}
            >
              Resubmit
            </button>
          </>
        )}
      </div>
      {open && <VerifyBusinessModal onClose={() => setOpen(false)} />}
    </>
  );
}
