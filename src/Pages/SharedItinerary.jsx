import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import AppStoreBadge from "../Assets/Images/AppStoreBadge.svg";
import GooglePlayBadge from "../Assets/Images/GooglePlayBadge.png";

const APP_STORE_URL = "https://apps.apple.com/app/planie/id6743697663";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.useplanie.planiepreview";

export default function SharedItinerary() {
  const { shareCode } = useParams();
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    if (!shareCode) {
      setShowDownload(true);
      return;
    }

    // Try to open the app via custom URL scheme
    window.location.href = `planie://share/${shareCode}`;

    // If the page is still active after 2.5s, the app isn't installed
    const timer = setTimeout(() => {
      setShowDownload(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [shareCode]);

  const handleOpenApp = () => {
    window.location.href = `planie://share/${shareCode}`;
    setTimeout(() => setShowDownload(true), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F6] to-white flex flex-col items-center justify-center px-6">
      <img src={PlanieLogo} alt="Planie" className="h-10 w-auto mb-10" />

      {!showDownload ? (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF4040]/20 border-t-[#FF4040] rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-xl font-semibold text-[#11181C] mb-2">Opening Planie...</h1>
          <p className="text-[#687076] text-sm">
            If the app doesn&apos;t open automatically,<br />download it below.
          </p>
        </div>
      ) : (
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-[#FF4040]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF4040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-[#11181C] mb-3">
            Someone shared a trip with you!
          </h1>
          <p className="text-[#687076] text-sm leading-relaxed mb-8">
            Open the Planie app to view this shared itinerary. Don&apos;t have it yet? Download it free below.
          </p>

          <button
            onClick={handleOpenApp}
            className="w-full py-3.5 bg-[#FF4040] text-white font-semibold rounded-full mb-8
              hover:bg-[#e63636] hover:shadow-[0_8px_30px_rgba(255,64,64,0.3)] hover:-translate-y-[1px]
              transition-all duration-300 active:translate-y-0"
          >
            Open in Planie
          </button>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

          <p className="text-xs font-semibold uppercase tracking-widest text-[#687076]/50 mb-5">
            Download the app
          </p>

          <div className="flex flex-col items-center gap-1">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
            >
              <img
                src={AppStoreBadge}
                alt="Download on the App Store"
                className="h-[44px] w-auto"
              />
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 -ml-3"
            >
              <img
                src={GooglePlayBadge}
                alt="Get it on Google Play"
                className="h-[62px] w-auto"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
