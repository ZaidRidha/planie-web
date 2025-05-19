// src/components/Footer.js
import FacebookIcon from "../Assets/Images/FacebookIcon.png";
import XIcon from "../Assets/Images/XIcon.png"; // Twitter / X
import InstagramIcon from "../Assets/Images/InstagramIcon.png";
import TikTokIcon from "../Assets/Images/TiktokIcon.png";

export default function Footer() {
  return (
    <footer className="w-full py-16 bg-white">
      <div className="flex items-center justify-center gap-20">
        <a
          href="#"
          aria-label="Facebook"
          className=""
        >
          <img src={FacebookIcon} alt="Facebook" className="h-8 w-8" />
        </a>
        <a
          href="#"
          aria-label="X / Twitter"
          className=""
        >
          <img src={XIcon} alt="X" className="h-8 w-8" />
        </a>
        <a
          href="#"
          aria-label="Instagram"
          className=""
        >
          <img src={InstagramIcon} alt="Instagram" className="h-8 w-8" />
        </a>
        <a
          href="#"
          aria-label="TikTok"
          className=""
        >
          <img src={TikTokIcon} alt="TikTok" className="h-8 w-8" />
        </a>
      </div>
    </footer>
  );
}
