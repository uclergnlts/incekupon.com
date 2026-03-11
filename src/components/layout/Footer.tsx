export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted">
        <p>incekupon &copy; {new Date().getFullYear()} - Gunluk Bahis Kuponlari</p>
        <p className="mt-1 text-xs">Bu site sadece bilgilendirme amaclidir.</p>
      </div>
    </footer>
  );
}
