import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin/auth";
import { isTrustedMutationRequest } from "@/lib/admin/security";
import { collectionInputSchema } from "@/lib/validation/photo";
import type { Database } from "@/types/database";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "Odrzucono żądanie z obcego źródła." }, { status: 403 });
  const { id } = await params;
  const { supabase, admin } = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  const parsed = collectionInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane." }, { status: 400 });
  const { error } = await supabase.from("collections").update(parsed.data as Database["public"]["Tables"]["collections"]["Update"]).eq("id", id);
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Taki slug jest już używany." : "Nie udało się zapisać kolekcji." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedMutationRequest(request)) return NextResponse.json({ error: "Odrzucono żądanie z obcego źródła." }, { status: 403 });
  const { id } = await params;
  const { supabase, admin } = await requireAdminApi();
  if (!admin) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Nie udało się usunąć kolekcji." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
