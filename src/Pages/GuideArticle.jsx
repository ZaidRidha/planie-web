/* GuideArticle - a single guide (/guides/:slug).

   Renders the typed blocks from content/guides.js and emits the head tags
   that make the page worth publishing: a unique title and description, a
   canonical URL, an Article schema, a BreadcrumbList, and - where the guide
   has FAQs - an FAQPage schema, which is the bit that can win the expanded
   "people also ask" style results.

   Inline links: block text supports a deliberately tiny subset of markdown,
   [label](/path), so guides can link to each other and to /waitlist without
   the content file having to contain JSX. Internal cross-linking is a real
   part of why a section like this ranks, and it should cost one bracket pair
   to add. Anything more than links belongs in a new block type, not in a
   bigger parser.

   An unknown slug redirects to the index rather than rendering an empty page:
   there is no 404 route in App.js, and a soft-404 that returns 200 with no
   content is the worst outcome for both a reader and a crawler.

   Source is ASCII-only (this repo has documented CP1252/UTF-8 damage - see
   the mojibake in Footer.jsx). */

import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MARKETING_NAV_HEIGHT } from "../Components/MarketingHeader";
import { getGuide, readingTime, formatDate, relatedGuides } from "../content/guides";
import { useSeo, SITE_URL } from "../utils/seo";
import { GuideCard } from "./Guides";
import "./Guides.css";

/* [label](/path) -> <Link>. Absolute http(s) targets become plain anchors
   with the usual noopener rel; everything else is treated as an in-app route,
   because a react-router <Link> to an external URL silently does the wrong
   thing. */
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function inline(text) {
  const out = [];
  let last = 0;
  let m;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    out.push(
      /^https?:\/\//.test(href) ? (
        <a key={`${href}-${m.index}`} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <Link key={`${href}-${m.index}`} to={href}>
          {label}
        </Link>
      )
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* Strip the link syntax for anywhere the text has to be plain - schema.org
   values, meta descriptions - so structured data never contains markup. */
export const plain = (text) => text.replace(LINK_RE, "$1");

function Block({ block }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "ul":
      return (
        <ul className="gd-list">
          {block.items.map((item) => (
            <li key={item}>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="gd-steps">
          {block.items.map((s) => (
            <li key={s.title}>
              <div>
                <p className="gd-step-title">{s.title}</p>
                <p className="gd-step-body">{inline(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="gd-quote">
          <p>{block.text}</p>
        </blockquote>
      );
    case "p":
    default:
      return <p>{inline(block.text)}</p>;
  }
}

export default function GuideArticle() {
  const { slug } = useParams();
  const guide = getGuide(slug);

  /* Hooks must run unconditionally, so the schema is built before the
     missing-guide bail-out - hence the guards inside. */
  const jsonLd = useMemo(() => {
    if (!guide) return undefined;
    const url = `${SITE_URL}/guides/${guide.slug}`;
    const graph = [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: guide.published,
        dateModified: guide.updated || guide.published,
        articleSection: guide.category,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: "Planie", url: SITE_URL },
        publisher: { "@type": "Organization", name: "Planie", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title, item: url },
        ],
      },
    ];
    if (guide.faqs?.length) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
        })),
      });
    }
    return { "@context": "https://schema.org", "@graph": graph };
  }, [guide]);

  useSeo({
    title: guide ? guide.seoTitle : "Guides | Planie",
    description: guide ? guide.description : "",
    path: guide ? `/guides/${guide.slug}` : "/guides",
    type: "article",
    jsonLd,
  });

  if (!guide) return <Navigate to="/guides" replace />;

  const related = relatedGuides(guide);

  return (
    <div className="gd-page" style={{ paddingTop: MARKETING_NAV_HEIGHT, minHeight: "100vh" }}>
      {/* <article>, not <main>: App.js already provides the main landmark. */}
      <article className="gd-article gd-rise">
        <Link to="/guides" className="gd-back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 19l-7-7 7-7" />
          </svg>
          All guides
        </Link>

        <p className="nu-microlabel" style={{ marginTop: 24 }}>{guide.category}</p>
        <h1>{guide.title}</h1>

        <p className="gd-article-meta">
          <time dateTime={guide.published}>{formatDate(guide.published)}</time>
          <span className="gd-card-dot" aria-hidden="true" />
          <span>{readingTime(guide)} min read</span>
          {guide.updated && (
            <>
              <span className="gd-card-dot" aria-hidden="true" />
              <span>Updated {formatDate(guide.updated)}</span>
            </>
          )}
        </p>

        {guide.excerpt && <p className="gd-article-excerpt">{guide.excerpt}</p>}

        <div className="gd-prose">
          {guide.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {guide.faqs?.length > 0 && (
          <section className="gd-faq">
            <h2>Common questions</h2>
            {guide.faqs.map((f) => (
              <div key={f.q} className="gd-faq-item">
                <p className="gd-faq-q">{f.q}</p>
                <p className="gd-faq-a">{inline(f.a)}</p>
              </div>
            ))}
          </section>
        )}

        {/* The business guides send readers to the partner side; everything
            else to the consumer waitlist. Same component, different ask. */}
        {guide.category === "For business" ? (
          <section className="gd-cta">
            <span className="gd-cta-glow" aria-hidden="true" />
            <h2>Get your venue in front of people who are deciding.</h2>
            <p>
              Planie builds someone's actual evening, then picks the few places that belong in
              it. There is no fee to be listed - only to be lifted.
            </p>
            <div className="gd-cta-actions">
              <Link to="/waitlist/business" className="nu-btn nu-btn--red" style={{ fontSize: 15, padding: "13px 26px" }}>
                Get early access
              </Link>
              <Link to="/placements" className="nu-btn gd-btn-ghost" style={{ fontSize: 15, padding: "13px 26px" }}>
                See how placement works
              </Link>
            </div>
          </section>
        ) : (
          <section className="gd-cta">
            <span className="gd-cta-glow" aria-hidden="true" />
            <h2>Stop planning it. Let Planie do this bit.</h2>
            <p>
              Describe the evening or the trip you want and Planie builds the plan - real
              places, right area, open when you need them. It is not out yet.
            </p>
            <div className="gd-cta-actions">
              <Link to="/waitlist" className="nu-btn nu-btn--red" style={{ fontSize: 15, padding: "13px 26px" }}>
                Join the waitlist
              </Link>
              <Link to="/guides" className="nu-btn gd-btn-ghost" style={{ fontSize: 15, padding: "13px 26px" }}>
                Read more guides
              </Link>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="gd-related">
            <h2>Keep reading</h2>
            <div className="gd-related-grid">
              {related.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
