import { SettingsForm } from "@/components/admin/settings-form";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/database";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = (await supabase.from("site_settings").select("*").eq("id", true).single()) as { data: SiteSettings };
  return <div><p className="eyebrow mb-3">Personalizacja</p><h1 className="display mb-8 text-5xl">Ustawienia strony</h1><SettingsForm settings={settings} /></div>;
}
