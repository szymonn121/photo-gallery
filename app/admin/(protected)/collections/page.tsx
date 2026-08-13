import { CollectionManager } from "@/components/admin/collection-manager";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const [{ data: collections }, { data: photos }] = await Promise.all([
    supabase.from("collections").select("*").order("updated_at", { ascending: false }),
    supabase.from("photos").select("id,title").order("title"),
  ]);
  return <div><p className="eyebrow mb-3">Organizacja</p><h1 className="display mb-8 text-5xl">Kolekcje</h1><CollectionManager initialCollections={collections ?? []} photos={photos ?? []} /></div>;
}
