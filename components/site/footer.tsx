import Link from "next/link";
import { getSiteSettings } from "@/lib/data";
import { safeExternalUrl } from "@/lib/utils";

export async function Footer() {
  const settings = await getSiteSettings();
  const instagram = safeExternalUrl(settings?.instagram_url ?? null);
  const x = safeExternalUrl(settings?.x_url ?? null);
  return (
    <footer className="rule mt-20 py-10">
      <div className="container-shell flex flex-col gap-5 text-sm text-[var(--taupe)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {settings?.photographer_name ?? "Fotograf"}. Wszystkie prawa zastrzeżone.</p>
        <div className="flex items-center gap-5">
          {instagram && <a href={instagram} target="_blank" rel="noreferrer">Instagram</a>}
          {x && <a href={x} target="_blank" rel="noreferrer">X</a>}
          <Link href="/admin/login" className="opacity-35 hover:opacity-100" aria-label="Panel administratora">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
