import { Link, NavLink } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";

export default function Header() {
  // shared utility classes
  const base =
    "px-3 py-2 text-sm font-medium transition hover:text-white";
  const active = "text-white border-b-2 border-white";
  const inactive = "text-white/80";

  return (
    <header className="bg-black">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* logo + brand */}
        <Link to="/" className="flex items-center gap-2">
          <img src={PlanieLogo} alt="Planie logo" className="h-8 w-auto" />
          <span className="text-white text-xl font-bold">Planie</span>
        </Link>

        {/* navigation */}
        <nav className="flex gap-4">
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
