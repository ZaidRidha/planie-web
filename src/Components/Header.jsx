import { Link, NavLink } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";

export default function Header() {
  const base = "px-3 py-2 text-base font-medium transition";
  const active = "text-white border-b-2 border-white";
  const inactive = "text-white/80 hover:text-white";

  return (
    <header className="bg-black">
      <div className="container mx-auto flex items-center justify-center gap-6 px-4 py-4">
        {/* logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={PlanieLogo} alt="Planie logo" className="h-10 w-auto" />
        </Link>

        {/* navigation */}
        <nav className="flex gap-6">
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
