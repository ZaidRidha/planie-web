import React, { useEffect, useState } from "react";
import { usePartnerAuth } from "../../Context/PartnerAuthContext";
import "../PartnerDashboard.css";
import "./SettingsTab.css";

/* ─── Settings Tab ───
   Wiring (unchanged): only "Sign out" talks to the backend (logout()).
   Profile fields are uncontrolled inputs seeded from the partner profile;
   notification toggles are local component state. Neither is persisted yet,
   so their save/persist affordances are shown as not-yet-available. */
export function SettingsTab() {
  const { profile, logout } = usePartnerAuth();
  const [notifs, setNotifs] = useState({
    newBookings: true, weeklyReport: true, monthlyGeoReport: true,
    listingUpdates: false, growthInsights: false, platformUpdates: false,
  });
  const toggle = (k) => setNotifs((p) => ({ ...p, [k]: !p[k] }));
  const bizName = profile?.businessName || "";
  const email = profile?.email || "";
  const notifItems = [
    { key: "newBookings", title: "New bookings", desc: "When a traveler books your listing." },
    { key: "weeklyReport", title: "Weekly performance report", desc: "A summary of your listings every Monday." },
    { key: "monthlyGeoReport", title: "Monthly GEO score report", desc: "GEO score and ranking trends.", soon: true },
    { key: "listingUpdates", title: "Listing review updates", desc: "When your listings are approved or need changes." },
    { key: "growthInsights", title: "Growth insights", desc: "Occasional tips to grow your business.", soon: true },
    { key: "platformUpdates", title: "Planie platform updates", desc: "Product announcements and new features." },
  ];
  const jump = [
    { label: "Business profile", id: "set-business" },
    { label: "Team & access", id: "set-team" },
    { label: "Notifications", id: "set-notifications" },
    { label: "Security", id: "set-security" },
    { label: "Danger zone", id: "set-danger" },
  ];

  // "On this page" — scroll in place instead of changing the URL hash, which
  // the dashboard uses for tab routing.
  const [activeSection, setActiveSection] = useState(jump[0].id);
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const els = ["set-business", "set-team", "set-notifications", "set-security", "set-danger"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveSection(vis[0].target.id);
      },
      { rootMargin: "-10% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const Toggle = ({ on, onClick, disabled, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`ps-toggle${on ? " ps-toggle--on" : ""}`}
    >
      <span className="ps-knob" />
    </button>
  );
  const Soon = () => <span className="ps-soon">Soon</span>;

  return (
    <div className="ps-root">
      <header className="ps-rise">
        <p className="ps-kicker">Settings</p>
        <h1 className="ps-title">Account &amp; preferences.</h1>
      </header>

      <div className="ps-layout">
        <div className="ps-col">
          {/* Business profile */}
          <section id="set-business" className="ps-card ps-rise ps-d1">
            <h2 className="ps-h2">Business profile</h2>
            <p className="ps-sub">Your Business Profile — the account every venue listing sits under.</p>
            <label className="ps-label" htmlFor="ps-biz-name">Business name</label>
            <input id="ps-biz-name" type="text" defaultValue={bizName} placeholder="Your business name" className="ps-input" />

            <p className="ps-group-label">Primary contact</p>
            <div className="ps-grid">
              <div>
                <label className="ps-label" htmlFor="ps-contact-email">Contact email</label>
                <input id="ps-contact-email" type="text" defaultValue={email} className="ps-input" />
              </div>
              <div>
                <label className="ps-label" htmlFor="ps-phone">Phone</label>
                <input id="ps-phone" type="text" placeholder="+44 …" className="ps-input" />
              </div>
            </div>

            <label className="ps-label ps-label--spaced" htmlFor="ps-desc">Business description</label>
            <textarea id="ps-desc" rows={3} placeholder="A short description of your business." className="ps-input ps-textarea" />

            <div className="ps-actions">
              <p className="ps-note">Saving profile edits from the portal is coming soon.</p>
              <button type="button" className="ps-btn ps-btn--fill" disabled title="Coming soon">Save changes</button>
            </div>
          </section>

          {/* Team & access */}
          <section id="set-team" className="ps-card ps-rise ps-d2">
            <div className="ps-card-head">
              <div>
                <h2 className="ps-h2">Team &amp; access</h2>
                <p className="ps-sub">Who can manage this Business Profile and its listings.</p>
              </div>
              <button type="button" className="ps-btn ps-btn--outline" disabled title="Coming soon">+ Invite teammate</button>
            </div>
            <div className="ps-list">
              <div className="ps-row">
                <div className="ps-avatar">{(bizName || email || "?").slice(0, 1).toUpperCase()}</div>
                <div className="ps-row-main">
                  <p className="ps-row-title">{bizName || "You"}</p>
                  <p className="ps-row-desc ps-ellipsis">{email}</p>
                </div>
                <span className="ps-role">Owner</span>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section id="set-notifications" className="ps-card ps-rise ps-d3">
            <h2 className="ps-h2">Notifications</h2>
            <p className="ps-sub" style={{ marginBottom: 20 }}>Choose what lands in your inbox.</p>
            {notifItems.map((nt) => (
              <div key={nt.key} className={`ps-row${nt.soon ? " ps-row--soon" : ""}`}>
                <div className="ps-row-main">
                  <p className="ps-row-title">{nt.title}{nt.soon && <Soon />}</p>
                  <p className="ps-row-desc">{nt.desc}</p>
                </div>
                <Toggle
                  on={!nt.soon && notifs[nt.key]}
                  disabled={nt.soon}
                  label={nt.title}
                  onClick={() => !nt.soon && toggle(nt.key)}
                />
              </div>
            ))}
            <p className="ps-note" style={{ marginTop: 14 }}>Email preferences aren’t saved to your account yet.</p>
          </section>

          {/* Security */}
          <section id="set-security" className="ps-card ps-rise ps-d4">
            <h2 className="ps-h2">Security</h2>
            <p className="ps-sub" style={{ marginBottom: 20 }}>Password, authentication and active sessions.</p>
            <div className="ps-row ps-row--pad ps-row--wrap">
              <div className="ps-row-main">
                <p className="ps-row-title">Password</p>
                <p className="ps-row-desc">Reset it by email any time.</p>
              </div>
              <button type="button" className="ps-btn ps-btn--outline" onClick={() => logout()}>Sign out</button>
            </div>
            <div className="ps-row ps-row--pad ps-row--soon ps-row--wrap">
              <div className="ps-row-main">
                <p className="ps-row-title">Two-factor authentication<Soon /></p>
                <p className="ps-row-desc">Add an extra layer of security.</p>
              </div>
              <button type="button" className="ps-btn ps-btn--fill" disabled title="Coming soon">Enable 2FA</button>
            </div>
          </section>

          {/* Danger zone */}
          <section id="set-danger" className="ps-danger ps-rise ps-d5">
            <div className="ps-danger-main">
              <p className="ps-danger-title">Delete Business Profile</p>
              <p className="ps-danger-desc">Permanently removes your account, every venue listing, and all associated data. This cannot be undone.</p>
              <p className="ps-note" style={{ marginTop: 8 }}>Self-serve deletion isn’t available in the portal yet.</p>
            </div>
            <button type="button" className="ps-btn ps-btn--danger" disabled title="Coming soon">Delete account</button>
          </section>
        </div>

        {/* Rail */}
        <aside className="ps-rail ps-rise ps-d2">
          <div className="ps-rail-card">
            <p className="ps-rail-label">On this page</p>
            <nav className="ps-jump">
              {jump.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  className={`ps-jump-link${activeSection === j.id ? " ps-jump-link--on" : ""}`}
                  onClick={() => scrollTo(j.id)}
                >
                  {j.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="ps-account">
            <p className="ps-account-label">Account</p>
            <p className="ps-account-name">{bizName || "Your business"}</p>
            {email && <p className="ps-account-meta">{email}</p>}
            <a href="#billing" className="ps-account-link">
              Manage plan &amp; billing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13" /><path d="M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
