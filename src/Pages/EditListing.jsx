import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Clock,
  Tag,
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
  Ticket,
} from "lucide-react";
import ListingPreview from "../Components/ListingPreview";
import PlanieLogo from "../Assets/Images/PlanieLogo2.png";
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

const occasions = [
  "Date Night",
  "Birthday",
  "Anniversary",
  "Family Day",
  "Friends Night Out",
  "Romantic Getaway",
  "Honeymoon",
  "Bachelor / Hen Party",
  "Solo Trip",
  "Business Trip",
  "Kids Friendly",
  "Group Celebration",
];

const priceRanges = ["Free", "£", "££", "£££", "££££"];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* Booking platform catalogue */
const bookingRegions = [
  { value: "", label: "All regions" },
  { value: "uk", label: "UK" },
  { value: "europe", label: "Europe" },
  { value: "us", label: "United States" },
  { value: "australia", label: "Australia & NZ" },
  { value: "asia", label: "Asia" },
  { value: "middleeast", label: "Middle East" },
  { value: "global", label: "Global / Online" },
];

const bookingPlatformCategories = [
  { value: "", label: "All categories" },
  { value: "food", label: "Food & Dining" },
  { value: "bars", label: "Social, Bars & Nightlife" },
  { value: "wellness", label: "Wellness & Spa" },
  { value: "fitness", label: "Sport & Fitness" },
  { value: "experiences", label: "Experiences & Activities" },
  { value: "culture", label: "Art, Culture & Museums" },
  { value: "nature", label: "Wildlife & Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "events", label: "Live Events" },
];

/* Map listing category → booking category code */
const listingCategoryToBookingCat = {
  "Restaurant & Bar": "food",
  "Activity & Tour": "experiences",
  "Wellness & Spa": "wellness",
  "Hotel & Resort": "experiences",
  "Shopping & Market": "shopping",
  "Nightlife & Entertainment": "bars",
  "Museum & Gallery": "culture",
  "Outdoor & Adventure": "nature",
};

const bookingPlatforms = [
  { id: "opentable", name: "OpenTable", desc: "Restaurant reservations", regions: ["uk","europe","us","global"], cats: ["food","bars"], confirm: "/confirmation", booking: "https://www.opentable.com/...", idLabel: "OpenTable restaurant ID", idHint: "Found in your OpenTable dashboard", affiliate: true },
  { id: "thefork", name: "TheFork / LaFourchette", desc: "Restaurant bookings across Europe", regions: ["uk","europe","global"], cats: ["food","bars"], confirm: "/booking-confirmation", booking: "https://www.thefork.com/...", idLabel: "TheFork restaurant ID", idHint: "Found in your TheFork manager dashboard", affiliate: true },
  { id: "quandoo", name: "Quandoo", desc: "Restaurant reservations — UK & Europe", regions: ["uk","europe"], cats: ["food"], confirm: "/booking/confirmed", booking: "https://www.quandoo.co.uk/...", idLabel: "Quandoo merchant ID", idHint: "Found in your Quandoo partner dashboard", affiliate: true },
  { id: "resy", name: "Resy", desc: "Premium restaurant reservations", regions: ["uk","us","global"], cats: ["food","bars"], confirm: "/confirmation", booking: "https://resy.com/...", affiliate: false },
  { id: "sevenrooms", name: "SevenRooms", desc: "Hospitality CRM & reservations", regions: ["uk","us","europe","global"], cats: ["food","bars"], confirm: "/reservation/confirmed", booking: "https://sevenrooms.com/...", affiliate: false },
  { id: "tock", name: "Tock", desc: "Fine dining & ticketed experiences", regions: ["uk","us","global"], cats: ["food","bars","experiences"], confirm: "/confirmation", booking: "https://exploretock.com/...", affiliate: false },
  { id: "yelp", name: "Yelp Reservations", desc: "Restaurant bookings — US focused", regions: ["us"], cats: ["food"], confirm: "/reservation/confirmed", booking: "https://www.yelp.com/...", affiliate: false },
  { id: "chope", name: "Chope", desc: "Restaurant reservations — Southeast Asia", regions: ["asia"], cats: ["food"], confirm: "/confirmation", booking: "https://www.chope.co/...", affiliate: true },
  { id: "eatapp", name: "EatApp", desc: "Restaurant reservations — Middle East", regions: ["middleeast"], cats: ["food"], confirm: "/reservation/confirmed", booking: "https://eatapp.co/...", affiliate: false },
  { id: "dimmi", name: "Dimmi / OpenTable AU", desc: "Restaurant bookings — Australia", regions: ["australia"], cats: ["food"], confirm: "/confirmation", booking: "https://www.opentable.com.au/...", idLabel: "OpenTable restaurant ID", idHint: "Australian OpenTable dashboard", affiliate: true },
  { id: "quandoo-au", name: "Quandoo AU", desc: "Restaurant reservations — Australia", regions: ["australia"], cats: ["food"], confirm: "/booking/confirmed", booking: "https://www.quandoo.com.au/...", affiliate: false },
  { id: "designmynight", name: "DesignMyNight", desc: "Bars, clubs & nightlife — UK", regions: ["uk"], cats: ["bars","events"], confirm: "/booking/confirmed", booking: "https://www.designmynight.com/...", affiliate: false },
  { id: "fever", name: "Fever", desc: "Nightlife & immersive events", regions: ["uk","europe","us","global"], cats: ["bars","events","culture","experiences"], confirm: "/confirmation", booking: "https://feverup.com/...", affiliate: false },
  { id: "skiddle", name: "Skiddle", desc: "UK club nights & events", regions: ["uk"], cats: ["bars","events"], confirm: "/confirmation", booking: "https://www.skiddle.com/...", affiliate: false },
  { id: "treatwell", name: "Treatwell", desc: "Spa & beauty — UK & Europe", regions: ["uk","europe"], cats: ["wellness"], confirm: "/booking/confirmation", booking: "https://www.treatwell.co.uk/...", affiliate: true },
  { id: "fresha", name: "Fresha", desc: "Salons, spas & beauty — global", regions: ["uk","europe","us","australia","global"], cats: ["wellness"], confirm: "/booking/confirmed", booking: "https://www.fresha.com/...", affiliate: false },
  { id: "booksy", name: "Booksy", desc: "Beauty & wellness appointments — global", regions: ["uk","europe","us","global"], cats: ["wellness"], confirm: "/receipt", booking: "https://booksy.com/...", affiliate: false },
  { id: "mindbody", name: "Mindbody", desc: "Spas, yoga & wellness — global", regions: ["uk","europe","us","australia","global"], cats: ["wellness","fitness"], confirm: "/checkout/confirmation", booking: "https://clients.mindbodyonline.com/...", affiliate: false },
  { id: "simplybook", name: "SimplyBook", desc: "Flexible booking — global", regions: ["uk","europe","us","australia","middleeast","asia","global"], cats: ["wellness","fitness","experiences","nature"], confirm: "/booking/confirmed", booking: "https://yourname.simplybook.me/...", affiliate: false },
  { id: "vagaro", name: "Vagaro", desc: "Salons & spas — US & Canada", regions: ["us"], cats: ["wellness"], confirm: "/confirmation", booking: "https://www.vagaro.com/...", affiliate: false },
  { id: "zenoti", name: "Zenoti", desc: "Spa & wellness enterprise software", regions: ["us","uk","australia","global"], cats: ["wellness"], confirm: "/booking/confirmed", booking: "https://yourname.zenoti.com/...", affiliate: false },
  { id: "classpass", name: "Classpass", desc: "Fitness & wellness marketplace — global", regions: ["uk","europe","us","australia","asia","global"], cats: ["fitness","wellness"], confirm: "/reservation/confirmed", booking: "https://classpass.com/...", affiliate: true },
  { id: "glofox", name: "Glofox", desc: "Gym & studio booking — global", regions: ["uk","europe","us","global"], cats: ["fitness"], confirm: "/booking-confirmed", booking: "https://app.glofox.com/...", affiliate: false },
  { id: "teamup", name: "TeamUp", desc: "Fitness class scheduling — global", regions: ["uk","europe","us","global"], cats: ["fitness"], confirm: "/confirmation", booking: "https://app.teamup.com/...", affiliate: false },
  { id: "virtuagym", name: "VirtuaGym", desc: "Gym management & booking — Europe", regions: ["europe","uk"], cats: ["fitness"], confirm: "/booking/confirmed", booking: "https://yourname.virtuagym.com/...", affiliate: false },
  { id: "fareharbor", name: "FareHarbor", desc: "Tours & activities — global", regions: ["uk","europe","us","australia","asia","global"], cats: ["experiences","nature"], confirm: "/confirmation", booking: "https://fareharbor.com/embeds/book/...", affiliate: false },
  { id: "viator", name: "Viator", desc: "Experience marketplace — global", regions: ["uk","europe","us","australia","asia","middleeast","global"], cats: ["experiences","nature","culture"], confirm: "/booking/confirmation", booking: "https://www.viator.com/...", affiliate: true },
  { id: "getyourguide", name: "GetYourGuide", desc: "Activities & tours — global", regions: ["uk","europe","us","australia","asia","global"], cats: ["experiences","nature","culture"], confirm: "/confirmation", booking: "https://www.getyourguide.co.uk/...", affiliate: true },
  { id: "checkfront", name: "Checkfront", desc: "Tours & rentals — global", regions: ["uk","us","australia","global"], cats: ["experiences","nature"], confirm: "/reservation/confirmed", booking: "https://yourname.checkfront.com/...", affiliate: false },
  { id: "rezdy", name: "Rezdy", desc: "Tour operators — global", regions: ["uk","us","australia","asia","global"], cats: ["experiences","nature"], confirm: "/booking/confirmed", booking: "https://yourname.rezdy.com/...", affiliate: false },
  { id: "peek", name: "Peek Pro", desc: "Activities & rentals — US & global", regions: ["us","global"], cats: ["experiences","nature"], confirm: "/confirmation", booking: "https://www.peekpro.com/...", affiliate: false },
  { id: "klook", name: "Klook", desc: "Activities & experiences — Asia & global", regions: ["asia","global"], cats: ["experiences","nature","culture"], confirm: "/confirmation", booking: "https://www.klook.com/...", affiliate: true },
  { id: "kkday", name: "KKday", desc: "Experiences — Asia focused", regions: ["asia"], cats: ["experiences","nature"], confirm: "/order/confirmed", booking: "https://www.kkday.com/...", affiliate: true },
  { id: "airbnbexp", name: "Airbnb Experiences", desc: "Hosted experiences — global", regions: ["uk","europe","us","australia","asia","global"], cats: ["experiences","culture","nature"], confirm: "/trips/confirmed", booking: "https://www.airbnb.co.uk/experiences/...", affiliate: false },
  { id: "eventbrite", name: "Eventbrite", desc: "Events & exhibitions — global", regions: ["uk","europe","us","australia","asia","global"], cats: ["culture","events","experiences","shopping"], confirm: "/order/confirmation", booking: "https://www.eventbrite.co.uk/...", affiliate: false },
  { id: "ticketmaster", name: "Ticketmaster", desc: "Shows & concerts — global", regions: ["uk","europe","us","australia","global"], cats: ["events","culture"], confirm: "/order-confirmation", booking: "https://www.ticketmaster.co.uk/...", affiliate: false },
  { id: "dice", name: "Dice", desc: "Live music & comedy — global", regions: ["uk","europe","us","global"], cats: ["events","bars"], confirm: "/order/confirmed", booking: "https://dice.fm/...", affiliate: false },
  { id: "seetickets", name: "See Tickets", desc: "UK & Europe events", regions: ["uk","europe"], cats: ["events","culture"], confirm: "/order/confirmation", booking: "https://www.seetickets.com/...", affiliate: false },
  { id: "moshtix", name: "Moshtix", desc: "Events & live music — Australia", regions: ["australia"], cats: ["events"], confirm: "/confirmation", booking: "https://www.moshtix.com.au/...", affiliate: false },
  { id: "humanitix", name: "Humanitix", desc: "Events — Australia & NZ", regions: ["australia"], cats: ["events","culture","experiences"], confirm: "/order/confirmed", booking: "https://events.humanitix.com/...", affiliate: false },
  { id: "platinumlist", name: "Platinum List", desc: "Events — Middle East", regions: ["middleeast"], cats: ["events","bars"], confirm: "/confirmation", booking: "https://www.platinumlist.net/...", affiliate: false },
];

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
    priceRange: "£££",
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
    priceRange: "££££",
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
    priceRange: "£££",
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
    priceRange: "££",
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
    priceRange: "£",
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
  const [form, setForm] = useState(() => {
    const base = {
      name: "",
      occasions: [],
      category: "",
      description: "",
      address: "",
      city: "",
      country: "",
      postcode: "",
      bookingPlatform: "",
      bookingUrl: "",
      bookingConfirmUrl: "",
      bookingPlatformId: "",
      priceRange: "",
      avgBookingValue: "",
      phone: "",
      email: "",
      website: "",
      hours: daysOfWeek.map((day) => ({
        day,
        open: "09:00",
        close: "17:00",
        closed: false,
      })),
    };
    return listingData ? { ...base, ...listingData } : base;
  });

  const [bookingRegionFilter, setBookingRegionFilter] = useState("");
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState(() => listingCategoryToBookingCat[listingData?.category] || "");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleOccasion = (occ) => {
    setForm((prev) => {
      const list = prev.occasions || [];
      const has = list.includes(occ);
      return { ...prev, occasions: has ? list.filter((o) => o !== occ) : [...list, occ] };
    });
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
              <label className="al-label">Venue Name *</label>
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

          {/* Occasion */}
          <section className="pd-card al-section pd-animate pd-d1">
            <h3 className="al-section-title">When does your venue work best?</h3>
            <div className="al-field">
              <label className="al-label">Occasion Types *</label>
              <span className="al-help">
                Select the occasions your venue is best suited for. These influence when Planie recommends you to users. Choose accurately rather than broadly — quality of match matters more than quantity.
              </span>
              <div className="al-category-grid">
                {occasions.map((occ) => {
                  const active = (form.occasions || []).includes(occ);
                  return (
                    <button
                      key={occ}
                      type="button"
                      className={`al-category-chip ${active ? "al-category-chip--active" : ""}`}
                      onClick={() => toggleOccasion(occ)}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Category */}
          <section className="pd-card al-section pd-animate pd-d2">
            <h3 className="al-section-title">What kind of venue is this?</h3>
            <div className="al-field">
              <label className="al-label">Category *</label>
              <span className="al-help">
                Pick the category that best describes your venue's primary identity. This determines where you appear across browse and search. Choose the closest match rather than the broadest one — accuracy here drives more relevant traffic to your listing.
              </span>
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

            <div className="al-field">
              <label className="al-label">Postcode / Zipcode</label>
              <input
                type="text"
                className="al-input"
                placeholder="40000"
                value={form.postcode || ""}
                onChange={(e) => updateField("postcode", e.target.value)}
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="pd-card al-section pd-animate pd-d3">
            <h3 className="al-section-title">
              <Tag size={18} strokeWidth={2} /> Pricing
            </h3>

            <div className="al-field">
              <label className="al-label">Price Range</label>
              <span className="al-help">
                A quick visual tier travelers see at a glance — from budget-friendly to high-end.
              </span>
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
            </div>

            <div className="al-field al-field--divided">
              <label className="al-label">Average Booking Value (per person) *</label>
              <span className="al-help">
                Enter your estimated average booking value (per person) so we can show you the total revenue Planie is driving to your venue each month.
              </span>
              <div className="al-currency">
                <span className="al-currency-prefix">£</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="al-input"
                  placeholder="0.00"
                  value={form.avgBookingValue || ""}
                  onChange={(e) => updateField("avgBookingValue", e.target.value)}
                  required
                />
                <span className="al-currency-suffix">per person</span>
              </div>
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

          {/* Booking Platform */}
          <BookingPlatformSection
            form={form}
            updateField={updateField}
            regionFilter={bookingRegionFilter}
            setRegionFilter={setBookingRegionFilter}
            categoryFilter={bookingCategoryFilter}
            setCategoryFilter={setBookingCategoryFilter}
          />

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

          {/* Preview */}
          <ListingPreview form={form} imagePreview={imagePreview} />

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

/* Booking Platform picker */
function BookingPlatformSection({ form, updateField, regionFilter, setRegionFilter, categoryFilter, setCategoryFilter }) {
  const filtered = bookingPlatforms.filter((p) => {
    const regionMatch = !regionFilter || p.regions.includes(regionFilter);
    const catMatch = !categoryFilter || p.cats.includes(categoryFilter);
    return regionMatch && catMatch;
  });

  const selected = bookingPlatforms.find((p) => p.id === form.bookingPlatform) || null;
  const isOwn = form.bookingPlatform === "own";

  const selectPlatform = (id) => {
    updateField("bookingPlatform", id);
    updateField("bookingPlatformId", "");
  };

  const showConfirmFields = selected !== null || isOwn;

  return (
    <section className="pd-card al-section pd-animate pd-d4">
      <h3 className="al-section-title">
        <Ticket size={18} strokeWidth={2} /> Booking Platform
      </h3>
      <p className="al-section-sub">Pick the platform that powers your bookings — we'll link the listing's "Book Now" button here.</p>

      <div className="al-row" style={{ marginTop: 8 }}>
        <div className="al-field al-field--half">
          <label className="al-label">Region</label>
          <select
            className="al-input"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            {bookingRegions.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="al-field al-field--half">
          <label className="al-label">Category</label>
          <select
            className="al-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {bookingPlatformCategories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="al-booking-count">
        {filtered.length > 0 ? `${filtered.length} platform${filtered.length !== 1 ? "s" : ""} available` : "No matching platforms — use your own site below."}
      </div>

      {filtered.length > 0 && (
        <div className="al-booking-grid">
          {filtered.map((p) => {
            const active = form.bookingPlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`al-booking-btn${active ? " al-booking-btn--active" : ""}`}
                onClick={() => selectPlatform(p.id)}
              >
                <div className="al-booking-btn-name">{p.name}</div>
                <div className="al-booking-btn-desc">{p.desc}</div>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className={`al-booking-own${isOwn ? " al-booking-own--active" : ""}`}
        onClick={() => selectPlatform("own")}
      >
        <div className="al-booking-own-name">Website OR Custom Booking System</div>
        <div className="al-booking-own-desc">You handle bookings directly — we link to your page</div>
      </button>

      {showConfirmFields && (
        <div className="al-booking-fields">
          <div className="al-field">
            <label className="al-label">Your booking URL *</label>
            <input
              type="url"
              className="al-input"
              placeholder={isOwn ? "https://your-booking-page.com" : (selected?.booking || "https://...")}
              value={form.bookingUrl}
              onChange={(e) => updateField("bookingUrl", e.target.value)}
            />
            <span className="al-booking-hint">This link powers the "Book Now" button on your listing.</span>
          </div>

          <div className="al-field">
            <label className="al-label">Booking confirmation URL pattern *</label>
            <input
              type="text"
              className="al-input"
              placeholder={isOwn ? "e.g. /thank-you or /order-complete" : (selected?.confirm || "/confirmation")}
              value={form.bookingConfirmUrl}
              onChange={(e) => updateField("bookingConfirmUrl", e.target.value)}
            />
            <span className="al-booking-hint">The URL shown after a booking completes — used for in-app tracking.</span>
          </div>

          {selected?.idLabel && (
            <div className="al-field">
              <label className="al-label">{selected.idLabel}</label>
              <input
                type="text"
                className="al-input"
                value={form.bookingPlatformId}
                onChange={(e) => updateField("bookingPlatformId", e.target.value)}
              />
              {selected.idHint && <span className="al-booking-hint">{selected.idHint}</span>}
            </div>
          )}

          {selected?.affiliate && (
            <div className="al-booking-note">
              Completed bookings are reported monthly via your affiliate dashboard.
            </div>
          )}
        </div>
      )}
    </section>
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
