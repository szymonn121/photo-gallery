"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) return { error: "Podaj poprawny e-mail i hasło." };

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateKey = `${ip}:${email}`.slice(0, 240);
  const publicClient = createPublicClient();
  const { data: allowed } = await publicClient.rpc("check_login_rate_limit", { p_key: rateKey } as any);
  if (!allowed) return { error: "Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Nieprawidłowy e-mail lub hasło." };

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  const { data: admin } = userId
    ? await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle()
    : { data: null };

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "To konto nie ma uprawnień administratora." };
  }
  return redirect("/admin");
}
