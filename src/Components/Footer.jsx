import { Link } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import FacebookIcon from "../Assets/Images/FacebookIcon.png";
import XIcon from "../Assets/Images/XIcon.png";
import InstagramIcon from "../Assets/Images/InstagramIcon.png";
import TikTokIcon from "../Assets/Images/TiktokIcon.png";
import AppStoreBadge from "../Assets/Images/AppStoreBadge.svg";
import GooglePlayBadge from "../Assets/Images/GooglePlayBadge.png";

const socialLinks = [
  { href: "https://www.facebook.com/profile.php?id=61579370284503&ref=PROFILE_EDIT_xav_ig_profile_page_web#", label: "Facebook", icon: FacebookIcon },
  { href: "#", label: "X / Twitter", icon: XIcon },
  { href: "https://www.instagram.com/use_planie/", label: "Instagram", icon: InstagramIcon },
  { href: "#", label: "TikTok", icon: TikTokIcon },
];

const footerNav = [
  { label: "Home", to: "/" },
  { label: "Partners", to: "/partners" },
  { label: "Blog", to: "/blog" },
];

export default function Footer() {
  return (
    <footer className="relative w-full">
      {/* Subtle gradient top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* ─── Main Footer ─── */}
      <div className="bg-gradient-to-b from-[#FFF8F6] to-[#FFF3EF]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

            {/* ── Column 1: Brand ── */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="inline-block mb-4">
                <img src={PlanieLogo} alt="Planie" className="h-8 w-auto" />
              </Link>
              <p className="text-sm text-[#687076] leading-relaxed max-w-xs">
                AI-powered travel planning that builds your perfect
                day-by-day itinerary in minutes.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-6">
                {socialLinks.map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border border-gray-100
                      transition-all duration-300 hover:border-[#FF4040]/20 hover:bg-[#FF4040]/[0.06] hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <img src={icon} alt={label} className="h-4 w-4 transition-opacity group-hover:opacity-80" />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Column 2: Navigation ── */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#11181C]/40 mb-5">
                Navigation
              </h3>
              <ul className="space-y-3">
                {footerNav.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-[#687076] hover:text-[#FF4040] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Partner ── */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#11181C]/40 mb-5">
                For Business
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/partners"
                    className="text-sm text-[#687076] hover:text-[#FF4040] transition-colors duration-200"
                  >
                    Become a Partner
                  </Link>
                </li>
                <li>
                  <a
                    href="https://partners.planie.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#687076] hover:text-[#FF4040] transition-colors duration-200"
                  >
                    Partner Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@planie.app"
                    className="text-sm text-[#687076] hover:text-[#FF4040] transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* ── Column 4: Download the App ── */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#11181C]/40 mb-5">
                Get the App
              </h3>
              <div className="flex flex-col gap-3">
                {/* App Store Badge */}
                <a
                  href="#"
                  className="inline-block transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
                >
                  <img
                    src={AppStoreBadge}
                    alt="Download on the App Store"
                    className="h-[40px] w-auto"
                  />
                </a>

                {/* Google Play Badge */}
                <a
                  href="#"
                  className="inline-block transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 -ml-3"
                >
                  <img
                    src={GooglePlayBadge}
                    alt="Get it on Google Play"
                    className="h-[60px] w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="border-t border-[#FF4040]/[0.06]">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#687076]/70">
              &copy; {new Date().getFullYear()} Planie. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-[#687076]/70 hover:text-[#FF4040] transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-[#687076]/70 hover:text-[#FF4040] transition-colors duration-200">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
