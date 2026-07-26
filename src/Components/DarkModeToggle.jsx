/* DarkModeToggle — floating sun/moon button (bottom-right), from the new
   design. Persists to localStorage key `plie-theme` (default light) and
   toggles `.plie-dark` on <html>, which drives the invert filter in
   override.css. Mounted once in App. */

import { useEffect, useState } from "react";

const KEY = "plie-theme";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(KEY) === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("plie-dark", dark);
    try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch { /* ignore */ }
  }, [dark]);

  return (
    <button
      id="plie-theme-toggle"
      data-noinvert=""
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
