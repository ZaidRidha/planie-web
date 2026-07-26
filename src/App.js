import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./Pages/HomePage";
import PlacementWorks from "./Pages/PlacementWorks";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsOfService from "./Pages/TermsOfService";
import ContactPage from "./Pages/ContactPage";
import PartnerLoginPage from "./Pages/PartnerLoginPage";
import PartnerDashboard from "./Pages/PartnerDashboard";
import AddListing from "./Pages/AddListing";
import EditListing from "./Pages/EditListing";
import AddPromotion from "./Pages/AddPromotion";
import Campaigns from "./Pages/Campaigns";
import GeoPage from "./Pages/GeoPage";
import SharedItinerary from "./Pages/SharedItinerary";
import AdminReview from "./Pages/AdminReview";
import { PartnerAuthProvider, RequirePartnerAuth } from "./Context/PartnerAuthContext";
import { RequireVerifiedEmail } from "./Components/VerifyEmailScreen";
import DarkModeToggle from "./Components/DarkModeToggle";
import "./index.css"; // Tailwind directives live here

// Portal pages require a signed-in partner account with a verified email
// (the email step is part of account creation; Google sign-ins skip it).
const guarded = (element) => (
  <RequirePartnerAuth>
    <RequireVerifiedEmail>{element}</RequireVerifiedEmail>
  </RequirePartnerAuth>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <DarkModeToggle />
      <PartnerAuthProvider>
      <Routes>
        {/* Partner pages — standalone, no header/footer */}
        <Route path="/partners/login" element={<PartnerLoginPage />} />
        <Route path="/partners/dashboard" element={guarded(<PartnerDashboard />)} />
        <Route path="/partners/add-listing" element={guarded(<AddListing />)} />
        <Route path="/partners/edit-listing/:slug" element={guarded(<EditListing />)} />
        <Route path="/partners/add-promotion" element={guarded(<AddPromotion />)} />
        <Route path="/partners/edit-promotion/:id" element={guarded(<AddPromotion />)} />
        <Route path="/partners/campaigns" element={guarded(<Campaigns />)} />
        <Route path="/partners/geo" element={guarded(<GeoPage />)} />
        <Route path="/partners/admin" element={guarded(<AdminReview />)} />
        <Route path="/share/:shareCode" element={<SharedItinerary />} />

        {/* Homepage — the design's full-viewport marketing page (own nav+footer),
            so it sits outside the app Header/Footer. */}
        <Route path="/" element={<HomePage />} />

        {/* Main layout (secondary public pages get the app Header/Footer) */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {/* The new design has no standalone partners-marketing page —
                      business marketing lives on the Homepage + /placements, and
                      "Partners" is the sign-in/up door. */}
                  <Route path="/partners" element={<Navigate to="/partners/login" replace />} />
                  <Route path="/placements" element={<PlacementWorks />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
      </PartnerAuthProvider>
    </Router>
  );
}

export default App;
