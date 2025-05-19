import { Link, NavLink } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";

export default function Header() {
  const base = "px-3 py-2 text-base font-medium transition";
  const active = "text-white border-b-2 border-white";
  const inactive = "text-white/80 hover:text-white";

  return (
    <header className="bg-black">
      {/* 1️⃣  relative so the logo can go absolute on mobile */}
      <div className="relative container mx-auto flex items-center justify-center gap-6 px-4 py-4">
        {/* 2️⃣  logo: absolute-left on mobile, normal in flow from md-up  */}
        <Link
          to="/"
          className="flex items-center gap-2
                     absolute left-4 top-1/2 -translate-y-1/2
                     md:static md:translate-y-0"
        >
          <img src={PlanieLogo} alt="Planie logo" className="h-10 w-auto" />
        </Link>

        {/* 3️⃣  Nav takes full width on mobile and centers its own items. */}
        {/*    On desktop, it reverts to auto width to be centered with the logo. */}
        <nav
          className="flex items-center gap-6
                     w-full justify-center      /* Mobile: nav is full-width, centers its children */
                     md:w-auto md:justify-start 
                     ml-5 /* Desktop: nav is auto-width, children align to start (or use md:justify-center if preferred) */"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/partners"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            Partners
          </NavLink>
        </nav>
      </div>
    </header>
  );
}