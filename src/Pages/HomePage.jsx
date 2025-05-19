import WaveHomeTop from "../Assets/Images/WavePartnerTop.png";
import PlanieLogo2 from "../Assets/Images/PlanieLogo2.png";
import MapImage1 from "../Assets/Images/MapImage3.png";
import FeaturesSection from "../Sections/FeaturesSection";
export default function HomePage() {
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

      {/* Logo & Tagline */}
      <div className="w-full text-center pt-[3.0rem] pb-20">
        {/* If available, consider swapping to an SVG logo for crisp scaling */}
        <img
          src={PlanieLogo2}
          alt="Planie logo"
          className="mx-auto h-32 w-auto md:h-245 object-contain"
        />
        <p className="mt-8 font-medium" style={{ fontSize: "40px" }}>
          Start here, go anywhere
        </p>

        {/* AI description text */}
        <p
          className="mt-4 mx-auto max-w-2xl"
          style={{
            color: "#777",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "normal",
          }}
        >
          Utilize cutting edge AI-Powered Itinerary generator, and discover
          exciting places anywhere you go all within minutes.
        </p>
      </div>

      <div className="w-full flex justify-center pb-[3.0rem]">
        <img src={MapImage1} alt="Map illustration" />
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 py-16 px-4">
        {/* Text */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold mb-1">Interested?</h2>
          <p className="text-gray-600">Join our mailing list</p>
        </div>

        {/* Form */}
        <form
          className="flex w-full max-w-sm" // constrain width
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Email Address"
            aria-label="Email Address"
            required
            className="flex-grow rounded-l-full px-4 py-3 bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-r-full whitespace-nowrap"
          >
            Sign up
          </button>
        </form>
      </div>

      {/* Divider */}
      <div className="w-4/5 h-1 bg-gray-200 mx-auto [3.5rem]" />

      <FeaturesSection />
    </section>
  );
}
