"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { pl } from "@/lib/i18n/pl";

const links = [
  ["/", pl.nav.home],
  ["/gallery", pl.nav.gallery],
  ["/collections", pl.nav.collections],
  ["/about", pl.nav.about],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <button className="button-ghost px-2" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu">
        <span className="sr-only">Otwórz menu</span>
        <span aria-hidden className="text-xl">{open ? "×" : "☰"}</span>
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-[var(--line)] bg-[#211713]/98 p-4 shadow-2xl backdrop-blur-xl">
          <nav aria-label="Nawigacja mobilna" className="grid">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="border-b border-[var(--line)] px-3 py-4 text-lg last:border-0">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
