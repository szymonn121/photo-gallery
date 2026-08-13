import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getAdmin = cache(async (): Promise<{ user_id: string; email: string } | null> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id,email")
    .eq("user_id", userId)
    .maybeSingle();

  return admin;
});

export async function requireAdmin(): Promise<{ user_id: string; email: string }> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireAdminApi(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; admin: { user_id: string; email: string } | null }> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { supabase, admin: null };

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id,email")
    .eq("user_id", userId)
    .maybeSingle();

  return { supabase, admin };
}
