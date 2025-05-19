// src/components/Footer.js
import FacebookIcon from "../Assets/Images/FacebookIcon.png";
import XIcon from "../Assets/Images/XIcon.png"; // Twitter / X
import InstagramIcon from "../Assets/Images/InstagramIcon.png";
import TikTokIcon from "../Assets/Images/TiktokIcon.png";

export default function Footer() {
  return (
    <footer className="w-full py-10 bg-white">
      {/* Wrapper flex – smaller icons and tighter spacing */}
      <div className="flex items-center justify-center gap-8 sm:gap-14 md:gap-20 lg:gap-28">
        {[
          { href: "#", label: "Facebook", icon: FacebookIcon },
          { href: "#", label: "X / Twitter", icon: XIcon },
          { href: "#", label: "Instagram", icon: InstagramIcon },
          { href: "#", label: "TikTok", icon: TikTokIcon },
        ].map(({ href, label, icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src={icon}
              alt={label}
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
            />
          </a>
        ))}
      </div>
    </footer>
  );
}
