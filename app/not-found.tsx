import Link from "next/link";

export default function NotFound() {
  return <div className="container-shell grid min-h-[75svh] place-items-center pt-24 text-center"><div><p className="eyebrow mb-4">404 / Brak kadru</p><h1 className="display text-6xl sm:text-8xl">Ta fotografia zniknęła z kliszy.</h1><p className="muted mx-auto mt-6 max-w-xl">Adres może być nieaktualny albo zdjęcie nie jest już opublikowane.</p><Link href="/gallery" className="button-primary mt-9">Przejdź do galerii</Link></div></div>;
}
