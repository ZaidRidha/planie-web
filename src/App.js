import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import HomePage from "./Pages/HomePage";
import PartnerPage from "./Pages/PartnerPage";
import PartnerLoginPage from "./Pages/PartnerLoginPage";
import PartnerDashboard from "./Pages/PartnerDashboard";
import AddListing from "./Pages/AddListing";
import EditListing from "./Pages/EditListing";
import "./index.css"; // Tailwind directives live here

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
      <Routes>
        {/* Partner pages — standalone, no header/footer */}
        <Route path="/partners/login" element={<PartnerLoginPage />} />
        <Route path="/partners/dashboard" element={<PartnerDashboard />} />
        <Route path="/partners/add-listing" element={<AddListing />} />
        <Route path="/partners/edit-listing/:slug" element={<EditListing />} />

        {/* Main layout */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/partners" element={<PartnerPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
