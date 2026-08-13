"use client";

import Image from "next/image";
import { useState } from "react";

export function ResilientImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  blurDataURL,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  blurDataURL?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(145deg,#34241d,#1b120f)] p-6 text-center">
        <div>
          <p className="eyebrow mb-2">Błąd obrazu</p>
          <p className="text-sm text-[var(--beige-soft)]">Nie udało się załadować fotografii.</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL ?? undefined}
      onError={() => setFailed(true)}
    />
  );
}
