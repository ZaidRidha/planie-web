import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
import ListingPreview from "../Components/ListingPreview";
import "./PartnerDashboard.css";
import "./AddListing.css";

const activities = [
  "Food & Drink",
  "Tours & Experiences",
  "Wellness & Relaxation",
  "Accommodation",
  "Shopping",
  "Nightlife & Entertainment",
  "Culture & Arts",
  "Outdoor & Adventure",
];

const categoryMap = {
  "Food & Drink": ["Restaurant & Bar", "Café & Coffee", "Street Food & Market", "Fine Dining", "Bakery & Desserts"],
  "Tours & Experiences": ["Walking Tour", "Boat & Cruise", "Food Tour", "Cultural Experience", "Day Trip & Excursion", "Workshop & Class"],
  "Wellness & Relaxation": ["Spa & Massage", "Yoga & Meditation", "Fitness & Gym", "Hot Springs & Hammam", "Retreat Center", "Beauty & Salon"],
  "Accommodation": ["Hotel & Resort", "Boutique Hotel", "Hostel & Budget", "Villa & Rental", "Eco Lodge", "Riad & Guesthouse"],
  "Shopping": ["Night Market", "Artisan Crafts", "Fashion Boutique", "Souvenir Shop", "Flea Market", "Food Market", "Jewelry & Accessories"],
  "Nightlife & Entertainment": ["Club & Dance", "Live Music", "Comedy & Theater", "Rooftop Lounge", "Pub & Bar Crawl", "Casino & Gaming", "Karaoke"],
  "Culture & Arts": ["Art Museum", "History Museum", "Gallery & Exhibition", "Heritage Site", "Science & Interactive", "Sculpture & Outdoor Art"],
  "Outdoor & Adventure": ["Hiking & Trekking", "Water Sports", "Rock Climbing", "Zip Lining & Aerial", "Diving & Snorkeling", "Paragliding", "Kayaking & Canoeing"],
};

