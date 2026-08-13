import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { pl } from "@/lib/i18n/pl";
import { getSiteSettings } from "@/lib/data";

export async function Header() {
  const settings = await getSiteSettings();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-[#17100d]/72 backdrop-blur-xl">
      <div className="container-shell flex h-18 items-center justify-between">
        <Link href="/" className="display text-xl tracking-tight" aria-label="Strona główna">
          {settings?.gallery_name ?? "Galeria autorska"}
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Nawigacja główna">
          <Link href="/" className="text-sm text-[var(--beige-soft)] hover:text-[var(--amber)]">{pl.nav.home}</Link>
          <Link href="/gallery" className="text-sm text-[var(--beige-soft)] hover:text-[var(--amber)]">{pl.nav.gallery}</Link>
          <Link href="/collections" className="text-sm text-[var(--beige-soft)] hover:text-[var(--amber)]">{pl.nav.collections}</Link>
          <Link href="/about" className="text-sm text-[var(--beige-soft)] hover:text-[var(--amber)]">{pl.nav.about}</Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
