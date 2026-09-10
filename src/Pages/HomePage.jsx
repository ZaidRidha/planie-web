/* HomePage — DEV-ONLY preview of the public marketing homepage.

   In production this component never renders: public/_redirects rewrites "/"
   straight to /marketing/home.html, so the browser gets the designers' real
   static file as the document at "/". That is deliberate and is the whole
   point — serving it in an <iframe> (what this file used to do) meant Google
   indexed "/" as a page with no text, no headings and a placeholder title,
   because iframe content is crawled as its own URL and is not credited to the
   parent page.

   The CRA dev server has no _redirects, so `npm start` would show a blank "/"
   without this. The iframe stands in for the rewrite locally. If you are
   changing the homepage, edit public/marketing/home.html — not this file —
   and check it at /marketing/home.html, which is what production serves.

   The design carries its own nav, footer and dark-mode toggle, so this route
   sits outside the app Header/Footer. */

export default function HomePage() {
  return (
    <iframe
      src="/marketing/home.html"
      title="Planie"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
    />
  );
}
