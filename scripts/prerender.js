/* prerender.js - static HTML for the React marketing routes.

   Runs as `postbuild` (so on Netlify too, as long as the build command is
   `npm run build`). It serves ./build locally, opens every URL listed in
   public/sitemap.xml except "/" (the homepage is already a static file) in
   headless Chrome, and writes the rendered document to build/prerender/.
   It then inserts one rewrite rule per page at the top of build/_redirects,
   so Netlify serves the rendered file for that exact URL and the SPA
   fallback stays in charge of everything else.

   Why files + rewrite rules rather than build/guides/index.html: Netlify
   redirects directory indexes to a trailing slash, which would change the
   guide URLs away from what the canonicals and sitemap say.

   Why it matters: Googlebot renders JS on a delayed second pass and most
   other crawlers never do. With this, the first response already carries the
   article text, the per-route <title>/description/canonical and the JSON-LD.

   The client bundle still loads and React re-renders into #root as normal,
   so nothing about the pages' behaviour changes. useSeo (src/utils/seo.js)
   replaces the prerendered head tags rather than duplicating them.

   This step must never break a deploy: any failure is logged and the script
   exits 0, leaving the plain SPA build in place. */

const fs = require("fs");
const path = require("path");
const http = require("http");

const BUILD = path.resolve(__dirname, "..", "build");
const OUT_DIR = "prerender";
const SITE_URL = "https://useplanie.com";
const RENDER_TIMEOUT_MS = 20000;

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".webp": "image/webp", ".txt": "text/plain", ".xml": "application/xml",
};

function routesFromSitemap() {
  const xml = fs.readFileSync(path.join(BUILD, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((m) => m[1].replace(SITE_URL, "") || "/")
    .filter((p) => p !== "/");
}

/* Minimal static server with the same SPA fallback Netlify applies. */
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
      let file = path.join(BUILD, urlPath);
      if (!file.startsWith(BUILD) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        file = path.join(BUILD, "index.html");
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

/* Head tags the app manages per route. These are stripped from the template
   and replaced by the rendered page's versions. */
const MANAGED_HEAD = /<title>[\s\S]*?<\/title>|<meta\s[^>]*?(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>|<link\s[^>]*rel="canonical"[^>]*>|<script[^>]*data-seo[^>]*>[\s\S]*?<\/script>/g;

function outFile(route) {
  return OUT_DIR + "/" + route.replace(/^\//, "").replace(/\//g, "__") + ".html";
}

async function main() {
  const puppeteer = require("puppeteer");
  const template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
  const routes = routesFromSitemap();
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const written = [];

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      try {
        await page.goto(origin + route, { waitUntil: "load", timeout: RENDER_TIMEOUT_MS });
        await page.waitForFunction(() => document.getElementById("root").children.length > 0, { timeout: RENDER_TIMEOUT_MS });
        // Give useSeo's effect and any entrance animations a moment to settle.
        await new Promise((r) => setTimeout(r, 500));

        // The client redirects unknown slugs to /guides; do not freeze that.
        const finalPath = new URL(page.url()).pathname;
        if (finalPath !== route) throw new Error(`redirected to ${finalPath}`);

        const rendered = await page.evaluate(() => ({
          head: [...document.head.querySelectorAll(
            'title, meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"][data-seo]'
          )].map((el) => el.outerHTML).join("\n"),
          root: document.getElementById("root").innerHTML,
        }));

        const html = template
          .replace(MANAGED_HEAD, "")
          .replace("</head>", rendered.head + "\n</head>")
          .replace('<div id="root"></div>', `<div id="root">${rendered.root}</div>`);

        const rel = outFile(route);
        fs.mkdirSync(path.join(BUILD, path.dirname(rel)), { recursive: true });
        fs.writeFileSync(path.join(BUILD, rel), html);
        written.push([route, "/" + rel]);
        console.log(`prerendered ${route}`);
      } catch (err) {
        console.warn(`prerender: skipped ${route}: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (written.length === 0) return;

  // Exact-match rewrites, placed before the SPA fallback. Rules are matched in
  // order; a route not listed here still falls through to index.html.
  const redirectsPath = path.join(BUILD, "_redirects");
  const existing = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, "utf8") : "";
  const rules = [
    "# Prerendered routes (generated by scripts/prerender.js at build time).",
    ...written.map(([route, file]) => `${route}  ${file}  200`),
    "",
  ].join("\n");
  fs.writeFileSync(redirectsPath, rules + "\n" + existing);
  console.log(`prerender: ${written.length} routes, rules written to build/_redirects`);
}

main().catch((err) => {
  console.warn(`prerender: failed, deploying plain SPA build instead: ${err.message}`);
  process.exitCode = 0;
});
