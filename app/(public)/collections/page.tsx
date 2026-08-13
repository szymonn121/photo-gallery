import type { Metadata } from "next";
import { CollectionCard } from "@/components/gallery/collection-card";
import { getCollectionCovers, getPublishedCollections } from "@/lib/data";

export const metadata: Metadata = { title: "Kolekcje", description: "Tematyczne serie i opowieści fotograficzne." };
export const revalidate = 300;

export default async function CollectionsPage() {
  const collections = await getPublishedCollections();
  const covers = await getCollectionCovers(collections);
  return (
    <div className="container-shell pb-10 pt-36 sm:pt-44">
      <header className="mb-12 max-w-4xl">
        <p className="eyebrow mb-4">Fotograficzne opowieści</p>
        <h1 className="display text-6xl sm:text-8xl">Kolekcje</h1>
        <p className="muted mt-5 max-w-2xl text-lg leading-8">Serie połączone miejscem, światłem, tematem albo nastrojem.</p>
      </header>
      {collections.length ? <div className="grid gap-5 lg:grid-cols-2">{collections.map((collection) => <CollectionCard key={collection.id} collection={collection} cover={collection.cover_photo_id ? covers.get(collection.cover_photo_id) : undefined} />)}</div> : <div className="editorial-panel p-12 text-center">Nie opublikowano jeszcze żadnej kolekcji.</div>}
    </div>
  );
}
