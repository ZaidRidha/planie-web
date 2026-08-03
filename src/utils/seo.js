/* seo.js - per-route <head> management.

   This app is a CRA single-page app: index.html ships one <title> and one
   generic description for every URL. That is survivable for /waitlist, but a
   content section whose entire job is search visibility needs each URL to
   carry its own title, description, canonical, social card and structured
   data. There is no react-helmet in package.json and adding a dependency for
   ~60 lines of DOM writing is not worth it, so this does it directly.

   Everything written here is tagged data-seo so the cleanup on unmount can
   find it again: tags authored in public/index.html are left alone (we only
   overwrite their content and restore the original on the way out).

   Note for later: Googlebot renders JavaScript, so client-side tags do get
   picked up - but they are read on the *second* pass, and other crawlers
   (most social unfurlers, Bing, LLM fetchers) do not run JS at all. If the
   guides start earning traffic, the upgrade is prerendering these routes at
   build time; this module is deliberately shaped so that swapping it for a
   prerender step changes nothing about the pages themselves.

   Source is ASCII-only (this repo has documented CP1252/UTF-8 damage - see
   the mojibake in Footer.jsx). */

import { useEffect } from "react";

export const SITE_URL = "https://planie.app";
export const SITE_NAME = "Planie";
const DEFAULT_TITLE = "Planie";
const DEFAULT_DESCRIPTION = "Planie";

/* Find an existing meta tag by name or property, or make one. Tags we create
   are marked so cleanup only removes our own. */
function meta(attr, key) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("data-seo", "");
    document.head.appendChild(el);
  }
  return el;
}

function link(rel) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-seo", "");
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Set this route's head tags; restores the defaults when the route unmounts.
 *
 * @param {object}  o
 * @param {string}  o.title        full <title> text (already includes " | Planie")
 * @param {string}  o.description  meta description, ~150-160 chars
 * @param {string}  o.path         absolute path, e.g. "/guides/date-night-london"
 * @param {string} [o.type]        Open Graph type; "website" or "article"
 * @param {object} [o.jsonLd]      schema.org object, injected as ld+json
 */
export function useSeo({ title, description, path, type = "website", jsonLd }) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const prevTitle = document.title;
    const descEl = document.head.querySelector('meta[name="description"]');
    const prevDesc = descEl ? descEl.getAttribute("content") : null;

    document.title = title;
    meta("name", "description").setAttribute("content", description);
    link("canonical").setAttribute("href", url);

    meta("property", "og:title").setAttribute("content", title);
    meta("property", "og:description").setAttribute("content", description);
    meta("property", "og:url").setAttribute("content", url);
    meta("property", "og:type").setAttribute("content", type);
    meta("property", "og:site_name").setAttribute("content", SITE_NAME);
    meta("name", "twitter:card").setAttribute("content", "summary_large_image");
    meta("name", "twitter:title").setAttribute("content", title);
    meta("name", "twitter:description").setAttribute("content", description);

    let script;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      if (descEl) descEl.setAttribute("content", prevDesc || DEFAULT_DESCRIPTION);
      if (script) script.remove();
      // Only tags this module created carry data-seo; index.html's do not.
      document.head
        .querySelectorAll('meta[data-seo], link[data-seo]')
        .forEach((el) => el.remove());
    };
  }, [title, description, path, type, jsonLd]);
}
