import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Globe,
  Mail,
  X,
  LogOut,
  LayoutDashboard,
  Store,
  TrendingUp,
  Settings,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import PlanieLogo from "../Assets/Images/PlanieLogo1.png";
import "./PartnerDashboard.css";
import "./AddListing.css";

const categories = [
  "Restaurant & Bar",
  "Activity & Tour",
  "Wellness & Spa",
  "Hotel & Resort",
  "Shopping & Market",
  "Nightlife & Entertainment",
  "Museum & Gallery",
  "Outdoor & Adventure",
];

const priceRanges = ["Free", "$", "$$", "$$$", "$$$$"];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/partners/dashboard" },
  { icon: Store, label: "My Listings", path: "/partners/dashboard" },
  { icon: TrendingUp, label: "Analytics", path: "/partners/dashboard" },
  { icon: CreditCard, label: "Billing", path: "/partners/dashboard" },
  { icon: Settings, label: "Settings", path: "/partners/dashboard" },
];

/* Mock listing data matching the dashboard */
const mockListings = {
  "sunset-rooftop-bar": {
    name: "Sunset Rooftop Bar",
    category: "Restaurant & Bar",
    description: "A stunning rooftop bar with panoramic views of the Marrakech medina. Craft cocktails & live music.",
    address: "42 Rue de la Kasbah",
    city: "Marrakech",
    country: "Morocco",
    priceRange: "$$$",
    phone: "+212 524 123 456",
    email: "hello@sunsetrooftop.com",
    website: "https://sunsetrooftop.com",
    hours: daysOfWeek.map((day) => ({
      day,
      open: day === "Sunday" ? "12:00" : "16:00",
      close: "01:00",
      closed: false,
    })),
  },
  "desert-safari-tours": {
    name: "Desert Safari Tours",
    category: "Activity & Tour",
    description: "Thrilling desert safaris with dune bashing, camel rides, and traditional Bedouin camp dinners.",
    address: "Sheikh Zayed Road, Tower 3",
    city: "Dubai",
    country: "UAE",
    priceRange: "$$$$",
    phone: "+971 4 555 7890",
    email: "book@desertsafari.ae",
    website: "https://desertsafari.ae",
    hours: daysOfWeek.map((day) => ({
      day,
      open: "06:00",
      close: "22:00",
      closed: false,
    })),
  },
  "coastal-yoga-retreat": {
    name: "Coastal Yoga Retreat",
    category: "Wellness & Spa",
    description: "A beachfront wellness retreat offering daily yoga, meditation sessions, and organic cuisine.",
    address: "Jl. Pantai Berawa No. 88",
    city: "Bali",
    country: "Indonesia",
    priceRange: "$$$",
    phone: "+62 361 847 5200",
    email: "namaste@coastalyoga.com",
    website: "https://coastalyoga.com",
    hours: daysOfWeek.map((day) => ({
      day,
      open: "06:00",
      close: "20:00",
      closed: day === "Monday",
    })),
  },
  "old-town-walking-tour": {
    name: "Old Town Walking Tour",
    category: "Activity & Tour",
    description: "Discover hidden gems and centuries of history on this expertly guided walking tour.",
    address: "Old Town Square 1",
    city: "Prague",
    country: "Czech Republic",
    priceRange: "$$",
    phone: "+420 234 567 890",
    email: "info@praguewalks.cz",
    website: "https://praguewalks.cz",
    hours: daysOfWeek.map((day) => ({
      day,
      open: "09:00",
      close: "18:00",
      closed: day === "Sunday",
    })),
  },
  "neon-night-market": {
    name: "Neon Night Market",
    category: "Shopping & Market",
    description: "Bangkok's most vibrant night market with street food, local crafts, and live entertainment.",
    address: "Ratchadaphisek Road, Soi 4",
    city: "Bangkok",
    country: "Thailand",
    priceRange: "$",
    phone: "+66 2 123 4567",
    email: "info@neonnightmarket.th",
    website: "https://neonnightmarket.th",
    hours: daysOfWeek.map((day) => ({
      day,
      open: "17:00",
      close: "00:00",
      closed: day === "Monday" || day === "Tuesday",
    })),
  },
};

