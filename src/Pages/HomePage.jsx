import WaveHomeTop from "../Assets/Images/WavePartnerTop.png";

export default function HomePage() {
  return (
    <section>
      {/* Hero */}
      <div className="">
        {/* decorative wave – lowered height */}
        <div className="">
          <img
            src={WaveHomeTop}
            aria-hidden="true"
            alt="decorative wave"
            className="w-[200%] h-full object-cover animate-wave"
          />
        </div>

        {/* hero content */}
        <div className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24 text-center relative z-10">
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
