import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/auth";
import { photoInputSchema } from "@/lib/validation/photo";
import { isTrustedMutationRequest, validateStoredImages } from "@/lib/admin/security";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "Odrzucono żądanie z obcego źródła." }, { status: 403 });
  const { supabase, admin } = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = photoInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
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
  if (parsed.data.is_featured) await (supabase as any).from("photos").update({ is_featured: false }).eq("is_featured", true);
  const { data, error } = await (supabase as any).from("photos").insert(parsed.data as any).select("id").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Taki slug jest już używany." : "Nie udało się zapisać fotografii." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json(data, { status: 201 });
}
