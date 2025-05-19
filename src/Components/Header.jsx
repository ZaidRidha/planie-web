import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // yarn add lucide-react
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  // shared link classes
  const base = "px-3 py-2 text-base font-medium";
  const active = "text-white border-b-2 border-white";
  const inactive = "text-white/80 hover:text-white";

  return (
    <header className="bg-black">
      <div className="container mx-auto flex items-center justify-center px-4 py-4 relative">
        {/* mobile: hamburger in the top-right */}
        <button
          aria-label="Toggle navigation"
          className="absolute right-4 md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* logo & brand */}
        <Link to="/" className="flex items-center gap-2">
          <img src={PlanieLogo} alt="Planie logo" className="h-8 w-auto" />
        </Link>

        {/* nav links – desktop */}
        <nav className="hidden md:flex gap-6 ml-8">
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

      {/* nav links – mobile dropdown */}
      {open && (
        <nav className="md:hidden bg-black border-t border-white/10">
          <ul className="flex flex-col items-center gap-2 py-4">
            <li>
              <NavLink
                to="/"
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/partners"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }
              >
                Partners
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
