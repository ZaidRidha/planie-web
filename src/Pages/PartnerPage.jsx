const partners = [
  {
    name: "Acme Corp",
    description: "Leading provider of widgets and gadgets.",
  },
  {
    name: "Globex",
    description: "Global solutions for modern businesses.",
  },
  {
    name: "Initech",
    description: "Innovating enterprise software since 1999.",
  },
];

export default function PartnerPage() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-12">Our Partners</h1>
      <div className="grid gap-8 md:grid-cols-3">
        {partners.map((p) => (
          <div
            key={p.name}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{p.name}</h2>
            <p className="text-gray-600">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