const subcategoryMap = {
  "Restaurant & Bar": ["Fine Dining", "Casual Dining", "Rooftop Bar", "Cocktail Lounge", "Seafood", "Brunch Spot", "Pub & Gastropub"],
  "Café & Coffee": ["Specialty Coffee", "Tea House", "Juice & Smoothie Bar", "Coworking Café", "Dessert Café"],
  "Street Food & Market": ["Night Market", "Food Stall", "Food Truck", "Hawker Center", "Pop-up Kitchen"],
  "Fine Dining": ["Tasting Menu", "Michelin Star", "Chef's Table", "Wine Pairing", "Omakase"],
  "Bakery & Desserts": ["Pastry Shop", "Artisan Bakery", "Ice Cream & Gelato", "Chocolate Shop", "Cake & Cupcakes"],
  "Walking Tour": ["Historical Walk", "Neighborhood Stroll", "Architecture Tour", "Ghost & Mystery Tour", "Photography Walk"],
  "Boat & Cruise": ["River Cruise", "Sunset Sail", "Speedboat Tour", "Catamaran Trip", "Fishing Charter"],
  "Food Tour": ["Street Food Tour", "Market Tour", "Wine & Cheese Tasting", "Cooking Class Tour", "Dessert Crawl"],
  "Cultural Experience": ["Traditional Dance", "Music Performance", "Craft Workshop", "Local Festival", "Storytelling & Folklore"],
  "Day Trip & Excursion": ["Mountain Trip", "Island Hopping", "Desert Safari", "Countryside Tour", "Waterfall Visit"],
  "Workshop & Class": ["Cooking Class", "Art & Painting", "Pottery & Ceramics", "Language Lesson", "Dance Class"],
  "Spa & Massage": ["Thai Massage", "Hot Stone", "Aromatherapy", "Couples Spa", "Deep Tissue"],
  "Yoga & Meditation": ["Morning Yoga", "Sunset Yoga", "Sound Healing", "Breathwork", "Silent Meditation"],
  "Fitness & Gym": ["CrossFit", "Boxing", "Pilates", "Personal Training", "Group Class"],
  "Hot Springs & Hammam": ["Natural Hot Springs", "Traditional Hammam", "Onsen", "Thermal Bath", "Sauna & Steam"],
  "Retreat Center": ["Wellness Retreat", "Yoga Retreat", "Digital Detox", "Silent Retreat", "Meditation Retreat"],
  "Beauty & Salon": ["Hair Salon", "Nail Studio", "Facial Treatment", "Makeup & Styling", "Barber Shop"],
  "Hotel & Resort": ["Beach Resort", "All-Inclusive", "Business Hotel", "Spa Resort", "Family Resort"],
  "Boutique Hotel": ["Design Hotel", "Heritage Stay", "Urban Boutique", "Themed Hotel", "Art Hotel"],
  "Hostel & Budget": ["Party Hostel", "Quiet Hostel", "Capsule Hotel", "Dormitory", "Budget Inn"],
  "Villa & Rental": ["Luxury Villa", "Private Pool Villa", "Apartment Rental", "Penthouse", "Cottage"],
  "Eco Lodge": ["Treehouse", "Safari Lodge", "Farm Stay", "Off-grid Cabin", "Sustainable Resort"],
  "Riad & Guesthouse": ["Traditional Riad", "Bed & Breakfast", "Family Guesthouse", "Heritage Home", "Courtyard Stay"],
  "Night Market": ["Food Night Market", "Craft Night Market", "Vintage Market", "Cultural Bazaar"],
  "Artisan Crafts": ["Pottery & Ceramics", "Textiles & Weaving", "Woodwork", "Leather Goods", "Handmade Jewelry"],
  "Fashion Boutique": ["Local Designer", "Vintage & Thrift", "Streetwear", "Luxury Fashion", "Sustainable Fashion"],
  "Souvenir Shop": ["Local Gifts", "Handmade Souvenirs", "Art Prints", "Specialty Items"],
  "Flea Market": ["Antiques Market", "Second-hand Market", "Collectors Market", "Weekend Market"],
  "Food Market": ["Farmers Market", "Spice Market", "Organic Market", "Gourmet Market", "Fish Market"],
  "Jewelry & Accessories": ["Handmade Jewelry", "Gemstones", "Watches", "Leather Accessories", "Silver & Gold"],
  "Club & Dance": ["EDM Club", "Latin Night", "Jazz Club", "Underground Club", "Beach Club"],
  "Live Music": ["Concert Venue", "Acoustic Session", "Jazz Bar", "Open Mic Night", "Music Festival"],
  "Comedy & Theater": ["Stand-up Comedy", "Improv Show", "Dinner Theater", "Broadway-style", "Street Performance"],
  "Rooftop Lounge": ["Sky Bar", "Sunset Lounge", "Pool Lounge", "Cocktail Terrace", "Wine Rooftop"],
  "Pub & Bar Crawl": ["Craft Beer Pub", "Wine Bar Crawl", "Cocktail Tour", "Local Pub Experience", "Themed Bar Hop"],
  "Casino & Gaming": ["Table Games", "Slot Casino", "Poker Room", "VIP Gaming", "Entertainment Casino"],
  "Karaoke": ["Private Room", "Open Stage", "K-Pop Karaoke", "Themed Karaoke", "Karaoke Bar"],
  "Art Museum": ["Modern Art", "Classical Art", "Folk Art", "Digital Art", "Mixed Media"],
  "History Museum": ["Ancient History", "War & Military", "Maritime History", "Natural History", "Archaeology"],
  "Gallery & Exhibition": ["Photography", "Contemporary Art", "Sculpture", "Pop-up Exhibition", "Permanent Collection"],
  "Heritage Site": ["UNESCO Site", "Ancient Ruins", "Historic Quarter", "Castle & Palace", "Sacred Site"],
  "Science & Interactive": ["Planetarium", "Tech Museum", "Children's Museum", "Hands-on Lab", "Innovation Center"],
  "Sculpture & Outdoor Art": ["Sculpture Park", "Mural Walk", "Public Art Trail", "Land Art", "Installation Art"],
  "Hiking & Trekking": ["Day Hike", "Multi-day Trek", "Summit Climb", "Nature Walk", "Volcano Hike"],
  "Water Sports": ["Surfing", "Jet Ski", "Wakeboarding", "Windsurfing", "Stand-up Paddle"],
  "Rock Climbing": ["Indoor Climbing", "Bouldering", "Via Ferrata", "Sport Climbing", "Canyoning"],
  "Zip Lining & Aerial": ["Jungle Zip Line", "Mountain Zip Line", "Rope Course", "Bungee Jump", "Skywalk"],
  "Diving & Snorkeling": ["Scuba Diving", "Reef Snorkeling", "Night Dive", "Wreck Dive", "Freediving"],
  "Paragliding": ["Tandem Flight", "Solo Flight", "Thermal Soaring", "Coastal Flight", "Mountain Launch"],
  "Kayaking & Canoeing": ["Sea Kayak", "River Kayak", "Mangrove Paddle", "Cave Kayaking", "Canoe Safari"],
};

