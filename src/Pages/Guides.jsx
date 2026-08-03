/* Guides - the index of Planie's editorial section (/guides).

   The section exists to earn organic search traffic ahead of launch, so this
   page is built for two readers: a person scanning for something useful, and
   a crawler deciding what this site is about. Hence the real H1, the per-card
   descriptive excerpts, the CollectionPage/ItemList structured data, and the
   fact that every card is a real <Link> - an onClick div would be invisible to
   both a crawler and a keyboard.

   The category filter is client-side and does not touch the URL. That is
   deliberate: /guides?category=Cities would be a second URL serving a subset
   of the same content, which is a duplicate-content problem in exchange for a
   filter nobody links to. If categories ever deserve their own pages they
   should be real routes with their own copy, not a query string.

   Wears the marketing chrome (App.js marketingLayout), so it offsets its top
   by MARKETING_NAV_HEIGHT like /placements and /waitlist do.

   Source is ASCII-only (this repo has documented CP1252/UTF-8 damage - see
   the mojibake in Footer.jsx). */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MARKETING_NAV_HEIGHT } from "../Components/MarketingHeader";
import { GUIDES, CATEGORIES, readingTime } from "../content/guides";
import { useSeo, SITE_URL } from "../utils/seo";
import "./Guides.css";

const TITLE = "Guides: how to plan better days out and trips | Planie";
const DESCRIPTION =
  "Practical guides to planning date nights, city breaks and group trips - and to getting your venue recommended. Written by the team building Planie.";

const Arrow = () => (
  <svg className="gd-card-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export function GuideCard({ guide, featured = false }) {
  return (
    <Link
      to={`/guides/${guide.slug}`}
      className={`gd-card${featured ? " gd-card--featured" : ""}`}
    >
      <p className="gd-card-meta">
        <span>{guide.category}</span>
        <span className="gd-card-dot" aria-hidden="true" />
        <span>{readingTime(guide)} min read</span>
      </p>
      {/* h2 inside the card: the page's h1 is the section title, and each
          card is a sibling heading under it. */}
      <h2 className="gd-card-title">{guide.title}</h2>
      <p className="gd-card-excerpt">{guide.excerpt}</p>
      <span className="gd-card-more">
        Read the guide <Arrow />
      </span>
    </Link>
  );
}

export default function Guides() {
  const [category, setCategory] = useState("All");

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Planie Guides",
      description: DESCRIPTION,
      url: `${SITE_URL}/guides`,
      publisher: { "@type": "Organization", name: "Planie", url: SITE_URL },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: GUIDES.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/guides/${g.slug}`,
          name: g.title,
        })),
      },
    }),
    []
  );

  useSeo({ title: TITLE, description: DESCRIPTION, path: "/guides", jsonLd });

  const shown = category === "All" ? GUIDES : GUIDES.filter((g) => g.category === category);
  /* The featured slot is a property of the guide, not of the filter - so it
     only takes the wide lead position when it is actually in the list. */
  const lead = shown.find((g) => g.featured);
  const rest = shown.filter((g) => g !== lead);

  return (
    <div className="gd-page" style={{ paddingTop: MARKETING_NAV_HEIGHT, minHeight: "100vh" }}>
      {/* A plain div, not <main>: App.js already wraps this route in one. */}
      <div className="gd-wrap">
        <header className="gd-hero gd-rise">
          <p className="nu-microlabel">Guides</p>
          <h1>Plans worth having, explained.</h1>
          <p>
            Planie exists because deciding what to do with an evening or a weekend takes far
            longer than it should. These are the methods behind that - how to plan a night
            out, a city break or a trip with six opinionated friends, and what to do about
            it if you are the venue hoping to be picked.
          </p>
        </header>

        {/* A toolbar, not a tablist: these are toggle buttons filtering a list
            below, and none of them swaps a tab panel. */}
        <div className="gd-filters" role="group" aria-label="Filter guides by category">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              className="gd-filter"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="gd-grid">
          {lead && <GuideCard guide={lead} featured />}
          {rest.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
          {shown.length === 0 && (
            <p className="gd-empty">Nothing here yet - more guides in this category are coming.</p>
          )}
        </div>
      </div>
    </div>
  );
}
