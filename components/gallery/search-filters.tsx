import type { Collection } from "@/types/database";

export function SearchFilters({ collections, defaults }: { collections: Collection[]; defaults: { query?: string; collection?: string; sort?: string } }) {
  return (
    <form action="/gallery" className="editorial-panel mb-10 grid gap-4 p-4 md:grid-cols-[1fr_220px_180px_auto] md:items-end">
      <div className="field">
        <label htmlFor="q">Szukaj</label>
        <input id="q" name="q" defaultValue={defaults.query} className="input" placeholder="Tytuł lub opis..." />
      </div>
      <div className="field">
        <label htmlFor="collection">Kolekcja</label>
        <select id="collection" name="collection" defaultValue={defaults.collection ?? ""} className="select">
          <option value="">Wszystkie kolekcje</option>
          {collections.map((collection) => <option key={collection.id} value={collection.slug}>{collection.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="sort">Sortowanie</label>
        <select id="sort" name="sort" defaultValue={defaults.sort ?? "newest"} className="select">
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="featured">Wyróżnione</option>
        </select>
      </div>
      <button className="button-primary" type="submit">Filtruj</button>
    </form>
  );
}
