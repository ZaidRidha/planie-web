import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          Planie
        </Link>

        {/* Navigation */}
        <nav className="space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/partners"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            }
          >
            Partners
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
