import Link from "next/link";
import type { PhotoWithCollection } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { ResilientImage } from "@/components/ui/resilient-image";

export function PhotoCard({ photo, priority = false }: { photo: PhotoWithCollection; priority?: boolean }) {
  return (
    <article className="photo-card group relative overflow-hidden rounded-[1rem] bg-[#241915]">
      <Link href={`/gallery/${photo.slug}`} className="block" aria-label={`Zobacz zdjęcie: ${photo.title}`}>
        <div className="relative w-full" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
          <ResilientImage
            src={photo.thumbnail_url || photo.original_image_url}
            alt={photo.alt_text}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            className="photo-image object-cover"
            blurDataURL={photo.blur_data_url}
          />
          <div className="photo-card-overlay absolute inset-0 opacity-75 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 translate-y-1 p-5 transition-transform duration-500 group-hover:translate-y-0">
            {photo.collection && <p className="eyebrow mb-2">{photo.collection.name}</p>}
            <h2 className="display text-2xl leading-tight text-[#f3e8d8]">{photo.title}</h2>
            <p className="mt-2 text-xs text-[#d8c6ad]/75">{formatDate(photo.published_at)}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