const priceRanges = ["Free", "$", "$$", "$$$", "$$$$"];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/partners/dashboard" },
  { icon: Store, label: "My Listings", path: "/partners/dashboard" },
  { icon: TrendingUp, label: "Analytics", path: "/partners/dashboard" },
  { icon: CreditCard, label: "Billing", path: "/partners/dashboard" },
  { icon: Settings, label: "Settings", path: "/partners/dashboard" },
];

export default function AddListing() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [form, setForm] = useState({
    name: "",
    activity: "",
    category: "",
    subcategory: "",
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
  });

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
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pd-layout">
        <Sidebar />
        <main className="pd-main">
          <div className="al-success pd-animate pd-d1">
            <div className="al-success-icon">
              <CheckCircle size={48} strokeWidth={1.5} />
            </div>
            <h2>Listing Submitted!</h2>
            <p>Your listing is now under review. We'll notify you once it's approved and live on Planie.</p>
            <div className="al-success-actions">
              <Link to="/partners/dashboard" className="pd-btn pd-btn--primary">
                Back to Dashboard
              </Link>
              <button
                className="pd-btn pd-btn--outline"
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    name: "",
                    activity: "",
                    category: "",
                    subcategory: "",
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
                  });
                  setImagePreview([]);
                }}
              >
                Add Another Listing
              </button>
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
            <h1 className="pd-greeting">Add a New Listing</h1>
            <p className="pd-greeting-sub">Fill in the details to get your business on Planie</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="al-form">
          {/* ── Basic Info ── */}
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
              <label className="al-label">Activity *</label>
              <div className="al-category-grid">
                {activities.map((act) => (
                  <button
                    key={act}
                    type="button"
                    className={`al-category-chip ${form.activity === act ? "al-category-chip--active" : ""}`}
                    onClick={() => { updateField("activity", act); updateField("category", ""); updateField("subcategory", ""); }}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {form.activity && categoryMap[form.activity] && (
              <div className="al-field al-subcategory-field">
                <label className="al-label">Category *</label>
                <div className="al-category-grid">
                  {categoryMap[form.activity].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`al-category-chip al-subcategory-chip ${form.category === cat ? "al-category-chip--active" : ""}`}
                      onClick={() => { updateField("category", cat); updateField("subcategory", ""); }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.category && subcategoryMap[form.category] && (
              <div className="al-field al-subcategory-field">
                <label className="al-label">Subcategory *</label>
                <div className="al-category-grid">
                  {subcategoryMap[form.category].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      className={`al-category-chip al-subcategory-chip ${form.subcategory === sub ? "al-category-chip--active" : ""}`}
                      onClick={() => updateField("subcategory", sub)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              <span className="al-hint">{form.description.length}/2000 characters</span>
            </div>
          </section>

          {/* ── Photos ── */}
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

          {/* ── Location ── */}
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

          {/* ── Price Range ── */}
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

          {/* ── Operating Hours ── */}
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

          {/* ── Contact ── */}
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

          {/* ── Preview ── */}
          <ListingPreview form={form} imagePreview={imagePreview} />

          {/* ── Submit ── */}
          <div className="al-submit-row pd-animate pd-d4">
            <Link to="/partners/dashboard" className="pd-btn pd-btn--outline">
              Cancel
            </Link>
            <button type="submit" className="pd-btn pd-btn--primary al-submit-btn">
              Submit Listing
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* ── Sidebar (reused from dashboard) ── */
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
