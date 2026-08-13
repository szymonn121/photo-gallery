import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Pagination } from "@/components/gallery/pagination";
import { SearchFilters } from "@/components/gallery/search-filters";
import { getGalleryPhotos, getPublishedCollections } from "@/lib/data";

export const metadata: Metadata = { title: "Galeria", description: "Przeglądaj wszystkie opublikowane fotografie." };
export const revalidate = 120;

export default async function GalleryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const read = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  const page = Math.max(1, Number(read("page") ?? 1) || 1);
  const query = read("q")?.slice(0, 100);
  const collection = read("collection")?.slice(0, 100);
  const rawSort = read("sort");
  const sort = rawSort === "oldest" || rawSort === "featured" ? rawSort : "newest";
  const perPage = 24;
  const [result, collections] = await Promise.all([
    getGalleryPhotos({ page, perPage, query, collection, sort }), getPublishedCollections(),
  ]);
  const pages = Math.max(1, Math.ceil(result.count / perPage));

  return (
    <div className="container-shell pb-10 pt-36 sm:pt-44">
      <header className="mb-12 max-w-4xl">
        <p className="eyebrow mb-4">Archiwum fotografii</p>
        <h1 className="display text-6xl sm:text-8xl">Galeria</h1>
        <p className="muted mt-5 max-w-2xl text-lg leading-8">Kadry ułożone nie w feed, lecz w spokojną przestrzeń do oglądania. Wyszukuj, filtruj i otwieraj fotografie bez pośpiechu.</p>
      </header>
      <SearchFilters collections={collections} defaults={{ query, collection, sort }} />
      <p className="mb-5 text-sm text-[var(--taupe)]">Liczba fotografii: {result.count}</p>
      <GalleryGrid photos={result.photos} />
      <Pagination page={Math.min(page, pages)} pages={pages} query={{ q: query, collection, sort }} />
    </div>
  );
}
