import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogoNew.svg";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Partners", to: "/partners" },
    { label: "How placement works", to: "/placements" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#FAF7F1]/90 backdrop-blur-xl border-b border-[#1C1114]/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="relative flex items-center justify-between h-[72px]">
          {/* â”€â”€â”€ Logo â”€â”€â”€ */}
          <Link to="/" className="relative z-10 shrink-0 group">
            <img
              src={PlanieLogo}
              alt="Planie"
              className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* â”€â”€â”€ Desktop Nav (truly centered) â”€â”€â”€ */}
          <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative text-[15px] font-medium tracking-[-0.01em] transition-colors duration-300 py-1 ${
                    isActive
                      ? "text-[#FF4040]"
                      : "text-[#1C1114]/60 hover:text-[#1C1114]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-[#FF4040] transition-all duration-300 ease-out ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* â”€â”€â”€ Right Side â”€â”€â”€ */}
          <div className="flex items-center gap-3">
            <Link
              to="/partners/login"
              className="hidden md:inline-flex items-center px-6 py-2.5 bg-[#1C1114] text-white text-sm font-semibold rounded-full
                transition-all duration-300
                hover:bg-[#FF4040] hover:-translate-y-[1px]
                active:translate-y-0 active:shadow-[0_4px_15px_rgba(255,64,64,0.2)]"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#1C1114] hover:bg-[#1C1114]/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ Mobile Menu â”€â”€â”€ */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#FAF7F1]/95 backdrop-blur-xl border-t border-[#1C1114]/10 px-6 py-5 space-y-1">
          {navItems.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "text-[#FF4040] bg-red-50"
                    : "text-[#1C1114]/70 hover:text-[#1C1114] hover:bg-[#1C1114]/5"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-3">
            <Link
              to="/partners/login"
              onClick={() => setMobileOpen(false)}
              className="block text-center px-6 py-3 bg-[#1C1114] text-white font-semibold rounded-full
                hover:bg-[#FF4040] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
