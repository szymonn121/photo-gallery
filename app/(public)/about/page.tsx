import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings } from "@/lib/data";
import { safeExternalUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "O mnie", description: "O autorze galerii i jego podejściu do fotografii." };
export const revalidate = 300;

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const instagram = safeExternalUrl(settings?.instagram_url ?? null);
  const x = safeExternalUrl(settings?.x_url ?? null);
  return (
    <div className="container-shell pb-10 pt-36 sm:pt-44">
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--line)] bg-[#251914]">
            <Image src="/portrait-placeholder.svg" alt={`Portret: ${settings?.photographer_name ?? "fotograf"}`} fill priority sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
          </div>
        </div>
        <article>
          <p className="eyebrow mb-4">O autorze</p>
          <h1 className="display text-6xl sm:text-8xl">{settings?.photographer_name ?? "[IMIĘ FOTOGRAFA]"}</h1>
          <div className="mt-10 space-y-12 text-[var(--beige-soft)]">
            <section>
              <h2 className="display mb-5 text-4xl text-[var(--beige)]">Biografia</h2>
              <p className="whitespace-pre-line text-lg leading-9">{settings?.biography ?? "[TEKST TYMCZASOWY] Napisz tutaj kilka zdań o sobie, drodze do fotografii i tym, czego szukasz w swoich kadrach."}</p>
            </section>
            <section className="rule pt-10">
              <h2 className="display mb-5 text-4xl text-[var(--beige)]">Styl fotografii</h2>
              <p className="whitespace-pre-line leading-8">{settings?.photography_style ?? "[TEKST TYMCZASOWY] Opisz swoje podejście do koloru, światła, kompozycji i tematów."}</p>
            </section>
            <section className="rule pt-10">
              <h2 className="display mb-5 text-4xl text-[var(--beige)]">Sprzęt</h2>
              <p className="whitespace-pre-line leading-8">{settings?.equipment ?? "[TEKST TYMCZASOWY] Dodaj używany aparat, obiektywy i inne narzędzia."}</p>
            </section>
            {(settings?.email || instagram || x) && <section className="rule pt-10"><h2 className="display mb-5 text-4xl text-[var(--beige)]">Kontakt i profile</h2><div className="flex flex-wrap gap-3">{settings?.email && <a className="button-secondary" href={`mailto:${settings.email}`}>E-mail</a>}{instagram && <a className="button-secondary" href={instagram} target="_blank" rel="noreferrer">Instagram</a>}{x && <a className="button-secondary" href={x} target="_blank" rel="noreferrer">X</a>}</div></section>}
          </div>
        </article>
      </div>
    </div>
  );
}
