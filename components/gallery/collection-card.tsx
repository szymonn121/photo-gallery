import Link from "next/link";
import type { Collection, PhotoWithCollection } from "@/types/database";
import { ResilientImage } from "@/components/ui/resilient-image";

export function CollectionCard({ collection, cover }: { collection: Collection; cover?: PhotoWithCollection }) {
  return (
    <article className="group relative min-h-[28rem] overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[#2a1d17]">
      <Link href={`/collections/${collection.slug}`} className="absolute inset-0">
        {cover ? (
          <ResilientImage src={cover.thumbnail_url || cover.original_image_url} alt={cover.alt_text} sizes="(max-width: 768px) 100vw, 50vw" className="photo-image object-cover" blurDataURL={cover.blur_data_url} />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(200,132,72,.23),transparent_18rem),linear-gradient(145deg,#3a281f,#1c130f)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#160f0b] via-[#160f0b]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
          <p className="eyebrow mb-3">Kolekcja</p>
          <h2 className="display text-4xl sm:text-5xl">{collection.name}</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--beige-soft)] line-clamp-3">{collection.description}</p>
        </div>
      </Link>
    </article>
  );
}
