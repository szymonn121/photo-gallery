import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PhotoMap } from "@/components/photo/photo-map";
import { PhotoViewer } from "@/components/photo/photo-viewer";
import { ShareButton } from "@/components/photo/share-button";
import { getPhotoBySlug, getPhotoNavigation, getRelatedPhotos, getSiteSettings } from "@/lib/data";
import { absoluteUrl, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const photo = await getPhotoBySlug(slug);
  if (!photo) return { title: "Nie znaleziono fotografii" };
  const description = photo.description.slice(0, 155);
  return {
    title: photo.title,
    description,
    alternates: { canonical: absoluteUrl(`/gallery/${photo.slug}`) },
    openGraph: { title: photo.title, description, type: "article", publishedTime: photo.published_at ?? undefined, images: [{ url: photo.original_image_url, width: photo.width, height: photo.height, alt: photo.alt_text }] },
    twitter: { card: "summary_large_image", title: photo.title, description, images: [photo.original_image_url] },
  };
}

export default async function PhotoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const photo = await getPhotoBySlug(slug);
  if (!photo) notFound();
  const [navigation, related, settings] = await Promise.all([getPhotoNavigation(photo), getRelatedPhotos(photo), getSiteSettings()]);
  const hasMap = photo.latitude !== null && photo.longitude !== null;
  const technical = [
    ["Aparat", photo.camera], ["Obiektyw", photo.lens], ["Ogniskowa", photo.focal_length], ["Przysłona", photo.aperture], ["Czas", photo.shutter_speed], ["ISO", photo.iso?.toString()],
  ].filter((item) => item[1]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Photograph",
    name: photo.title,
    description: photo.description,
    contentUrl: photo.original_image_url,
    thumbnailUrl: photo.thumbnail_url,
    datePublished: photo.published_at,
    creator: { "@type": "Person", name: settings?.photographer_name ?? "Fotograf" },
    ...(photo.location_name ? { contentLocation: { "@type": "Place", name: photo.location_name } } : {}),
  };

  return (
    <article className="container-shell pb-10 pt-28 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PhotoViewer
        src={photo.original_image_url}
        alt={photo.alt_text}
        width={photo.width}
        height={photo.height}
        blurDataURL={photo.blur_data_url}
        previousSlug={navigation.previous?.slug}
        nextSlug={navigation.next?.slug}
        watermark={settings?.watermark_enabled ? settings.watermark_text : null}
      />

      <div className="mx-auto grid max-w-6xl gap-12 py-12 lg:grid-cols-[1.3fr_.7fr] lg:py-16">
        <div>
          {photo.collection && <Link href={`/collections/${photo.collection.slug}`} className="eyebrow hover:text-[var(--amber)]">{photo.collection.name}</Link>}
          <h1 className="display mt-4 text-5xl leading-none sm:text-7xl">{photo.title}</h1>
          <p className="mt-7 whitespace-pre-line text-lg leading-9 text-[var(--beige-soft)]">{photo.description}</p>
          <div className="mt-8"><ShareButton title={photo.title} /></div>
        </div>
        <aside className="border-l-0 border-[var(--line)] lg:border-l lg:pl-9">
          <dl className="grid gap-5 text-sm">
            <div><dt className="eyebrow">Publikacja</dt><dd className="mt-2 text-[var(--beige-soft)]">{formatDate(photo.published_at)}</dd></div>
            {photo.captured_at && <div><dt className="eyebrow">Wykonano</dt><dd className="mt-2 text-[var(--beige-soft)]">{formatDate(photo.captured_at)}</dd></div>}
            {photo.location_name && <div><dt className="eyebrow">Lokalizacja</dt><dd className="mt-2 text-[var(--beige-soft)]">{photo.location_name}</dd></div>}
          </dl>
          {technical.length > 0 && <div className="rule mt-8 pt-8"><h2 className="display mb-5 text-3xl">Dane techniczne</h2><dl className="grid gap-3 text-sm">{technical.map(([label, value]) => <div key={label as string} className="flex justify-between gap-5"><dt className="text-[var(--taupe)]">{label}</dt><dd className="text-right text-[var(--beige-soft)]">{value}</dd></div>)}</dl></div>}
        </aside>
      </div>

      {photo.location_name && <section className="mx-auto max-w-6xl rule py-12 sm:py-16"><p className="eyebrow mb-4">Miejsce wykonania</p><h2 className="display text-4xl sm:text-5xl">{photo.location_name}</h2>{photo.location_description && <p className="muted my-5 max-w-3xl leading-8">{photo.location_description}</p>}{hasMap && <PhotoMap latitude={photo.latitude!} longitude={photo.longitude!} title={photo.location_name} />}</section>}

      <nav className="mx-auto grid max-w-6xl gap-4 rule py-10 sm:grid-cols-2" aria-label="Nawigacja między zdjęciami">
        {navigation.previous ? <Link href={`/gallery/${navigation.previous.slug}`} className="editorial-panel p-6"><span className="eyebrow">Poprzednie</span><strong className="display mt-2 block text-2xl">{navigation.previous.title}</strong></Link> : <div />}
        {navigation.next ? <Link href={`/gallery/${navigation.next.slug}`} className="editorial-panel p-6 text-right"><span className="eyebrow">Następne</span><strong className="display mt-2 block text-2xl">{navigation.next.title}</strong></Link> : <div />}
      </nav>

      {related.length > 0 && <section className="mx-auto max-w-6xl py-12"><p className="eyebrow mb-4">Z tej samej kolekcji</p><h2 className="display mb-10 text-5xl">Powiązane fotografie</h2><GalleryGrid photos={related} /></section>}
      <div className="my-8 text-center"><Link className="button-secondary" href="/gallery">Wróć do galerii</Link></div>
    </article>
  );
}
