import Link from "next/link";
import { Hero } from "@/components/site/hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { CollectionCard } from "@/components/gallery/collection-card";
import { Reveal } from "@/components/ui/reveal";
import { getCollectionCovers, getFeaturedPhoto, getPublishedCollections, getRecentPhotos, getSiteSettings } from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, recent, collections, settings] = await Promise.all([
    getFeaturedPhoto(), getRecentPhotos(8), getPublishedCollections(2), getSiteSettings(),
  ]);
  const covers = await getCollectionCovers(collections);

  return (
    <>
      <Hero photo={featured} settings={settings} />
      <section className="container-shell section-space">
        <Reveal className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-4">Ostatnio opublikowane</p>
            <h2 className="display text-5xl sm:text-7xl">Najnowsze kadry</h2>
          </div>
          <Link href="/gallery" className="button-secondary self-start sm:self-auto">Cała galeria</Link>
        </Reveal>
        <GalleryGrid photos={recent} />
      </section>

      <section className="border-y border-[var(--line)] bg-[#eadcc8] py-20 text-[#261914] sm:py-28">
        <div className="container-shell grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <Reveal>
            <p className="text-xs uppercase tracking-[.22em] text-[#7a5940]">O fotografii</p>
            <h2 className="display mt-5 text-5xl leading-[.98] sm:text-7xl">Obrazy, które zostają dłużej niż chwila.</h2>
          </Reveal>
          <Reveal delay={.08}>
            <p className="max-w-2xl text-base leading-8 text-[#5b4131] sm:text-lg">{settings?.intro ?? "[TEKST TYMCZASOWY] Fotografuję światło, miejsca i drobne historie, które łatwo przeoczyć. Każdy kadr jest osobnym fragmentem większej opowieści."}</p>
            <Link href="/about" className="mt-8 inline-flex border-b border-[#6e4930] pb-1 text-sm font-bold uppercase tracking-[.14em]">Poznaj autora</Link>
          </Reveal>
        </div>
      </section>

      <section className="container-shell section-space">
        <Reveal className="mb-12">
          <p className="eyebrow mb-4">Serie i opowieści</p>
          <h2 className="display text-5xl sm:text-7xl">Wybrane kolekcje</h2>
        </Reveal>
        {collections.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {collections.map((collection) => <CollectionCard key={collection.id} collection={collection} cover={collection.cover_photo_id ? covers.get(collection.cover_photo_id) : undefined} />)}
          </div>
        ) : (
          <div className="editorial-panel p-10 text-center text-[var(--beige-soft)]">Kolekcje pojawią się tutaj po ich opublikowaniu w panelu administratora.</div>
        )}
      </section>

      <section className="relative overflow-hidden border-y border-[var(--line)] py-24 sm:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(200,132,72,.25),transparent_35rem)]" />
        <Reveal className="container-shell relative text-center">
          <p className="eyebrow mb-5">Pełne archiwum</p>
          <h2 className="display mx-auto max-w-5xl text-6xl leading-[.9] sm:text-8xl lg:text-[8rem]">Wejdź głębiej w świat fotografii.</h2>
          <Link href="/gallery" className="button-primary mt-10">Otwórz galerię</Link>
        </Reveal>
      </section>
    </>
  );
}
