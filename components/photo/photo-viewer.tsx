"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PhotoViewer({ src, alt, width, height, blurDataURL, previousSlug, nextSlug, watermark }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string | null;
  previousSlug?: string | null;
  nextSlug?: string | null;
  watermark?: string | null;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const router = useRouter();
  const close = useCallback(() => { setFullscreen(false); setZoom(1); }, []);


  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [fullscreen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && fullscreen) close();
      else if (event.key === "ArrowLeft" && previousSlug) router.push(`/gallery/${previousSlug}`);
      else if (event.key === "ArrowRight" && nextSlug) router.push(`/gallery/${nextSlug}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, fullscreen, nextSlug, previousSlug, router]);

  return (
    <>
      <button type="button" className="group relative block w-full overflow-hidden rounded-xl bg-black/25" onClick={() => setFullscreen(true)} aria-label="Otwórz zdjęcie w trybie pełnoekranowym">
        <div className="relative mx-auto w-full" style={{ aspectRatio: `${width}/${height}`, maxHeight: "82svh", maxWidth: `${width}px` }}>
          {imageFailed ? (
            <div className="absolute inset-0 grid place-items-center bg-[#211713] p-8 text-center"><div><p className="eyebrow mb-3">Błąd obrazu</p><p className="text-[var(--beige-soft)]">Nie udało się załadować fotografii w pełnej jakości.</p></div></div>
          ) : (
            <Image src={src} alt={alt} fill priority sizes="100vw" className="object-contain" placeholder={blurDataURL ? "blur" : "empty"} blurDataURL={blurDataURL ?? undefined} onError={() => setImageFailed(true)} />
          )}
          {watermark && <span className="pointer-events-none absolute bottom-4 right-5 text-xs tracking-[.18em] text-white/60 drop-shadow-lg">{watermark}</span>}
        </div>
        <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-4 py-2 text-xs uppercase tracking-[.15em] opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">Pełny ekran</span>
      </button>
      {fullscreen && (
        <div role="dialog" aria-modal="true" aria-label="Pełnoekranowy podgląd fotografii" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/96 safe-bottom">
          <div className="absolute right-4 top-4 z-20 flex gap-2">
            <button type="button" className="button-secondary bg-black/40 px-4" onClick={() => setZoom((value) => Math.max(1, value - .25))} aria-label="Pomniejsz">−</button>
            <button type="button" className="button-secondary bg-black/40 px-4" onClick={() => setZoom((value) => Math.min(4, value + .25))} aria-label="Powiększ">+</button>
            <button type="button" className="button-primary px-4" onClick={close}>Zamknij</button>
          </div>
          <div className="h-full w-full overflow-auto p-3 sm:p-10">
            <div className="relative m-auto min-h-[70svh] transition-[width,height] duration-200" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minWidth: "100%", minHeight: "70svh" }}>
              {imageFailed ? <div className="absolute inset-0 grid place-items-center text-center text-[var(--beige-soft)]">Nie udało się załadować fotografii.</div> : <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" quality={95} onError={() => setImageFailed(true)} />}
              {watermark && <span className="pointer-events-none absolute bottom-6 right-8 text-sm tracking-[.18em] text-white/55">{watermark}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
