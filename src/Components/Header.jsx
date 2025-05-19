import { Link, NavLink } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";

export default function Header() {
  const base = "px-3 py-2 text-base font-medium transition";
  const active = "text-white border-b-2 border-white";
  const inactive = "text-white/80 hover:text-white";

  return (
    <header className="bg-black">
      {/* Grid:  1fr  auto  1fr  →   nav stays dead-centre, logo hugs it */}
      <div
        className="
          relative container mx-auto
          grid grid-cols-3 md:grid-cols-[1fr_auto_1fr] items-center
          px-4 py-4
        "
      >
        {/* ─── Logo ─────────────────────────────────────────────── */}
        <Link
          to="/"
          className="
            flex items-center gap-2
            justify-self-start md:justify-self-end md:pr-10
          "
        >
          <img src={PlanieLogo} alt="Planie logo" className="h-10 w-auto" />
        </Link>

        {/* ─── Nav (always perfectly centred) ───────────────────── */}
        <nav
          className="
            flex gap-6
            w-full justify-center md:w-auto md:justify-self-center
          "
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
