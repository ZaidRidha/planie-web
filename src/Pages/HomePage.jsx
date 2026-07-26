/* HomePage — the public marketing homepage.

   This page is the designers' actual homepage (an intricate, fully-animated
   scroll experience: intro route-draw, hero typewriter, interactive plan
   switcher, scroll-driven "ink theatre", marquees, and dozens of reveals).
   Rather than risk re-implementing 900 lines of bespoke choreography, we serve
   their real file from public/marketing/home.html (its internal Privacy/Terms/
   Contact/Partners/Placements links were rewritten to our routes with
   target="_top" so they navigate the app). Rendered full-viewport — the design
   carries its own nav + footer, so this route sits outside the app Header/Footer. */

export default function HomePage() {
  return (
    <iframe
      src="/marketing/home.html"
      title="Planie"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
    />
  );
}
