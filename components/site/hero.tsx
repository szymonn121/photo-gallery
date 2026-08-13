"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import type { PhotoWithCollection, SiteSettings } from "@/types/database";

export function Hero({ photo, settings }: { photo: PhotoWithCollection | null; settings: SiteSettings | null }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 100]);
  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {photo ? (
        <motion.div style={{ y }} className="absolute -inset-y-16 inset-x-0">
          <Image
            src={photo.original_image_url}
            alt={photo.alt_text}
            fill
            priority
            sizes="100vw"
            className="hero-image object-cover"
            style={{
              "--hero-mobile-position": `${photo.hero_mobile_focus_x}% ${photo.hero_mobile_focus_y}%`,
              "--hero-desktop-position": `${photo.hero_focus_x}% ${photo.hero_focus_y}%`,
            } as CSSProperties}
            placeholder={photo.blur_data_url ? "blur" : "empty"}
            blurDataURL={photo.blur_data_url ?? undefined}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(200,132,72,.18),transparent_25rem),linear-gradient(135deg,#2e2019,#17100d_60%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#160f0b]/30 via-[#160f0b]/25 to-[#160f0b]/95" />
      <div className="container-shell relative z-10 flex min-h-[100svh] items-end pb-20 pt-32 md:pb-24">
        <div className="max-w-4xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="eyebrow mb-5">
            {settings?.photographer_name ?? "Fotografia autorska"}
          </motion.p>
          <motion.h1 initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.2, .8, .2, 1] }} className="display max-w-4xl text-5xl leading-[.95] sm:text-7xl lg:text-[7.5rem]">
            {photo?.title ?? settings?.gallery_name ?? "Światło, cisza i chwile pomiędzy."}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .25 }} className="mt-6 max-w-xl text-base leading-7 text-[var(--beige-soft)] sm:text-lg">
            {photo?.description.slice(0, 220) ?? settings?.intro ?? "[TEKST TYMCZASOWY] Autorska galeria fotografii skupiona na atmosferze, świetle i prawdziwych chwilach."}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .4 }} className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary" href={photo ? `/gallery/${photo.slug}` : "/gallery"}>{photo ? "Zobacz kadr" : "Odkryj galerię"}</Link>
            <Link className="button-secondary" href="/gallery">Przeglądaj wszystkie</Link>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-7 right-7 hidden items-center gap-3 text-xs uppercase tracking-[.22em] text-[var(--beige-soft)] md:flex">
        <span>Przewiń</span><span className="h-px w-16 bg-[var(--sand)]" />
      </div>
    </section>
  );
}
