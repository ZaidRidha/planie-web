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
          className="mx-auto w-auto h-20 md:h-32 object-contain"
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
        <img
          src={MapImage1}
          alt="Map illustration"
          className="w-4/5 md:w-3/4 lg:w-2/3 h-auto"
        />
      </div>
      <div className="w-full my-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 py-16 px-6">
          {/* Text section */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-3xl font-semibold mb-2 text-gray-800">
              Interested?
            </h2>
            <p className="text-lg text-gray-600">
              Join our mailing list for updates
            </p>
          </div>

          {/* Form with enhanced interactivity */}
          <form
            className="flex w-full max-w-sm flex-col sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              // You can add actual form submission logic here
              const email = e.target.email.value;
              if (email) {
                // Show success message
                alert(`Thanks for signing up with ${email}!`);
                e.target.reset();
              }
            }}
          >
            <div className="relative flex-grow mb-3 sm:mb-0">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                aria-label="Email Address"
                required
                className="w-full rounded-full sm:rounded-r-none px-5 py-4 bg-white border border-gray-300 text-gray-700 placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg
                     transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="rounded-full sm:rounded-l-none px-6 py-4 text-lg font-medium
                   bg-rose-500 text-white 
                   hover:bg-rose-600 hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500
                   transition-all duration-200 whitespace-nowrap"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="w-4/5 h-1 bg-gray-200 mx-auto [3.5rem]" />

      <div className="mb-20">
        {" "}
        {/* Adjust mb-20 (5rem) as needed, e.g., mb-16 (4rem), mb-24 (6rem) */}
        <FeaturesSection />
      </div>
    </section>
  );
}
