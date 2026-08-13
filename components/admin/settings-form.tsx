"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { SiteSettings } from "@/types/database";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, email: payload.email || null, instagram_url: payload.instagram_url || null, x_url: payload.x_url || null, watermark_enabled: form.get("watermark_enabled") === "on" }) });
    setPending(false); setMessage(response.ok ? "Ustawienia zostały zapisane." : "Nie udało się zapisać ustawień.");
    if (response.ok) router.refresh();
  }
  return <form onSubmit={submit} className="grid gap-7"><section className="editorial-panel p-6"><h2 className="display text-3xl">Tożsamość galerii</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field name="photographer_name" label="Imię i nazwisko" value={settings.photographer_name} /><Field name="gallery_name" label="Nazwa galerii / logo" value={settings.gallery_name} /><div className="field sm:col-span-2"><label htmlFor="intro">Krótki wstęp</label><textarea id="intro" name="intro" className="textarea" defaultValue={settings.intro} required /></div></div></section><section className="editorial-panel p-6"><h2 className="display text-3xl">Strona „O mnie”</h2><div className="mt-6 grid gap-5"><Area name="biography" label="Biografia" value={settings.biography} /><Area name="photography_style" label="Styl fotografii" value={settings.photography_style} /><Area name="equipment" label="Sprzęt" value={settings.equipment} /></div></section><section className="editorial-panel p-6"><h2 className="display text-3xl">Kontakt i znak wodny</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field name="email" label="E-mail" value={settings.email ?? ""} type="email" /><Field name="instagram_url" label="Instagram URL" value={settings.instagram_url ?? ""} type="url" /><Field name="x_url" label="X URL" value={settings.x_url ?? ""} type="url" /><Field name="watermark_text" label="Treść znaku wodnego" value={settings.watermark_text} /><label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" name="watermark_enabled" defaultChecked={settings.watermark_enabled} className="size-4 accent-[var(--copper)]" /> Wyświetlaj subtelny znak wodny na zdjęciach</label></div></section>{message && <p role="status" className="text-sm text-[var(--sand)]">{message}</p>}<button className="button-primary justify-self-start" disabled={pending}>{pending ? "Zapisywanie..." : "Zapisz ustawienia"}</button></form>;
}
function Field({ name, label, value, type = "text" }: { name: string; label: string; value: string; type?: string }) { return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} className="input" defaultValue={value} /></div>; }
function Area({ name, label, value }: { name: string; label: string; value: string }) { return <div className="field"><label htmlFor={name}>{label}</label><textarea id={name} name={name} className="textarea min-h-40" defaultValue={value} required /></div>; }
