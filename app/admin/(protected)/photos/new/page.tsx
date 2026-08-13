import { PhotoEditorForm } from "@/components/admin/photo-editor-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewPhotoPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase.from("collections").select("*").order("name");
  return <div><p className="eyebrow mb-3">Nowy wpis</p><h1 className="display mb-8 text-5xl">Dodaj fotografię</h1><PhotoEditorForm collections={collections ?? []} /></div>;
}
