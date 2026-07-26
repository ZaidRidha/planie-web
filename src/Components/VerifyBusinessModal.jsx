/* "Verify Business" form â€” submits to partnerSubmitVerification, which moves
   the account to `pending` for staff review (24â€“48h). Email verification has
   already happened during account creation (RequireVerifiedEmail gate). */

import { useState } from "react";
import { X } from "lucide-react";
import { submitBusinessVerification } from "../utils/partnerAccount";
import { usePartnerAuth } from "../Context/PartnerAuthContext";

const FIELDS = [
  { name: "businessName", label: "Business name", placeholder: "Sunset Rooftop Bar" },
  { name: "registrationNumber", label: "Business registration no. (CVR / VAT / equivalent)", placeholder: "DK12345678" },
  { name: "country", label: "Country", placeholder: "Denmark" },
  { name: "address", label: "Business address", placeholder: "Street, city, postal code" },
  { name: "websiteOrInstagram", label: "Website or Instagram", placeholder: "https://â€¦" },
  { name: "contactName", label: "Contact person", placeholder: "Full name" },
  { name: "contactEmail", label: "Contact email", placeholder: "owner@business.com", type: "email" },
];

export default function VerifyBusinessModal({ onClose }) {
  const { refreshProfile } = usePartnerAuth();
  const [values, setValues] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.name, ""]))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const setField = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await submitBusinessVerification(values);
      await refreshProfile();
      setDone(true);
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl text-[#1C1114]" style={{ fontFamily: "'Gabarito', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}>Verify your business</h2>
          <button onClick={onClose} className="p-1 text-[#687076] hover:text-[#1C1114]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center">
            <p className="text-[#1C1114] font-medium mb-2">Submitted for review âœ“</p>
            <p className="text-sm text-[#687076] mb-6">
              Our team reviews new businesses within 24â€“48 hours. You'll unlock
              listings, promotions and campaigns once you're approved.
            </p>
            <button className="pd-btn pd-btn--fill mx-auto" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#687076] mb-5">
              Verification unlocks listings, promotions and campaigns. Review
              usually takes 24â€“48 hours.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {FIELDS.map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-[#1C1114] mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    required
                    value={values[f.name]}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.name, e.target.value)}
                    disabled={busy}
                    className="w-full rounded-xl border border-[#E6E8EB] px-3.5 py-2.5 text-sm text-[#1C1114] outline-none focus:border-[#FF4040] focus:ring-2 focus:ring-[#FF4040]/15"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#1C1114] py-3 text-sm font-semibold text-white hover:bg-[#e63636] disabled:opacity-60"
              >
                {busy ? "Submittingâ€¦" : "Submit for review"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
