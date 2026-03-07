import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ArrowRight, Phone } from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";
import "./PartnerLoginPage.css";

export default function PartnerLoginPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className="pl-page">
      {/* ── Left Branded Panel (desktop only) ── */}
      <div className="pl-left">
        <div className="pl-left-decor">
          <div className="pl-blob-1" />
          <div className="pl-blob-2" />
          <div className="pl-dots" />
        </div>

        <div className="pl-left-content">
          <img src={PlanieLogo} alt="Planie" className="pl-left-logo" />
          <h2 className="pl-left-heading">
            Grow your business with <span>Planie</span>
          </h2>
          <p className="pl-left-sub">
            Join thousands of partners reaching high-intent travelers at the
            exact moment they're planning their trip.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="pl-right">
        <div className="pl-form-wrapper">
          <Link to="/partners" className="pl-back pl-animate pl-delay-1">
            <ArrowLeft />
            Back
          </Link>

          {/* Mobile-only logo */}
          <div className="pl-mobile-logo pl-animate pl-delay-1">
            <img src={PlanieLogo} alt="Planie" />
            <p className="pl-mobile-tagline">
              Plan your perfect trip with AI-powered itineraries
            </p>
          </div>

          {/* Header */}
          <div className="pl-form-header pl-animate pl-delay-2">
            <h1 className="pl-form-title">Partner Portal</h1>
            <p className="pl-form-subtitle">
              Sign in to manage your business on Planie
            </p>
          </div>

          {/* Email input */}
          <div className="pl-animate pl-delay-3">
            <div className="pl-email-group">
              <label className="pl-email-label">Email address</label>
              <div className="pl-email-input-wrap">
                <input
                  type="email"
                  className="pl-email-input"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail />
              </div>
            </div>

            <button className="pl-continue-btn" onClick={() => navigate("/partners/dashboard")}>
              <span>Continue with Email</span>
              <ArrowRight strokeWidth={2.2} />
            </button>
          </div>

          {/* Divider */}
          <div className="pl-divider pl-animate pl-delay-4">
            <div className="pl-divider-line" />
            <span className="pl-divider-text">or continue with</span>
            <div className="pl-divider-line" />
          </div>

          {/* Social Login Buttons */}
          <div className="pl-social-buttons pl-animate pl-delay-5">
            <button className="pl-social-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button className="pl-social-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000"/>
              </svg>
              <span>Continue with Apple</span>
            </button>

            <button className="pl-social-btn pl-social-btn--phone">
              <Phone size={20} strokeWidth={2} />
              <span>Continue with Phone</span>
            </button>
          </div>

          {/* Footer */}
          <div className="pl-footer pl-animate pl-delay-7">
            <p>
              By continuing, you agree to our{" "}
              <a href="/terms">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
