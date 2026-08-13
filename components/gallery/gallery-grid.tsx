import type { PhotoWithCollection } from "@/types/database";
import { PhotoCard } from "./photo-card";
import { Reveal } from "@/components/ui/reveal";

export function GalleryGrid({ photos }: { photos: PhotoWithCollection[] }) {
  if (!photos.length) {
    return (
      <div className="editorial-panel grid min-h-72 place-items-center px-6 text-center">
        <div>
          <p className="eyebrow mb-4">Pusta przestrzeń</p>
          <h2 className="display text-3xl">Nie ma tu jeszcze fotografii.</h2>
          <p className="muted mt-3">Zmień filtry albo wróć później, gdy pojawią się nowe kadry.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="masonry">
      {photos.map((photo, index) => (
        <Reveal key={photo.id} delay={Math.min(index * .035, .2)}>
          <PhotoCard photo={photo} priority={index < 3} />
        </Reveal>
      ))}
    </div>
  );
}
