"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Collection, Photo } from "@/types/database";
import { slugify } from "@/lib/utils";

export function CollectionManager({ initialCollections, photos }: { initialCollections: Collection[]; photos: Pick<Photo, "id" | "title">[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [manualSlug, setManualSlug] = useState(false);
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function edit(collection: Collection) {
    setSelected(collection); setName(collection.name); setSlug(collection.slug); setManualSlug(true); setDescription(collection.description); setCover(collection.cover_photo_id ?? ""); setStatus(collection.status); setError("");
  }
  function clear() {
    setSelected(null); setName(""); setSlug(""); setManualSlug(false); setDescription(""); setCover(""); setStatus("draft"); setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    const response = await fetch(selected ? `/api/admin/collections/${selected.id}` : "/api/admin/collections", {
      method: selected ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug, description, cover_photo_id: cover || null, status }),
    });
    const data = await response.json().catch(() => ({})); setPending(false);
    if (!response.ok) return setError(data.error ?? "Nie udało się zapisać kolekcji.");
    clear(); router.refresh();
  }
  async function remove(collection: Collection) {
    if (!confirm(`Usunąć kolekcję „${collection.name}”? Zdjęcia pozostaną w galerii bez przypisanej kolekcji.`)) return;
    const response = await fetch(`/api/admin/collections/${collection.id}`, { method: "DELETE" });
    if (!response.ok) return alert("Nie udało się usunąć kolekcji.");
    if (selected?.id === collection.id) clear();
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <section><div className="mb-4 flex items-center justify-between"><h2 className="display text-3xl">Istniejące kolekcje</h2><button className="button-ghost" onClick={clear}>Nowa</button></div><div className="grid gap-3">{initialCollections.map((collection) => <div key={collection.id} className="editorial-panel flex items-center justify-between gap-4 p-4"><button type="button" className="min-w-0 flex-1 text-left" onClick={() => edit(collection)}><strong className="block truncate">{collection.name}</strong><span className="mt-1 block text-xs text-[var(--taupe)]">/{collection.slug} · {collection.status === "published" ? "opublikowana" : "szkic"}</span></button><button type="button" className="button-ghost px-2 text-red-200" onClick={() => remove(collection)}>Usuń</button></div>)}{!initialCollections.length && <div className="editorial-panel p-8 text-center text-[var(--taupe)]">Brak kolekcji.</div>}</div></section>
      <form onSubmit={submit} className="editorial-panel p-6"><p className="eyebrow mb-3">{selected ? "Edycja" : "Nowa kolekcja"}</p><h2 className="display text-4xl">{selected?.name ?? "Utwórz kolekcję"}</h2><div className="mt-7 grid gap-5"><div className="field"><label htmlFor="collection-name">Nazwa</label><input id="collection-name" className="input" value={name} onChange={(e) => { setName(e.target.value); if (!manualSlug) setSlug(slugify(e.target.value)); }} required /></div><div className="field"><label htmlFor="collection-slug">Slug</label><input id="collection-slug" className="input" value={slug} onChange={(e) => { setManualSlug(true); setSlug(slugify(e.target.value)); }} required /></div><div className="field"><label htmlFor="collection-description">Opis</label><textarea id="collection-description" className="textarea min-h-40" value={description} onChange={(e) => setDescription(e.target.value)} required /></div><div className="field"><label htmlFor="cover">Fotografia okładkowa</label><select id="cover" className="select" value={cover} onChange={(e) => setCover(e.target.value)}><option value="">Bez okładki</option>{photos.map((photo) => <option key={photo.id} value={photo.id}>{photo.title}</option>)}</select></div><div className="field"><label htmlFor="collection-status">Status</label><select id="collection-status" className="select" value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}><option value="draft">Szkic</option><option value="published">Opublikowana</option></select></div>{error && <p role="alert" className="rounded-lg bg-red-400/10 p-3 text-sm text-red-100">{error}</p>}<div className="flex gap-3"><button className="button-primary" disabled={pending}>{pending ? "Zapisywanie..." : selected ? "Zapisz zmiany" : "Dodaj kolekcję"}</button>{selected && <button type="button" className="button-secondary" onClick={clear}>Anuluj</button>}</div></div></form>
    </div>
  );
}
