import WaveHomeTop from "../Assets/Images/WavePartnerTop.png";
import PlanieLogo2 from "../Assets/Images/PlanieLogo2.png";
import MapImage1 from "../Assets/Images/MapImage3.png";

export default function PartnerPage() {
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
        <img
          src={MapImage1}
          alt="Map illustration"
          className="w-4/5 md:w-3/4 lg:w-2/3 h-auto"
        />
      </div>
      
      {/* Partner headline */}
      <div className="w-full text-center my-12">
        <h2 
          style={{ 
            fontSize: "40px", 
            fontWeight: 600, 
            color: "#FF4040" 
          }}
        >
          Put Your Brand on the Map – Literally.
        </h2>
        <p
          className="mt-4 mx-auto max-w-2xl"
          style={{
            fontSize: "20px",
            fontWeight: 500,
            color: "#777777",
            lineHeight: "normal",
          }}
        >
          Whether you're a local gem or a global brand, Planie connects you with high-intent travelers right when they're ready to explore.
        </p>
      </div>
      
      {/* Two-column partner benefits and signup section */}
      <div className="w-full max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* Left column - Why Partner */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-semibold mb-4" style={{ color: "#FF4040" }}>
            Why Partner with Planie?
          </h2>
          
          <p className="mb-6">
            Reach People When It Matters Most Planie isn't just another app - it's the moment users decide what to do. That's when your business shows up, directly in their custom itinerary.
          </p>
          
          {/* Benefit items */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-red-400 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Be featured in AI-generated plans used by real travelers</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-red-400 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Native placements - your brand blends into the experience</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-red-400 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Geo-targeting ensures you're seen by the right audience</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-red-400 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Real-time analytics to track visibility and engagement</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-red-400 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Proprietary affinity matrix intelligently connects your business with travelers whose interests align</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Signup form */}
        <div className="w-full md:w-1/2 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">
            Join the Partner Program
          </h2>
          <p className="mb-2">
            Lock in early-bird rates today.
          </p>
          <p className="text-red-500 mb-6">
            Early bird partners will have access to 3 months free!
          </p>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-1">Business</label>
              <input
                type="text"
                id="business"
                name="business"
                placeholder="Business name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Business email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website or Instagram</label>
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
      
    </section>
  );
}