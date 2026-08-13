import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getCollectionBySlug, getCollectionPhotos } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Nie znaleziono kolekcji" };
  return { title: collection.name, description: collection.description.slice(0, 155), alternates: { canonical: absoluteUrl(`/collections/${collection.slug}`) } };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const photos = await getCollectionPhotos(collection.id);
  return (
    <div className="container-shell pb-10 pt-36 sm:pt-44">
      <header className="mb-14 max-w-5xl">
        <p className="eyebrow mb-4">Kolekcja</p>
        <h1 className="display text-6xl leading-none sm:text-8xl">{collection.name}</h1>
        <p className="muted mt-7 max-w-3xl whitespace-pre-line text-lg leading-9">{collection.description}</p>
        <p className="mt-5 text-sm text-[var(--taupe)]">{photos.length} {photos.length === 1 ? "fotografia" : "fotografii"}</p>
      </header>
      <GalleryGrid photos={photos} />
    </div>
  );
}
