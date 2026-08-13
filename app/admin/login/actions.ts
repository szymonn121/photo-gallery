"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export type LoginState = {
  error?: string;
};

export async function login(
  _: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return {
      error: "Podaj poprawny e-mail i hasło.",
    };
  }

  // Pobranie adresu IP użytkownika
  const requestHeaders = await headers();

  const forwardedFor = requestHeaders.get("x-forwarded-for");

  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  // Klucz rate limitu: IP + e-mail
  const rateKey = `${ip}:${email}`.slice(0, 240);

  // Sprawdzenie limitu logowania
  const publicClient = createPublicClient();

  const {
    data: allowed,
    error: rateLimitError,
  } = await (publicClient as any).rpc("check_login_rate_limit", {
    p_key: rateKey,
  });

  if (rateLimitError) {
    console.error("Login rate limit error:", rateLimitError);

    return {
      error: "Nie udało się sprawdzić limitu logowania.",
    };
  }

  if (allowed !== true) {
    return {
      error:
        "Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.",
    };
  }

  // Logowanie przez Supabase Auth
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase login error:", error.message);

    return {
      error: "Nieprawidłowy e-mail lub hasło.",
    };
  }

  // Pobranie ID zalogowanego użytkownika
  const { data: claims } = await supabase.auth.getClaims();

  const userId = claims?.claims?.sub;

  // Sprawdzenie, czy użytkownik jest administratorem
  const { data: admin } = userId
    ? await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null };

  // Zwykły użytkownik nie może wejść do panelu
  if (!admin) {
    await supabase.auth.signOut();

    return {
      error: "To konto nie ma uprawnień administratora.",
    };
  }

  // Sukces
  redirect("/admin");
}