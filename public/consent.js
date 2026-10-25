/* Cookie consent + Google Analytics loader.

   Loaded synchronously in the <head> of both entry points: public/index.html
   (React routes, prerendered guides) and public/marketing/home.html (served
   at /). Plain JS on purpose so the static homepage gets the same banner.

   GA is not loaded at all until the visitor accepts (UK PECR: analytics
   cookies need prior consent). The choice lives in localStorage under
   `planie-consent` and is asked again after 12 months. Any element with a
   `data-cookie-settings` attribute reopens the banner (footer links). */

(function () {
  var GA_ID = "G-75JHGLQL1L";
  var KEY = "planie-consent";
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

  // The homepage used to be embedded in an iframe; never show two banners.
  try { if (window.self !== window.top) return; } catch (e) { return; }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function readChoice() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && typeof c.analytics === "boolean" && Date.now() - c.ts < MAX_AGE_MS) return c.analytics;
    } catch (e) { /* no storage or bad JSON: ask again */ }
    return null;
  }

  function saveChoice(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ analytics: analytics, ts: Date.now() })); } catch (e) {}
  }

  var gaLoaded = false;
  function loadGa() {
    if (gaLoaded) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    gaLoaded = true;
    // No ads on this site: those signals stay denied permanently.
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function revokeGa() {
    if (gaLoaded) window.gtag("consent", "update", { analytics_storage: "denied" });
    // Clear any _ga cookies set before the visitor changed their mind.
    var host = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name === "_ga" || name.indexOf("_ga_") === 0) {
        ["", "; domain=" + host, "; domain=." + host].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }

  var choice = readChoice();
  if (choice === true) loadGa();

  /* ---- Banner ---- */

  var CSS =
    "#plie-consent{position:fixed;left:18px;bottom:18px;z-index:10000;box-sizing:border-box;width:388px;max-width:calc(100vw - 36px);" +
    "padding:22px 22px 20px;border-radius:22px;background:#FAF7F1;color:#1C1114;border:1px solid rgba(28,17,20,0.1);" +
    "box-shadow:0 24px 60px rgba(28,17,20,0.18),0 2px 6px rgba(28,17,20,0.06);font-family:'Instrument Sans',sans-serif;" +
    "-webkit-font-smoothing:antialiased;opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .55s cubic-bezier(0.22,1,0.36,1)}" +
    "#plie-consent.is-in{opacity:1;transform:none}" +
    "#plie-consent *{box-sizing:border-box}" +
    "#plie-consent h2{margin:0 0 8px;font-family:'Gabarito',sans-serif;font-weight:700;font-size:20px;line-height:1.15;letter-spacing:-0.015em;color:#1C1114}" +
    "#plie-consent h2 span{color:#FF4040}" +
    "#plie-consent p{margin:0;font-size:14.5px;line-height:1.55;color:rgba(28,17,20,0.68)}" +
    "#plie-consent p a{color:#1C1114;text-decoration:underline;text-decoration-color:rgba(28,17,20,0.3);text-underline-offset:3px;transition:text-decoration-color .2s}" +
    "#plie-consent p a:hover{text-decoration-color:#FF4040}" +
    "#plie-consent .pc-actions{display:flex;gap:10px;margin-top:18px}" +
    "#plie-consent button{flex:1;margin:0;font-family:'Instrument Sans',sans-serif;font-size:15px;font-weight:600;line-height:1;cursor:pointer;" +
    "padding:13px 18px;border-radius:100px;transition:background .25s,border-color .25s,color .25s,transform .2s}" +
    "#plie-consent button:hover{transform:translateY(-1px)}" +
    "#plie-consent button:focus-visible{outline:2px solid #FF4040;outline-offset:2px}" +
    "#plie-consent .pc-yes{border:1px solid #1C1114;background:#1C1114;color:#FAF7F1}" +
    "#plie-consent .pc-yes:hover{background:#FF4040;border-color:#FF4040}" +
    "#plie-consent .pc-no{border:1px solid rgba(28,17,20,0.2);background:transparent;color:#1C1114}" +
    "#plie-consent .pc-no:hover{border-color:#1C1114}" +
    "@media (max-width:520px){#plie-consent{left:12px;right:12px;bottom:12px;width:auto;max-width:none;padding:20px 18px 18px}}" +
    "@media (prefers-reduced-motion:reduce){#plie-consent{transition:opacity .2s ease;transform:none}}";

  var banner = null;

  function close() {
    if (!banner) return;
    var el = banner;
    banner = null;
    el.classList.remove("is-in");
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
  }

  function decide(analytics) {
    saveChoice(analytics);
    if (analytics) loadGa(); else revokeGa();
    close();
  }

  function open() {
    if (banner) return;
    if (!document.getElementById("plie-consent-css")) {
      var st = document.createElement("style");
      st.id = "plie-consent-css";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    banner = document.createElement("section");
    banner.id = "plie-consent";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML =
      "<h2>Cookies, quickly<span>.</span></h2>" +
      "<p>We’d like to use analytics cookies to see which parts of Planie help people plan, and which don’t. " +
      "Nothing for ads, and nothing until you say yes. <a href=\"/privacy#cookies\">Privacy policy</a></p>" +
      "<div class=\"pc-actions\">" +
      "<button type=\"button\" class=\"pc-no\">No thanks</button>" +
      "<button type=\"button\" class=\"pc-yes\">Accept</button>" +
      "</div>";
    banner.querySelector(".pc-yes").onclick = function () { decide(true); };
    banner.querySelector(".pc-no").onclick = function () { decide(false); };
    document.body.appendChild(banner);
    // Two frames so the transition runs from the initial state.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { if (banner) banner.classList.add("is-in"); });
    });
  }

  window.planieCookieSettings = open;

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cookie-settings]");
    if (t) { e.preventDefault(); open(); }
  });

  function boot() { if (choice === null) setTimeout(open, 600); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
