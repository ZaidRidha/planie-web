import WaveHomeTop from "../Assets/Images/WavePartnerTop.png";
import PlanieLogo2 from "../Assets/Images/PlanieLogo2.png";
import MapImage1 from "../Assets/Images/MapImage3.png";

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
      <div className="w-full text-center pt-28 pb-20">
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

      <div className="">
        <img
          src={MapImage1}
       
        />
      </div>
    </section>
  );
}
