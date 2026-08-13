import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Logowanie administratora", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <div className="container-shell grid min-h-[85svh] place-items-center pt-24"><LoginForm /></div>;
}
