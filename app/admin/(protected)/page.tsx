import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [photos, published, drafts, collections] = await Promise.all([
    supabase.from("photos").select("id", { count: "exact", head: true }),
    supabase.from("photos").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("photos").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("collections").select("id", { count: "exact", head: true }),
  ]);
  const cards = [["Wszystkie fotografie", photos.count ?? 0], ["Opublikowane", published.count ?? 0], ["Szkice", drafts.count ?? 0], ["Kolekcje", collections.count ?? 0]];
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Przegląd</p><h1 className="display text-5xl">Dashboard</h1></div><Link href="/admin/photos/new" className="button-primary">Dodaj fotografię</Link></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, count]) => <div key={label} className="editorial-panel p-6"><p className="text-sm text-[var(--taupe)]">{label}</p><strong className="display mt-4 block text-5xl">{count}</strong></div>)}</div><div className="editorial-panel mt-8 p-7"><h2 className="display text-3xl">Pierwsze kroki</h2><p className="muted mt-3 max-w-2xl leading-7">Dodaj kolekcję, a następnie prześlij pierwszą fotografię. Zdjęcie może pozostać szkicem do chwili, gdy zdecydujesz się je opublikować.</p><div className="mt-6 flex flex-wrap gap-3"><Link className="button-secondary" href="/admin/collections">Zarządzaj kolekcjami</Link><Link className="button-secondary" href="/admin/settings">Uzupełnij profil</Link></div></div></div>;
}
