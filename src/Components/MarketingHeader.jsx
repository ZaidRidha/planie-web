/* MarketingHeader - the homepage's own nav, as a React component.

   The homepage (/) is served as an iframe of public/marketing/home.html, which
   carries its own nav; this reproduces that nav so React routes can sit under
   the same chrome instead of the app-wide Header.jsx. Markup and values track
   home.html lines 107-113; styling lives in MarketingChrome.css.

   Two deliberate departures from the source, both because the source only ever
   runs on the homepage itself:
   - its links are in-page anchors (#business, #keep). Off the homepage those
     resolve to nothing, so they point at the routes those sections lead to.
   - its logo is a bare <img>. A nav logo that cannot be clicked back to home
     is a regression on a subpage, so it is a Link here.

   Source is ASCII-only: this repo has documented CP1252/UTF-8 damage (see the
   mojibake in Footer.jsx). */

import { Link } from "react-router-dom";
import "./MarketingChrome.css";

/* The homepage's logo asset, not Assets/Images/PlanieLogoNew.svg - the point
   is to be pixel-identical to the nav a visitor just came from. */
export const MARKETING_LOGO = "/marketing/uploads/Planie%20New%20Logo.png";

/* Nav height: 18px padding + 64px logo + 18px padding. Pages under this
   chrome offset their top by it. */
export const MARKETING_NAV_HEIGHT = 100;

export default function MarketingHeader() {
  return (
    <nav className="mk-nav">
      <Link to="/" aria-label="Planie home" style={{ display: "block" }}>
        <img className="mk-logo" src={MARKETING_LOGO} alt="Planie" />
      </Link>
      <div className="mk-nav-links">
        <Link className="mk-nav-link" to="/waitlist/business">For business</Link>
        <Link className="mk-nav-cta" to="/waitlist">Get the app</Link>
      </div>
    </nav>
  );
}
