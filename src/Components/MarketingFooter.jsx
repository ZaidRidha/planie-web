/* MarketingFooter - the homepage's "whisper" footer, as a React component.
   Tracks public/marketing/home.html lines 648-671: one row (logo | links |
   socials), one quiet legal line. Nothing is added to it - the whole point of
   that footer is how little it says. Styling lives in MarketingChrome.css.

   The two social marks are the source's own inline SVGs, kept as SVG rather
   than swapped for Assets/Images PNGs so they inherit currentColor and match
   the homepage exactly.

   Source is ASCII-only (see the note in MarketingHeader.jsx). */

import { Link } from "react-router-dom";
import { MARKETING_LOGO } from "./MarketingHeader";
import "./MarketingChrome.css";

export default function MarketingFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-footer-row">
        <Link to="/" aria-label="Planie home" style={{ display: "block" }}>
          <img className="mk-logo" src={MARKETING_LOGO} alt="Planie" />
        </Link>
        <div className="mk-footer-links">
          <Link className="mk-footer-link" to="/privacy">Privacy</Link>
          <Link className="mk-footer-link" to="/terms">Terms</Link>
          <Link className="mk-footer-link" to="/contact">Contact</Link>
          <span className="mk-footer-rule" aria-hidden="true" />
          <a
            className="mk-footer-social"
            href="https://www.instagram.com/use_planie/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Planie on Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5.5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            className="mk-footer-social"
            href="https://www.tiktok.com/@use_planie"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Planie on TikTok"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.1 8.2a5.9 5.9 0 0 1-4.2-1.75 5.9 5.9 0 0 1-1.55-2.85h-3.02v10.9a2.55 2.55 0 1 1-1.82-2.44V8.9a5.6 5.6 0 1 0 4.86 5.55V9.63a8.9 8.9 0 0 0 4.15 1.28h.03V8.2h-.45Z" />
            </svg>
          </a>
        </div>
      </div>
      {/* The year is computed rather than hardcoded as home.html has it - the
          line is otherwise verbatim. */}
      <p className="mk-footer-legal">
        &copy; {new Date().getFullYear()} Planie. Made for the time of your life.
      </p>
    </footer>
  );
}
