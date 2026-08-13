import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPhotosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const status = params.status === "draft" || params.status === "published" ? params.status : "";
  const supabase = await createClient();
  let query = supabase.from("photos").select("id,title,slug,thumbnail_url,width,height,status,is_featured,published_at,updated_at").order("updated_at", { ascending: false });
  if (q) query = query.ilike("title", `%${q.replace(/[,%()]/g, " ")}%`);
  if (status) query = query.eq("status", status);
  const { data: photos } = await query.limit(200);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Zawartość</p><h1 className="display text-5xl">Fotografie</h1></div><Link href="/admin/photos/new" className="button-primary">Dodaj fotografię</Link></div>
      <form className="editorial-panel mt-7 grid gap-4 p-4 sm:grid-cols-[1fr_180px_auto]"><div className="field"><label htmlFor="q">Szukaj tytułu</label><input id="q" name="q" className="input" defaultValue={q} /></div><div className="field"><label htmlFor="status">Status</label><select id="status" name="status" className="select" defaultValue={status}><option value="">Wszystkie</option><option value="draft">Szkice</option><option value="published">Opublikowane</option></select></div><button className="button-secondary self-end">Filtruj</button></form>
      <div className="mt-7 grid gap-3">
        {(photos ?? []).map((photo) => (
          <Link key={photo.id} href={`/admin/photos/${photo.id}`} className="editorial-panel grid grid-cols-[86px_1fr_auto] items-center gap-4 p-3 transition-transform hover:-translate-y-0.5">
            <div className="relative h-20 w-[86px] overflow-hidden rounded-lg bg-black/20"><Image src={photo.thumbnail_url} alt="" fill sizes="86px" className="object-cover" /></div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="truncate">{photo.title}</strong>{photo.is_featured && <span className="rounded-full bg-[var(--copper)]/20 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--amber)]">Główne</span>}</div><p className="mt-2 text-xs text-[var(--taupe)]">/{photo.slug} · {photo.status === "published" ? "Opublikowane" : "Szkic"}</p></div>
            <span className="hidden text-sm text-[var(--sand)] sm:block">Edytuj →</span>
          </Link>
        ))}
        {!photos?.length && <div className="editorial-panel p-12 text-center text-[var(--beige-soft)]">Brak fotografii pasujących do filtrów.</div>}
      </div>
    </div>
  );
}
