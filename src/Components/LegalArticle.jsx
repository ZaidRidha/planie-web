/* LegalArticle — shared layout for the static Privacy / Terms pages
   (ported from the new design's Planie Privacy/Terms .dc.html). Renders in
   the public Header/Footer layout, so this is just the article body. */

import { Link } from "react-router-dom";

export default function LegalArticle({ kicker, title, updated, sections, footerNote }) {
  const head = { fontFamily: "var(--nu-font-head)", fontWeight: 700, letterSpacing: "-0.015em" };
  return (
    <article style={{ maxWidth: 820, margin: "0 auto", padding: "120px 40px 100px", color: "var(--nu-ink)", fontFamily: "var(--nu-font-body)" }}>
      <p className="nu-microlabel" style={{ marginBottom: 16 }}>{kicker}</p>
      <h1 style={{ ...head, margin: 0, fontSize: "clamp(40px, 6vw, 68px)", letterSpacing: "-0.025em", lineHeight: 1.02 }}>{title}</h1>
      {updated && <p style={{ margin: "18px 0 0", fontSize: 14, opacity: 0.5 }}>Last updated {updated}</p>}

      <div style={{ marginTop: 40 }}>
        {sections.map((s) => (
          <section key={s.title} style={{ padding: "28px 0", borderTop: "1px solid rgba(28,17,20,0.09)" }}>
            <h2 style={{ ...head, margin: "0 0 14px", fontSize: 22 }}>{s.title}</h2>
            {s.paras.map((p, i) => (
              <p key={i} style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.7, opacity: 0.72 }}>{p}</p>
            ))}
          </section>
        ))}
      </div>

      {footerNote && (
        <p style={{ margin: "32px 0 0", fontSize: 15, lineHeight: 1.6, opacity: 0.6 }}>
          {footerNote}{" "}
          <Link to="/contact" style={{ fontWeight: 600, color: "var(--nu-red)" }}>our contact page</Link>.
        </p>
      )}
    </article>
  );
}
