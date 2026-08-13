"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  ["/admin", "Przegląd"],
  ["/admin/photos", "Fotografie"],
  ["/admin/collections", "Kolekcje"],
  ["/admin/settings", "Ustawienia"],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Nawigacja panelu">{links.map(([href, label]) => <Link key={href} href={href} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm", pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "bg-[var(--beige)] text-[var(--ink)]" : "border border-[var(--line)] text-[var(--beige-soft)]")}>{label}</Link>)}</nav>;
}
