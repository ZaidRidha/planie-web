/* Staff waitlist panel — /admin/waitlist, rendered inside AdminShell's tab
   outlet. Read-only view of the consumer (`waitlist`) and business
   (`businessWaitlist`) signups, with search and CSV export.

   Auth, the isAdmin gate, and the data load all live in AdminShell now
   (shared with the Home tab) — this component reads them via useAdminData()
   and only owns the table/composer state that's specific to this tab.

   The client-side admin state is presentation only. adminListWaitlist re-reads
   the isAdmin flag server-side on every request; a user who flips a local
   variable sees the same 403 either way. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2, Download, Eye, FlaskConical, Mail, Pencil, RefreshCw, Search, Send,
  Trash2, Users, Store, X,
} from "lucide-react";
import {
  deleteWaitlistRows, sendTestWaitlistEmail, sendWaitlistEmail, setBetaTesters,
} from "../utils/waitlistAdminApi";
import { applyMergeTags, buildBroadcastEmail, renderParts } from "../utils/broadcastEmailTemplate";
import { useAdminData } from "./AdminShell";

/* The default TestFlight invite link. REACT_APP_TESTFLIGHT_URL sets it without
   a code edit, and the last link actually sent is remembered below — either way
   it stays editable in the composer, because it changes per build. */
const TESTFLIGHT_URL_DEFAULT = process.env.REACT_APP_TESTFLIGHT_URL || "";
const TESTFLIGHT_URL_KEY = "planie.admin.testflightUrl";

const readTestFlightUrl = () => {
  try {
    return localStorage.getItem(TESTFLIGHT_URL_KEY) || TESTFLIGHT_URL_DEFAULT;
  } catch {
    return TESTFLIGHT_URL_DEFAULT; // private mode / storage disabled
  }
};
const rememberTestFlightUrl = (url) => {
  try { localStorage.setItem(TESTFLIGHT_URL_KEY, url); } catch { /* not worth failing a send over */ }
};

/* The last address a test email went to. Remembered because checking a
   template is never one send — you fix the spacing, deploy, and send it to the
   same mailbox again. Falls back to the signed-in admin's own address. */
const TEST_EMAIL_TO_KEY = "planie.admin.testEmailTo";