export default function EditListing() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const listingData = mockListings[slug];
  const [saved, setSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [form, setForm] = useState(
    listingData || {
      name: "",
      category: "",
      description: "",
      address: "",
      city: "",
      country: "",
      priceRange: "",
      phone: "",
      email: "",
      website: "",
      hours: daysOfWeek.map((day) => ({
        day,
        open: "09:00",
        close: "17:00",
        closed: false,
      })),
    }
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateHours = (index, field, value) => {
    setForm((prev) => {
      const hours = [...prev.hours];
      hours[index] = { ...hours[index], [field]: value };
      return { ...prev, hours };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImagePreview((prev) => [...prev, ...newPreviews].slice(0, 6));
  };

  const removeImage = (index) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="pd-layout">
        <Sidebar />
        <main className="pd-main">
          <div className="al-success pd-animate pd-d1">
            <div className="al-success-icon">
              <CheckCircle size={48} strokeWidth={1.5} />
            </div>
            <h2>Changes Saved!</h2>
            <p>Your listing has been updated successfully. Changes will be reflected shortly.</p>
            <div className="al-success-actions">
              <Link to="/partners/dashboard" className="pd-btn pd-btn--primary">
                Back to Dashboard
              </Link>
              <button
                className="pd-btn pd-btn--outline"
                onClick={() => setSaved(false)}
              >
                Continue Editing
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="pd-layout">
        <Sidebar />
        <main className="pd-main">
          <div className="al-success pd-animate pd-d1">
            <div className="al-success-icon" style={{ background: "#FEF2F2", color: "#EF4444" }}>
              <X size={48} strokeWidth={1.5} />
            </div>
            <h2>Listing Not Found</h2>
            <p>The listing you're trying to edit doesn't exist or has been removed.</p>
            <div className="al-success-actions">
              <Link to="/partners/dashboard" className="pd-btn pd-btn--primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pd-layout">
      <Sidebar />

      <main className="pd-main">
        {/* Header */}
        <header className="al-header pd-animate pd-d1">
          <button className="al-back" onClick={() => navigate("/partners/dashboard")}>
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div>
            <h1 className="pd-greeting">Edit Listing</h1>
            <p className="pd-greeting-sub">Update the details for {form.name}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="al-form">
          {/* Basic Info */}
          <section className="pd-card al-section pd-animate pd-d1">
            <h3 className="al-section-title">Basic Information</h3>

            <div className="al-field">
              <label className="al-label">Business Name *</label>
              <input
                type="text"
                className="al-input"
                placeholder="e.g. Sunset Rooftop Bar"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="al-field">
              <label className="al-label">Category *</label>
              <div className="al-category-grid">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`al-category-chip ${form.category === cat ? "al-category-chip--active" : ""}`}
                    onClick={() => updateField("category", cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="al-field">
              <label className="al-label">Description *</label>
              <textarea
                className="al-textarea"
                placeholder="Tell travelers what makes your business special..."
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
              />
              <span className="al-hint">{form.description.length}/500 characters</span>
            </div>
          </section>

          {/* Photos */}
          <section className="pd-card al-section pd-animate pd-d2">
            <h3 className="al-section-title">Photos</h3>
            <p className="al-section-sub">Upload up to 6 photos. The first image will be your cover photo.</p>

            <div className="al-photos-grid">
              {imagePreview.map((img, i) => (
                <div key={i} className="al-photo-thumb">
                  <img src={img.url} alt={img.name} />
                  <button type="button" className="al-photo-remove" onClick={() => removeImage(i)}>
                    <X size={14} strokeWidth={2.5} />
                  </button>
                  {i === 0 && <span className="al-photo-cover">Cover</span>}
                </div>
              ))}

              {imagePreview.length < 6 && (
                <label className="al-photo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    hidden
                  />
                  <Upload size={24} strokeWidth={1.6} />
                  <span>Upload</span>
                </label>
              )}
            </div>
          </section>

          {/* Location */}
          <section className="pd-card al-section pd-animate pd-d2">
            <h3 className="al-section-title">
              <MapPin size={18} strokeWidth={2} /> Location
            </h3>

            <div className="al-field">
              <label className="al-label">Street Address *</label>
              <input
                type="text"
                className="al-input"
                placeholder="123 Main Street"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
              />
            </div>

            <div className="al-row">
              <div className="al-field al-field--half">
                <label className="al-label">City *</label>
                <input
                  type="text"
                  className="al-input"
                  placeholder="Marrakech"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />
              </div>
              <div className="al-field al-field--half">
                <label className="al-label">Country *</label>
                <input
                  type="text"
                  className="al-input"
                  placeholder="Morocco"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {/* Price Range */}
          <section className="pd-card al-section pd-animate pd-d3">
            <h3 className="al-section-title">
              <DollarSign size={18} strokeWidth={2} /> Price Range
            </h3>
            <div className="al-price-row">
              {priceRanges.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`al-price-chip ${form.priceRange === p ? "al-price-chip--active" : ""}`}
                  onClick={() => updateField("priceRange", p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Operating Hours */}
          <section className="pd-card al-section pd-animate pd-d3">
            <h3 className="al-section-title">
              <Clock size={18} strokeWidth={2} /> Operating Hours
            </h3>

            <div className="al-hours-list">
              {form.hours.map((h, i) => (
                <div key={h.day} className="al-hours-row">
                  <span className="al-hours-day">{h.day}</span>
                  <label className="al-hours-toggle">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) => updateHours(i, "closed", e.target.checked)}
                    />
                    <span className="al-toggle-label">Closed</span>
                  </label>
                  {!h.closed && (
                    <div className="al-hours-times">
                      <input
                        type="time"
                        className="al-time-input"
                        value={h.open}
                        onChange={(e) => updateHours(i, "open", e.target.value)}
                      />
                      <span className="al-hours-sep">to</span>
                      <input
                        type="time"
                        className="al-time-input"
                        value={h.close}
                        onChange={(e) => updateHours(i, "close", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="pd-card al-section pd-animate pd-d4">
            <h3 className="al-section-title">Contact Information</h3>

            <div className="al-row">
              <div className="al-field al-field--half">
                <label className="al-label">
                  <Phone size={14} strokeWidth={2} /> Phone
                </label>
                <input
                  type="tel"
                  className="al-input"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div className="al-field al-field--half">
                <label className="al-label">
                  <Mail size={14} strokeWidth={2} /> Email
                </label>
                <input
                  type="email"
                  className="al-input"
                  placeholder="hello@business.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </div>

            <div className="al-field">
              <label className="al-label">
                <Globe size={14} strokeWidth={2} /> Website
              </label>
              <input
                type="url"
                className="al-input"
                placeholder="https://yourbusiness.com"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
              />
            </div>
          </section>

          {/* Submit */}
          <div className="al-submit-row pd-animate pd-d4">
            <Link to="/partners/dashboard" className="pd-btn pd-btn--outline">
              Cancel
            </Link>
            <button type="submit" className="pd-btn pd-btn--primary al-submit-btn">
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* Sidebar (reused from dashboard) */
function Sidebar() {
  return (
    <aside className="pd-sidebar">
      <div>
        <Link to="/" className="pd-logo">
          <img src={PlanieLogo} alt="Planie" />
        </Link>
        <nav className="pd-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.path} className="pd-nav-btn">
                <Icon size={18} strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <Link to="/partners/login" className="pd-nav-btn pd-nav-btn--out">
        <LogOut size={18} strokeWidth={1.7} />
        <span>Sign Out</span>
      </Link>
    </aside>
  );
}
