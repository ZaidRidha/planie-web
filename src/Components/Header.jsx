import { Link, NavLink } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";

export default function Header() {
  const base = "px-3 py-2 text-base font-medium transition";
  const active = "text-white border-b-2 border-white";
  const inactive = "text-white/80 hover:text-white";

  return (
    <header className="bg-black">
      {/*  relative so the nav can centre itself absolutely on smaller screens */}
      <div className="relative container mx-auto grid grid-cols-3 items-center px-4 py-4">
        {/* ─── Col 1: Logo ─────────────────────────────── */}
        <Link
          to="/"
          className="flex items-center gap-2 justify-self-start
                     col-start-1"
        >
          <img src={PlanieLogo} alt="Planie logo" className="h-10 w-auto" />
        </Link>

        {/* ─── Col 2: Nav – always dead-centre ─────────── */}
        <nav
          className="flex gap-6 justify-self-center
                     w-full justify-center md:w-auto"
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
