import { notFound } from "next/navigation";
import { PhotoEditorForm } from "@/components/admin/photo-editor-form";
import { DeletePhotoButton } from "@/components/admin/delete-photo-button";
import { createClient } from "@/lib/supabase/server";
import type { Photo, Collection } from "@/types/database";

export default async function EditPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: photo }, { data: collections }] = (await Promise.all([
    supabase.from("photos").select("*").eq("id", id).maybeSingle(),
    supabase.from("collections").select("*").order("name"),
  ])) as [{ data: Photo | null }, { data: Collection[] | null }];
  if (!photo) notFound();
  return <div><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Edycja</p><h1 className="display text-5xl">{photo.title}</h1></div><DeletePhotoButton id={photo.id} title={photo.title} /></div><PhotoEditorForm photo={photo} collections={collections ?? []} /></div>;
}
