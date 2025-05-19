export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Planie — All rights reserved.
      </div>
    </footer>
  );
}
