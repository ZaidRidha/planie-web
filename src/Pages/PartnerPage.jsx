import WaveHomeTop from "../Assets/Images/WavePartnerTop.png";
import React, { useState } from 'react';
import CheckCircle from "../Assets/Images/CheckCircle.png";
import "./PartnerPage.css"; // Import your CSS file

export default function PartnerPage() {
  const features = [
    {
      id: "matrix",
      title: "Matrix affinity",
      description:
        "Matrix Affinity connects your business with travelers who are actively looking for what you offer – boosting visibility, engagement, and conversions effortlessly.",
    },
    {
      id: "intent",
      title: "Built for intent, not interruption",
      description:
        "We serve your brand at the exact moment users are seeking recommendations, ensuring you reach high-intent audiences without disrupting their experience.",
    },
    {
      id: "ai",
      title: "AI Enhanced, User centric",
      description:
        "Our AI-driven recommendations personalize the journey, placing your brand at the heart of each traveler’s curated plan.",
    },
  ];

  const [activeFeatureId, setActiveFeatureId] = useState(features[0].id);

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();

    const business = e.target.business.value;
    const email = e.target.email.value;
    const websiteOrInstagram = e.target.website.value;

    try {
      const res = await fetch("https://api-t3s43pydha-uc.a.run.app/partner-program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ business, email, websiteOrInstagram }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Submission failed");

      alert("Thanks for applying!");
      e.target.reset();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Find the currently active feature object
  const activeFeature = features.find((f) => f.id === activeFeatureId);
  return (
    <section className="w-full">
      {/* Hero */}
      <div className="w-full">
        {/* decorative wave – lowered height */}
        <div className="w-full">
          <img
            src={WaveHomeTop}
            aria-hidden="true"
            alt="decorative wave"
            className="w-full"
          />
        </div>
      </div>

      {/* Partner headline */}
      <div className="w-full text-center py-16">
        <h2 className="partner-hero-title">
          Put Your Brand on the Map – Literally.
        </h2>
        <p className="partner-description mx-auto">
          Whether you're a local gem or a global brand, Planie connects you with
          high-intent travelers right when they're ready to explore.
        </p>
      </div>

      {/* Two-column partner benefits and signup section */}
      <div className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row md:justify-between gap-8">
        {/* Left column - Why Partner */}
        <div className="w-full md:w-5/12">
          <h2 className="why-partner-title text-3xl font-semibold">
            Why Partner with Planie?
          </h2>

          <p className="mb-6">
            Reach People When It Matters Most Planie isn't just another app -
            it's the moment users decide what to do. That's when your business
            shows up, directly in their custom itinerary.
          </p>

          {/* Benefit items */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <img src={CheckCircle} alt="Check" className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">
                  Be featured in AI-generated plans used by real travelers
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <img src={CheckCircle} alt="Check" className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">
                  Native placements - your brand blends into the experience
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <img src={CheckCircle} alt="Check" className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">
                  Geo-targeting ensures you're seen by the right audience
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <img src={CheckCircle} alt="Check" className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">
                  Real-time analytics to track visibility and engagement
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <img src={CheckCircle} alt="Check" className="h-6 w-6" />
              </div>
              <div>
                <p className="last-item">
                  Proprietary affinity matrix intelligently connects your
                  business with travelers whose interests align
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Signup form */}
        {/* Right column - Signup form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 transition-all hover:shadow-xl">
          <h2
            className="text-3xl font-semibold mb-4"
            style={{ color: "#ff2b2b" }}
          >
            Join the Partner Program
          </h2>
          <div className="mb-6">
            <p className="">Lock in early-bird rates today.</p>
            <p className="text-red-500 mb-6">
              Early bird partners will have access to 3 months free!
            </p>
          </div>

          <form className="space-y-4" onSubmit={handlePartnerSubmit}>
            <div>
              <label
                htmlFor="business"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business
              </label>
              <input
                type="text"
                id="business"
                name="business"
                placeholder="Business name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Business email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Website or Instagram
              </label>
              <input
                type="text"
                id="website"
                name="website"
                placeholder="Link to website or Instagram handle"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* How We're Different section */}
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <h2
        className="text-4xl font-semibold mb-20 text-center"
        style={{ color: '#FF4040', fontFamily: "'Poppins', sans-serif" }}
      >
        How We&apos;re Different
      </h2>

      <div className="flex flex-col md:flex-row gap-10 items-center">
        {/* Left column - Feature buttons */}
        <div className="w-full md:w-1/2 space-y-4">
          {features.map(feature => (
            <button
              key={feature.id}
              onClick={() => setActiveFeatureId(feature.id)}
              className={`w-full py-6 px-6 rounded-lg text-xl font-medium text-center transition-all duration-200 ${
                feature.id === activeFeatureId
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
            >
              {feature.title}
            </button>
          ))}
        </div>

        {/* Right column - Feature description */}
        <div className="w-full md:w-1/2">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-xl font-medium text-center">
              {activeFeature.description}
            </p>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}
