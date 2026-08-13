import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "./actions";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="container-shell pb-12 pt-28">
      <header className="mb-8 border-b border-[var(--line)] pb-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div><p className="eyebrow">Panel galerii</p><p className="mt-2 text-sm text-[var(--taupe)]">{admin.email}</p></div>
          <div className="flex gap-3"><Link href="/" className="button-secondary">Zobacz stronę</Link><form action={logout}><button className="button-ghost" type="submit">Wyloguj</button></form></div>
        </div>
        <AdminNav />
      </header>
      {children}
    </div>
  );
}
