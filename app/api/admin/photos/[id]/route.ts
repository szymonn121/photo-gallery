import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/auth";
import { photoInputSchema } from "@/lib/validation/photo";
import { isTrustedMutationRequest, validateStoredImages } from "@/lib/admin/security";
import type { Database } from "@/types/database";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "Odrzucono żądanie z obcego źródła." }, { status: 403 });
  const { id } = await params;
  const { supabase, admin } = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = photoInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
  const { data: previous } = (await supabase.from("photos").select("original_storage_path,thumbnail_storage_path,slug").eq("id", id).maybeSingle()) as { data: { original_storage_path: string; thumbnail_storage_path: string; slug: string } | null };
  if (!previous) return NextResponse.json({ error: "Nie znaleziono fotografii." }, { status: 404 });
  try {
    await validateStoredImages({
      originalPath: parsed.data.original_storage_path,
      thumbnailPath: parsed.data.thumbnail_storage_path,
      originalUrl: parsed.data.original_image_url,
      thumbnailUrl: parsed.data.thumbnail_url,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Nie udało się zweryfikować obrazów." }, { status: 400 });
  }
  if (parsed.data.is_featured) await (supabase as any).from("photos").update({ is_featured: false }).neq("id", id).eq("is_featured", true);
  const { error } = await (supabase as any).from("photos").update(parsed.data as any).eq("id", id);
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Taki slug jest już używany." : "Nie udało się zapisać zmian." }, { status: 400 });
  const oldPaths = [previous.original_storage_path, previous.thumbnail_storage_path].filter((path) => path && ![parsed.data.original_storage_path, parsed.data.thumbnail_storage_path].includes(path));
  if (oldPaths.length) await supabase.storage.from("photos").remove(oldPaths);
  revalidatePath("/", "layout");
  revalidatePath(`/gallery/${previous.slug}`);
  revalidatePath(`/gallery/${parsed.data.slug}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "Odrzucono żądanie z obcego źródła." }, { status: 403 });
  const { id } = await params;
  const { supabase, admin } = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  const { data: photo } = (await supabase.from("photos").select("original_storage_path,thumbnail_storage_path,slug").eq("id", id).maybeSingle()) as { data: { original_storage_path: string; thumbnail_storage_path: string; slug: string } | null };
  if (!photo) return NextResponse.json({ error: "Nie znaleziono fotografii." }, { status: 404 });
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Nie udało się usunąć fotografii." }, { status: 400 });
  await supabase.storage.from("photos").remove([photo.original_storage_path, photo.thumbnail_storage_path].filter(Boolean));
  revalidatePath("/", "layout");
  revalidatePath(`/gallery/${photo.slug}`);
  return NextResponse.json({ ok: true });
}
