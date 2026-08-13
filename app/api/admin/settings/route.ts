import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/auth";
import { isTrustedMutationRequest } from "@/lib/admin/security";
import { settingsInputSchema } from "@/lib/validation/photo";
import type { Database } from "@/types/database";

export async function PUT(request: Request) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "Odrzucono żądanie z obcego źródła." }, { status: 403 });
  const { supabase, admin } = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  const parsed = settingsInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
  const cleaned = { ...parsed.data, email: parsed.data.email || null, instagram_url: parsed.data.instagram_url || null, x_url: parsed.data.x_url || null };
  const { error } = await (supabase as any).from("site_settings").update(cleaned as any).eq("id", true);
  if (error) return NextResponse.json({ error: "Nie udało się zapisać ustawień." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
