/* PortalShell — the new-design portal frame (dark sidebar + cream main).
   Shared by every portal page as it migrates to the new UI (see
   Objective/claudeObjective/uiMigrationPlan.md). Replaces the per-page
   Sidebar copies from the old design.

   Behavior contract: identical to the old sidebars — real profile name,
   real sign-out, Staff Review only for admins. Insights/GEO are static
   demo pages (owner decision 2026-07-24). */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePartnerAuth } from "../Context/PartnerAuthContext";
import logoMask from "../Assets/Images/PlanieLogoMark.svg";
import "../newUi/tokens.css";
import "../newUi/shell.css";

/* Nav model — `active` prop matches by id. Hash targets keep working with
   the existing PartnerDashboard tab logic until each tab becomes a page. */
const NAV = [
  { id: "overview", label: "Overview", to: "/partners/dashboard#dashboard" },
  { id: "listings", label: "Listings", to: "/partners/dashboard#listings" },
  { id: "promotions", label: "Promotions", to: "/partners/dashboard#promotions" },
  { id: "campaigns", label: "Campaigns", to: "/partners/campaigns" },
  { id: "insights", label: "Insights", to: "/partners/dashboard#analytics" },
  { id: "geo", label: "GEO", to: "/partners/geo" },
  { id: "billing", label: "Billing", to: "/partners/dashboard#billing" },
  { id: "settings", label: "Settings", to: "/partners/dashboard#settings" },
];

export default function PortalShell({ active, children, mainLabel }) {
  const { profile, isAdmin, logout } = usePartnerAuth();
  const navigate = useNavigate();

  const items = isAdmin
    ? [...NAV, { id: "admin", label: "Staff Review", to: "/partners/admin", live: true }]
    : NAV;

  const handleSignOut = async () => {
    await logout();
    navigate("/partners/login");
  };

  return (
    <div className="nu-portal nu-shell">
      <aside className="nu-sidebar">
        <div className="nu-sidebar-brand">
          <div
            className="nu-sidebar-logo"
            style={{ WebkitMaskImage: `url(${logoMask})`, maskImage: `url(${logoMask})` }}
          />
          <span className="nu-sidebar-wordmark">
            Planie <span>Partners</span>
          </span>
        </div>
        <nav className="nu-nav">
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.to}
              className={`nu-nav-link${active === n.id ? " nu-nav-link--on" : ""}`}
            >
              {n.label}
              {n.live && <span className="nu-nav-dot" />}
              {n.soon && <span className="nu-nav-badge">Soon</span>}
            </Link>
          ))}
        </nav>
        <div className="nu-sidebar-foot">
          <div>
            <p className="nu-sidebar-foot-name">
              {profile?.businessName || profile?.email || "Your business"}
            </p>
            <p className="nu-sidebar-foot-sub">Partner portal</p>
          </div>
          <button type="button" className="nu-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="nu-main" data-screen-label={mainLabel}>
        {children}
      </main>
    </div>
  );
}