const readTestEmailTo = (fallback) => {
  try {
    return localStorage.getItem(TEST_EMAIL_TO_KEY) || fallback || "";
  } catch {
    return fallback || ""; // private mode / storage disabled
  }
};
const rememberTestEmailTo = (address) => {
  try { localStorage.setItem(TEST_EMAIL_TO_KEY, address); } catch { /* not worth failing a send over */ }
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/* RFC 4180 quoting. A leading =, +, - or @ is prefixed with a single quote:
   spreadsheets treat those as formulas, and a "city" of =HYPERLINK(...) would
   execute when a colleague opens the export. */
function csvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, columns, rows) {
  const body = [
    columns.map((c) => csvCell(c.label)).join(","),
    ...rows.map((r) => columns.map((c) => csvCell(c.get(r))).join(",")),
  ].join("\r\n");
  // BOM so Excel reads it as UTF-8 rather than the local codepage.
  const url = URL.createObjectURL(new Blob([`﻿${body}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* Unsubscribed rows stay visible — they're still signups and still count —
   but they're marked, and the backend refuses to mail them regardless of what
   this page thinks. */
const emailCell = (r) => (
  <span className={r.unsubscribed ? "text-[#1C1114]/40" : undefined}>
    {r.email}
    {r.unsubscribed && (
      <span className="ml-2 rounded-full bg-[#1C1114]/8 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1C1114]/50">
        unsubscribed
      </span>
    )}
  </span>
);

/* Two states in one column, because "flagged" and "actually has the link" are
   different questions and the second is the one you ask when somebody says
   they never got it. */
const BETA_COLUMN = {
  label: "Beta",
  get: (r) => (r.betaTester ? (r.betaInviteSentAt ? `invited ${r.betaInviteSentAt}` : "flagged") : ""),
  render: (r) =>
    r.betaTester ? (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-[#FF4040]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#FF4040] whitespace-nowrap"
        title={r.betaInviteSentAt ? `TestFlight invite sent ${fmtDate(r.betaInviteSentAt)}` : "Not invited yet"}
      >
        <FlaskConical size={11} /> {r.betaInviteSentAt ? "invited" : "beta"}
      </span>
    ) : (
      <span className="text-[#1C1114]/25">—</span>
    ),
};

/* "Signed up" means an actual app profile exists for this email — not that we
   invited them, and not that an auth account exists (signing into this panel
   with Google makes one of those). The backend answers it per row; the tick is
   deliberately the only loud thing in the table. */
const SIGNED_UP_COLUMN = {
  label: "Signed up",
  get: (r) => (r.signedUp ? (r.signedUpAt ? `yes ${r.signedUpAt}` : "yes") : ""),
  render: (r) =>
    r.signedUp ? (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-green-600/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-700 whitespace-nowrap"
        title={r.signedUpAt ? `Joined the app ${fmtDate(r.signedUpAt)}` : "Has a Planie account"}
      >
        <CheckCircle2 size={11} /> signed up
      </span>
    ) : (
      <span className="text-[#1C1114]/25">—</span>
    ),
};

const CONSUMER_COLUMNS = [
  { label: "Email", get: (r) => r.email, render: emailCell },
  { label: "City", get: (r) => r.city },
  { label: "Platform", get: (r) => r.platform },
  SIGNED_UP_COLUMN,
  BETA_COLUMN,
  { label: "Consent", get: (r) => (r.consent ? "yes" : "no") },
  { label: "Confirmation sent", get: (r) => (r.confirmationSent ? "yes" : "no") },
  { label: "Joined", get: (r) => r.joinedAt ?? "" },
];

const BUSINESS_COLUMNS = [
  { label: "Business", get: (r) => r.business },
  { label: "Contact", get: (r) => r.contact },
  { label: "Email", get: (r) => r.email, render: emailCell },
  { label: "City", get: (r) => r.city },
  { label: "Venue type", get: (r) => r.venueType },
  SIGNED_UP_COLUMN,
  BETA_COLUMN,
  { label: "Consent", get: (r) => (r.consent ? "yes" : "no") },
  { label: "Confirmation sent", get: (r) => (r.confirmationSent ? "yes" : "no") },
  { label: "Joined", get: (r) => r.joinedAt ?? "" },
];

// Shared with the Composer's inputs/textarea below.
const fieldClass =
  "w-full rounded-xl border border-[#1C1114]/15 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#FF4040]/25";

/* ── Table ───────────────────────────────────────────────────────────── */

function Table({ columns, rows, emptyLabel, selected, onToggle, onToggleAll }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[#1C1114]/50 bg-white border border-[#1C1114]/10 rounded-2xl px-4 py-10 text-center">
        {emptyLabel}
      </p>
    );
  }
  const allShown = rows.every((r) => selected.has(r.id));
  const someShown = !allShown && rows.some((r) => selected.has(r.id));
  return (
    // The table sets its own min width and scrolls inside this box, so a long
    // business name can never push the page itself sideways on mobile.
    <div className="bg-white border border-[#1C1114]/10 rounded-2xl overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-[#1C1114]/10">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#FF4040] cursor-pointer"
                checked={allShown}
                // Header box reflects the CURRENTLY VISIBLE rows, so with a
                // search active it selects the matches rather than the world.
                ref={(el) => { if (el) el.indeterminate = someShown; }}
                onChange={() => onToggleAll(rows, !allShown)}
                aria-label={allShown ? "Deselect all shown" : "Select all shown"}
              />
            </th>
            {columns.map((c) => (
              <th key={c.label} className="text-left font-semibold text-[#1C1114]/50 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isOn = selected.has(r.id);
            return (
              <tr
                key={r.id}
                className={`border-b border-[#1C1114]/5 last:border-0 cursor-pointer ${isOn ? "bg-[#FF4040]/[0.045]" : "hover:bg-[#FAF7F1]/60"}`}
                // Whole row toggles: with a checkbox column this is what
                // everyone tries first.
                onClick={() => onToggle(r.id)}
              >
                <td className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#FF4040] cursor-pointer"
                    checked={isOn}
                    onChange={() => onToggle(r.id)}
                    onClick={(e) => e.stopPropagation()} // row handler would undo it
                    aria-label={`Select ${r.email}`}
                  />
                </td>
                {columns.map((c) => (
                  <td key={c.label} className="px-4 py-3 text-[#1C1114] align-top">
                    {c.render
                      ? c.render(r)
                      : c.label === "Joined" ? fmtDate(r.joinedAt) : c.get(r) || "—"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Composer ────────────────────────────────────────────────────────── */

const MERGE_TAGS = {
  consumer: ["email", "city", "platform"],
  business: ["email", "city", "business", "contact", "venueType"],
};

/* `betaInvite` switches the composer to the DESIGNED TestFlight-invite email
   (template `tester_invite`, rendered server-side — the "Getting Planie onto
   your phone" walkthrough) instead of a typed message. The backend stamps
   betaTester/betaInviteSentAt on everyone the mail actually reached, so a row
   only ever reads "invited" if a mail left for it. */
function Composer({ list, recipients, betaInvite, onClose, onSent, onDropRecipients }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testflightUrl, setTestflightUrl] = useState(betaInvite ? readTestFlightUrl() : "");
  const [pane, setPane] = useState("write"); // "write" | "preview"
  const [busy, setBusy] = useState(null); // null | "test" | "send"
  const [armed, setArmed] = useState(false); // second press actually sends
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const bodyRef = useRef(null);

  // Unsubscribed rows can be selected (they're normal rows) but are never
  // recipients. Counting them in "Send to N" would overstate the reach and
  // then mismatch the result, so they're removed from the count everywhere.
  const unsubscribed = recipients.filter((r) => r.unsubscribed);
  const sendable = recipients.filter((r) => !r.unsubscribed);
  const noConsent = sendable.filter((r) => !r.consent);

  /* Mirrors the backend's validation exactly — it only accepts a public
     TestFlight join link, and finding that out after pressing send twice is
     the wrong time. */
  const linkOk = /^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+$/.test(testflightUrl.trim());
  const ready = sendable.length > 0 && (
    betaInvite ? linkOk : subject.trim().length > 0 && body.trim().length > 0
  );

  // Arming is per-body: editing after arming must re-arm, or you can send a
  // half-finished edit with a press you thought was aimed at the old text.
  useEffect(() => setArmed(false), [subject, body, testflightUrl, sendable.length]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const insertTag = (tag) => {
    const el = bodyRef.current;
    const token = `{{${tag}}}`;
    if (!el) { setBody((b) => b + token); return; }
    const { selectionStart: s, selectionEnd: e } = el;
    setBody((b) => b.slice(0, s) + token + b.slice(e));
    // Restore the caret after React re-renders, or the next tag lands at 0.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    });
  };

  /* The custom broadcast's fields, built once so the preview cannot drift
     from the send. The beta invite doesn't use this: its email is a fixed
     designed template rendered server-side. */
  const parts = useMemo(() => ({ message: body.trim() }), [body]);

  /* Rendered against the first recipient, the same row the backend uses for a
     test send — so merge tags show real values rather than {{city}}.
     The unsubscribe link is drawn but left dead: this is a preview. */
  const sample = sendable[0];
  const previewHtml = useMemo(
    () => buildBroadcastEmail(renderParts(parts, sample ?? {}), "#"),
    [parts, sample],
  );
  const previewSubject = applyMergeTags(subject.trim(), sample ?? {});

  const submit = async (test) => {
    setBusy(test ? "test" : "send");
    setError(null);
    try {
      const res = await sendWaitlistEmail({
        list,
        ids: sendable.map((r) => r.id),
        test,
        ...(betaInvite
          ? { template: "tester_invite", testflightUrl: testflightUrl.trim() }
          : { subject: subject.trim(), body: body.trim() }),
      });
      setResult(res);
      // Remembered on any successful send including a test — a link that
      // rendered correctly in a preview is the one worth keeping.
      if (betaInvite) rememberTestFlightUrl(testflightUrl.trim());
      if (!test) onSent();
    } catch (err) {
      setError(err.message || "Could not send.");
    } finally {
      setBusy(null);
      setArmed(false);
    }
  };

  const preview = sendable.slice(0, 3).map((r) => r.email).join(", ");

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1114]/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Compose email" className="w-full max-w-2xl bg-white rounded-2xl border border-[#1C1114]/10 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C1114]/10">
          <h2 className="font-bold text-[#1C1114] text-lg" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
            {result && !result.test
              ? "Sent"
              : betaInvite
                ? `TestFlight invite · ${sendable.length}`
                : `Email ${sendable.length} ${sendable.length === 1 ? "person" : "people"}`}
          </h2>
          <button onClick={onClose} className="text-[#1C1114]/40 hover:text-[#1C1114]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {result && !result.test ? (
          <div className="px-6 py-6">
            <p className="text-sm text-[#1C1114]">
              Sent to <strong>{result.sent}</strong> of {result.recipientCount}.
              {result.failed > 0 && <> <span className="text-red-600">{result.failed} failed.</span></>}
            </p>
            {result.failures?.length > 0 && (
              <ul className="mt-3 text-xs text-[#1C1114]/60 space-y-1 max-h-40 overflow-y-auto">
                {result.failures.map((f) => <li key={f.email}>{f.email} — {f.error}</li>)}
              </ul>
            )}
            <button onClick={onClose} className="mt-6 w-full rounded-full bg-[#1C1114] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="rounded-xl bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
              <span className="font-semibold text-[#1C1114]">To:</span> {preview}
              {sendable.length > 3 && <> and {sendable.length - 3} more</>}
            </div>

            {/* Consent is the tickbox they agreed to at signup. Sending anyway
                is the admin's call, but it must be a decision, not an
                accident — hence the one-click way out. */}
            {unsubscribed.length > 0 && (
              <div className="mt-3 rounded-xl border border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
                <strong>{unsubscribed.length}</strong> of the rows you selected have unsubscribed and
                will not be emailed.
              </div>
            )}

            {betaInvite && (
              <div className="mt-3 rounded-xl border border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
                Everyone this reaches is marked as a beta tester and stamped with today's date.
              </div>
            )}

            {noConsent.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>{noConsent.length}</strong> of these did not tick the marketing consent box.
                <button
                  className="ml-2 underline font-semibold"
                  onClick={() => onDropRecipients(noConsent.map((r) => r.id))}
                >
                  Remove them
                </button>
              </div>
            )}

            {betaInvite ? (
              <>
                {/* Fixed designed template — nothing to write. The email is
                    rendered server-side; "Send test to me" is the preview. */}
                <div className="mt-4 rounded-xl border border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-3 text-sm text-[#1C1114]/70">
                  <p><span className="font-semibold text-[#1C1114]">Subject:</span> You've been chosen to test Planie</p>
                  <p className="mt-1.5">
                    The designed install walkthrough — five steps, a troubleshooting card, and your
                    TestFlight link as the button. Send a test to yourself to see it in your inbox.
                  </p>
                </div>
                <label htmlFor="bc-testflight" className="block text-sm font-semibold text-[#1C1114] mt-4 mb-1.5">
                  TestFlight link
                </label>
                <input
                  id="bc-testflight" type="url" inputMode="url" autoFocus
                  value={testflightUrl} onChange={(e) => setTestflightUrl(e.target.value)}
                  placeholder="https://testflight.apple.com/join/…"
                  className={fieldClass}
                />
                <p className={`mt-2 text-xs ${testflightUrl.trim() && !linkOk ? "text-red-600" : "text-[#1C1114]/45"}`}>
                  {testflightUrl.trim() && !linkOk
                    ? "Needs to be a public TestFlight link: https://testflight.apple.com/join/…"
                    : "Becomes the button in the email. Remembered for next time."}
                </p>
              </>
            ) : (
            <>
            {/* Preview is a pane, not a second dialog: the email is 560px of
                cream and the fields are 560px of form, so they can't sit side
                by side at this width without shrinking both. */}
            <div className="mt-5 inline-flex rounded-full border border-[#1C1114]/15 p-0.5">
              {[
                { key: "write", label: "Write", icon: Pencil },
                { key: "preview", label: "Preview", icon: Eye },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key} type="button" onClick={() => setPane(key)}
                  aria-pressed={pane === key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                    pane === key ? "bg-[#1C1114] text-white" : "text-[#1C1114]/60 hover:text-[#1C1114]"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {pane === "preview" ? (
              <div className="mt-4">
                <div className="rounded-t-xl border border-b-0 border-[#1C1114]/10 bg-[#FAF7F1] px-4 py-2.5">
                  <p className="text-xs text-[#1C1114]/45">Subject</p>
                  <p className="text-sm font-semibold text-[#1C1114] break-words">
                    {previewSubject || <span className="text-[#1C1114]/35">No subject yet</span>}
                  </p>
                </div>
                {/* sandbox with no allow-* tokens: the preview must not run
                    scripts or navigate the panel away mid-compose. */}
                <iframe
                  title="Email preview"
                  sandbox=""
                  srcDoc={previewHtml}
                  className="w-full h-[520px] rounded-b-xl border border-[#1C1114]/10 bg-[#EFE7DD]"
                />
                <p className="mt-2 text-xs text-[#1C1114]/45">
                  {sample
                    ? <>Rendered with {sample.email}'s details, the same row a test send uses. </>
                    : null}
                  Links and the unsubscribe footer are inert here. Send a test to yourself to check
                  it in a real inbox.
                </p>
              </div>
            ) : (
            <>
            <label htmlFor="bc-subject" className="block text-sm font-semibold text-[#1C1114] mt-5 mb-1.5">Subject</label>
            <input
              id="bc-subject" type="text" maxLength={200} autoFocus
              value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Planie is live in {{city}}"
              className={fieldClass}
            />

            <div className="flex items-baseline justify-between mt-4 mb-1.5">
              <label htmlFor="bc-body" className="block text-sm font-semibold text-[#1C1114]">Message</label>
              <span className="text-xs text-[#1C1114]/40">{body.length}/20000</span>
            </div>
            <textarea
              id="bc-body" ref={bodyRef} rows={9} maxLength={20000}
              value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={"Hi,\n\nPlanie is now live in {{city}}…"}
              className={`${fieldClass} resize-y leading-relaxed`}
            />

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#1C1114]/40 mr-1">Insert:</span>
              {MERGE_TAGS[list].map((tag) => (
                <button
                  key={tag} type="button" onClick={() => insertTag(tag)}
                  className="rounded-full border border-[#1C1114]/15 px-2.5 py-1 text-xs font-mono text-[#1C1114]/70 hover:bg-[#FAF7F1]"
                >
                  {`{{${tag}}}`}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#1C1114]/45">
              Plain text — blank lines become paragraphs and links are made clickable. Merge tags
              resolve per recipient, and empty ones become nothing.
            </p>
            </>
            )}
            </>
            )}

            {result?.test && (
              <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                Test sent to {result.sentTo}. Nothing went to the list.
              </p>
            )}
            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button" disabled={!ready || busy !== null} onClick={() => submit(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 px-4 py-2 text-sm font-semibold text-[#1C1114] hover:bg-[#FAF7F1] disabled:opacity-50"
              >
                <Send size={14} /> {busy === "test" ? "Sending…" : "Send test to me"}
              </button>
              <button
                type="button" disabled={!ready || busy !== null}
                onClick={() => (armed ? submit(false) : setArmed(true))}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${armed ? "bg-[#1C1114]" : "bg-[#FF4040] hover:opacity-90"}`}
              >
                {busy === "send"
                  ? "Sending…"
                  : armed
                    ? `Confirm — send to ${sendable.length}`
                    : `Send to ${sendable.length}`}
              </button>
            </div>
            {armed && (
              <p className="mt-2 text-right text-xs text-[#1C1114]/50">
                This cannot be undone. Press again to send.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Test confirmation email ─────────────────────────────────────────── */

/* Sends the signup confirmation — the email a real waitlist signup receives —
   to an address you type, so it can be judged in an inbox rather than a
   preview pane. There is no preview tab here on purpose: the broadcast
   template is duplicated in this repo for that, and a second hand-synced copy
   of the confirmation template is a lie waiting to happen. The real inbox is
   the only rendering that counts anyway — image blocking, dark mode and
   Gmail's clipping are all things a same-page iframe cannot show you. */
function TestEmailDialog({ list, defaultTo, onClose }) {
  const [to, setTo] = useState(defaultTo ?? "");
  // Opens on whichever list you were looking at — the common case is "I'm on
  // Businesses, show me what they get".
  const [variant, setVariant] = useState(list);
  const [city, setCity] = useState("");
  const [platform, setPlatform] = useState("Either");
  const [business, setBusiness] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(null);

  const isConsumer = variant === "consumer";
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim());

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await sendTestWaitlistEmail({
        to: to.trim(),
        variant,
        city: city.trim(),
        ...(isConsumer ? { platform } : { business: business.trim() }),
      });
      rememberTestEmailTo(res.to);
      setSent(res.to);
    } catch (err) {
      setError(err.message || "Could not send the test email.");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[#1C1114]/15 px-3.5 py-2.5 text-sm text-[#1C1114] outline-none focus:border-[#1C1114]/40";
  const labelCls = "block text-xs font-semibold text-[#1C1114]/50 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1114]/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Send test email" className="w-full max-w-md bg-white rounded-2xl border border-[#1C1114]/10 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C1114]/10">
          <h2 className="font-bold text-[#1C1114] text-lg" style={{ fontFamily: "var(--nu-font-head)", letterSpacing: "-0.02em" }}>
            {sent ? "Sent" : "Test confirmation email"}
          </h2>
          <button onClick={onClose} className="text-[#1C1114]/40 hover:text-[#1C1114]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-6">
            <p className="text-sm text-[#1C1114]">
              The {isConsumer ? "consumer" : "business"} confirmation is on its way to{" "}
              <strong>{sent}</strong>.
            </p>
            <p className="mt-2 text-xs text-[#1C1114]/50">
              Identical to a real signup's, subject line included — so check spam too, and use
              "Display images" to see the logo the first time.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setSent(null)}
                className="flex-1 rounded-full border border-[#1C1114]/15 px-5 py-2.5 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA]"
              >
                Send another
              </button>
              <button onClick={onClose} className="flex-1 rounded-full bg-[#1C1114] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="inline-flex rounded-full border border-[#1C1114]/15 p-0.5 mb-5">
              {[
                { key: "consumer", label: "Normal user", icon: Users },
                { key: "business", label: "Business", icon: Store },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key} type="button" onClick={() => setVariant(key)}
                  aria-pressed={variant === key}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                    variant === key ? "bg-[#1C1114] text-white" : "text-[#1C1114]/60 hover:text-[#1C1114]"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            <label className={labelCls} htmlFor="test-to">Send to</label>
            <input
              id="test-to" type="email" value={to} onChange={(e) => setTo(e.target.value)}
              placeholder="you@example.com" className={inputCls} autoFocus
            />

            {/* These are the values the email echoes back in its details table.
                Blank is fine — the backend fills in a realistic sample, because
                a details table reading "test" tells you nothing about spacing. */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="test-city">City</label>
                <input
                  id="test-city" value={city} onChange={(e) => setCity(e.target.value)}
                  placeholder="London" className={inputCls}
                />
              </div>
              {isConsumer ? (
                <div>
                  <label className={labelCls} htmlFor="test-platform">Phone</label>
                  <select
                    id="test-platform" value={platform} onChange={(e) => setPlatform(e.target.value)}
                    className={inputCls}
                  >
                    {["iOS", "Android", "Either"].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className={labelCls} htmlFor="test-business">Place</label>
                  <input
                    id="test-business" value={business} onChange={(e) => setBusiness(e.target.value)}
                    placeholder="The Camberwell Arms" className={inputCls}
                  />
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-[#1C1114]/45">
              {isConsumer
                ? platform === "Either"
                  ? "With \"Either\" the email says \"the day Planie goes live\" and names no platform — worth seeing both ways."
                  : `The email will say "the day Planie lands on ${platform}".`
                : "The business version echoes the place and city back, and has no platform line."}
              {" "}Nothing is written to the waitlist.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <button
              onClick={send} disabled={!valid || busy}
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#1C1114] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              <Send size={14} /> {busy ? "Sending…" : "Send test"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Panel ───────────────────────────────────────────────────────────── */

export default function AdminWaitlist() {
  // Auth, the isAdmin gate, and the actual data fetch all live in AdminShell
  // (shared with the Home tab) — this component only reloads by calling the
  // same `reload` the shell used for the first load.
  const { data, setData, loading, reload: load, user } = useAdminData();
  const [tab, setTab] = useState("consumer");
  const [query, setQuery] = useState("");
  const [betaFilter, setBetaFilter] = useState("all"); // "all" | "beta" | "notBeta"
  const [flagging, setFlagging] = useState(false);
  // Scoped to this tab's own actions (mark-beta, delete) — separate from the
  // shell's load error, which only ever describes the initial fetch failing.
  const [actionError, setActionError] = useState(null);
  // Deleting is two-press (arm, then confirm) like sending — and the armed
  // state dies whenever the selection changes, so the press can never land on
  // different rows than the ones it was aimed at.
  const [deleting, setDeleting] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  // Per-tab, because a selection of people and a selection of businesses go to
  // different endpoints' worth of merge tags — mixing them would be nonsense.
  const [selection, setSelection] = useState({ consumer: new Set(), business: new Set() });
  const [composing, setComposing] = useState(null); // null | "email" | "beta"
  const [testingEmail, setTestingEmail] = useState(false);

  // Memoised because the filter below depends on them: a fresh [] each render
  // would re-run the filter on every keystroke elsewhere in the tree.
  const rows = useMemo(
    () => (data ? (tab === "consumer" ? data.consumer : data.business) : []),
    [data, tab],
  );
  const columns = tab === "consumer" ? CONSUMER_COLUMNS : BUSINESS_COLUMNS;

  /* Search spans every displayed column, so "London", "iOS" and a partial
     email all work without the user picking a field first. */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (betaFilter === "beta" && !r.betaTester) return false;
      if (betaFilter === "notBeta" && r.betaTester) return false;
      if (!q) return true;
      return columns.some((c) => String(c.get(r) ?? "").toLowerCase().includes(q));
    });
  }, [rows, columns, query, betaFilter]);

  const selected = selection[tab];
  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);

  const mutateSelection = useCallback((fn) => {
    setSelection((prev) => {
      const next = new Set(prev[tab]);
      fn(next);
      return { ...prev, [tab]: next };
    });
  }, [tab]);

  const toggleRow = useCallback((id) => {
    mutateSelection((s) => (s.has(id) ? s.delete(id) : s.add(id)));
  }, [mutateSelection]);

  const toggleShown = useCallback((shown, on) => {
    mutateSelection((s) => shown.forEach((r) => (on ? s.add(r.id) : s.delete(r.id))));
  }, [mutateSelection]);

  const clearSelection = useCallback(() => {
    mutateSelection((s) => s.clear());
  }, [mutateSelection]);

  const dropRecipients = useCallback((ids) => {
    mutateSelection((s) => ids.forEach((id) => s.delete(id)));
  }, [mutateSelection]);

  /* Flags the selection, then patches the loaded rows in place rather than
     re-fetching: the whole list is a second-long round trip and the only thing
     that changed is a boolean we already know the value of. The selection is
     kept so "mark these, now email these" is one continuous action. */
  const markBeta = useCallback(async (on) => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0 || flagging) return;
    setFlagging(true);
    setActionError(null);
    try {
      await setBetaTesters({ list: tab, ids, betaTester: on });
      const touched = new Set(ids);
      setData((prev) => (prev ? {
        ...prev,
        [tab]: prev[tab].map((r) => (touched.has(r.id) ? { ...r, betaTester: on } : r)),
      } : prev));
    } catch (err) {
      setActionError(err.message || "Could not update the beta flag.");
    } finally {
      setFlagging(false);
    }
  }, [selectedRows, flagging, tab, setData]);

  /* Permanent removal. The rows vanish from the loaded data on success —
     no refetch needed, the backend confirmed exactly what was deleted. */
  const deleteSelected = useCallback(async () => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0 || deleting) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteWaitlistRows({ list: tab, ids });
      const gone = new Set(ids);
      setData((prev) => (prev ? {
        ...prev,
        [tab]: prev[tab].filter((r) => !gone.has(r.id)),
        counts: prev.counts
          ? { ...prev.counts, [tab]: Math.max(0, (prev.counts[tab] ?? 0) - gone.size) }
          : prev.counts,
      } : prev));
      mutateSelection((sel) => ids.forEach((id) => sel.delete(id)));
    } catch (err) {
      setActionError(err.message || "Could not delete.");
    } finally {
      setDeleting(false);
      setDeleteArmed(false);
    }
  }, [selectedRows, deleting, tab, mutateSelection, setData]);

  // Selection changed → any armed delete was aimed at different rows.
  useEffect(() => setDeleteArmed(false), [selectedRows.length, tab]);

  const total = data?.counts?.[tab] ?? 0;
  const truncated = data && rows.length < total;
  // Counted over the loaded rows, not the collection — there is no aggregation
  // query behind it, so it means "of the ones on this page".
  const betaCount = rows.filter((r) => r.betaTester).length;
  // Drives which of mark/unmark the action bar offers. A mixed selection shows
  // "Mark as beta", so one press always ends with everything flagged.
  const allSelectedAreBeta = selectedRows.length > 0 && selectedRows.every((r) => r.betaTester);

  return (
    <div>
      {actionError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "consumer", label: "People", icon: Users },
            { key: "business", label: "Businesses", icon: Store },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold border ${
                tab === key
                  ? "bg-[#1C1114] text-white border-[#1C1114]"
                  : "bg-white text-[#1C1114] border-[#1C1114]/15 hover:bg-[#FAFAFA]"
              }`}
            >
              <Icon size={14} /> {label}
              <span className={tab === key ? "opacity-60" : "opacity-45"}>
                ({data?.counts?.[key] ?? "—"})
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* Sends to an address you type, so it has nothing to do with which
              rows are ticked — lives next to Refresh, not the selection bar. */}
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 bg-white px-4 py-1.5 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA]"
            onClick={() => setTestingEmail(true)}
          >
            <FlaskConical size={14} /> Test email
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 bg-white px-4 py-1.5 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA] disabled:opacity-50"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : undefined} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1C1114]/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, city, platform…"
              aria-label="Search the waitlist"
              className="w-full rounded-full border border-[#1C1114]/15 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF4040]/25"
            />
          </div>
          {/* Segmented, not a checkbox: "not beta" is the view you want when
              picking the next round of testers, and it isn't reachable from a
              single on/off. */}
          <div className="inline-flex rounded-full border border-[#1C1114]/15 bg-white p-0.5">
            {[
              { key: "all", label: "All" },
              { key: "beta", label: "Beta testers" },
              { key: "notBeta", label: "Not beta" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setBetaFilter(key)}
                aria-pressed={betaFilter === key}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  betaFilter === key ? "bg-[#1C1114] text-white" : "text-[#1C1114]/60 hover:text-[#1C1114]"
                }`}
              >
                {label}
                {key === "beta" && betaCount > 0 && (
                  <span className={betaFilter === key ? "opacity-60" : "opacity-45"}> ({betaCount})</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1C1114]/15 bg-white px-4 py-2 text-sm font-semibold text-[#1C1114] hover:bg-[#FAFAFA] disabled:opacity-50"
            onClick={() => downloadCsv(`planie-${tab}-waitlist.csv`, columns, filtered)}
            disabled={filtered.length === 0}
          >
            <Download size={14} /> Export CSV ({filtered.length})
          </button>
        </div>

        <p className="text-sm text-[#1C1114]/50 mb-3" aria-live="polite">
          {loading
            ? "Loading…"
            : `Showing ${filtered.length}${query ? ` of ${rows.length} loaded` : ""}${
                truncated ? ` · ${total} total, newest ${rows.length} loaded` : ""
              }`}
        </p>

        {!loading && (
          <Table
            columns={columns}
            rows={filtered}
            emptyLabel={query ? "Nothing matches that search." : "No signups yet."}
            selected={selected}
            onToggle={toggleRow}
            onToggleAll={toggleShown}
          />
        )}

        {/* Bottom sheet rather than a toolbar above the table: it only exists
            once something is selected, and appearing at the thumb end of the
            screen keeps it reachable on a phone. pb-safe-ish padding keeps it
            clear of the iOS home indicator. */}
        {selectedRows.length > 0 && !composing && (
          <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 pt-3 pointer-events-none">
            <div className="pointer-events-auto mx-auto max-w-2xl flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#1C1114] px-5 py-3 text-white shadow-lg">
              <span className="text-sm">
                <strong>{selectedRows.length}</strong> selected
                {selectedRows.length < selected.size && (
                  <span className="opacity-60"> ({selected.size - selectedRows.length} not in view)</span>
                )}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="text-sm text-white/60 hover:text-white px-2"
                  onClick={clearSelection}
                >
                  Clear
                </button>
                {/* Unmark only offered when the selection actually contains
                    testers, so the common case stays a single button. */}
                {allSelectedAreBeta ? (
                  <button
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => markBeta(false)}
                    disabled={flagging}
                  >
                    {flagging ? "Saving…" : "Unmark beta"}
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => markBeta(true)}
                    disabled={flagging}
                  >
                    <FlaskConical size={15} /> {flagging ? "Saving…" : "Mark as beta"}
                  </button>
                )}
                <button
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                    deleteArmed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => (deleteArmed ? deleteSelected() : setDeleteArmed(true))}
                  disabled={deleting}
                >
                  <Trash2 size={15} />
                  {deleting
                    ? "Deleting…"
                    : deleteArmed
                      ? `Confirm — delete ${selectedRows.length}`
                      : "Delete"}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                  onClick={() => setComposing("email")}
                >
                  <Mail size={15} /> Write email
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4040] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  onClick={() => setComposing("beta")}
                >
                  <Send size={15} /> TestFlight invite
                </button>
              </div>
            </div>
          </div>
        )}

      {testingEmail && (
        <TestEmailDialog
          list={tab}
          defaultTo={readTestEmailTo(user.email)}
          onClose={() => setTestingEmail(false)}
        />
      )}

      {composing && (
        <Composer
          list={tab}
          recipients={selectedRows}
          betaInvite={composing === "beta"}
          onClose={() => setComposing(null)}
          // A beta invite writes betaInviteSentAt server-side, so the row data
          // this page holds is now stale — reload rather than guess at it.
          onSent={() => { clearSelection(); if (composing === "beta") load(); }}
          onDropRecipients={dropRecipients}
        />
      )}
    </div>
  );
}
