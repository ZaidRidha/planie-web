import WaveHomeTop from "../Assets/Images/WaveHomeTop2.png";

export default function HomePage() {
  return (
    <section>
      {/* Hero */}
      <div className="relative bg-white text-gray-900 overflow-hidden">
        {/* decorative wave */}
        <div className="absolute inset-x-0 top-0 overflow-hidden leading-none select-none pointer-events-none">
          {/* two copies for endless scroll */}
          <img
            src={WaveHomeTop}
            aria-hidden="true"
            alt="decorative wave"
            className="w-[200%] md:w-full animate-wave"
          />
          <img
            src={WaveHomeTop}
            aria-hidden="true"
            alt="decorative wave copy"
            className="absolute left-1/2 top-0 w-[200%] md:hidden animate-wave"
          />
        </div>

        {/* hero content */}
        <div className="container mx-auto px-4 pt-32 pb-24 md:pt-48 md:pb-32 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Planie
          </h1>
          <p className="text-lg md:text-2xl mb-8">
            Simplify your planning and collaboration with intuitive tools.
          </p>
          <a
            href="#features"
            className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-full shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Drag-and-drop Tasks",
              text: "Organize milestones effortlessly.",
            },
            {
              title: "Real-time Collaboration",
              text: "Comment and share updates instantly.",
            },
            {
              title: "Insightful Analytics",
              text: "Track progress and stay on schedule.",
            },
          ].map(({ title, text }) => (
            <div
              key={title}
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
