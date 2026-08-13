"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import type { Collection, Photo } from "@/types/database";
import { createClient } from "@/lib/supabase/browser";
import { slugify } from "@/lib/utils";
import { createStoragePaths, prepareImage, publicStorageUrl, toDateTimeLocal, uploadStorageObject } from "@/lib/admin/image-client";

function isoToLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function localToIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function exposure(value: unknown) {
  if (typeof value !== "number" || !value) return "";
  if (value >= 1) return `${value}s`;
  return `1/${Math.round(1 / value)}s`;
}

export function PhotoEditorForm({ photo, collections }: { photo?: Photo | null; collections: Collection[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(photo?.thumbnail_url ?? "");
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(photo?.title ?? "");
  const [slug, setSlug] = useState(photo?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!photo);
  const [metadata, setMetadata] = useState({
    width: photo?.width ?? 0,
    height: photo?.height ?? 0,
    blurDataUrl: photo?.blur_data_url ?? "",
    camera: photo?.camera ?? "",
    lens: photo?.lens ?? "",
    focalLength: photo?.focal_length ?? "",
    aperture: photo?.aperture ?? "",
    shutterSpeed: photo?.shutter_speed ?? "",
    iso: photo?.iso?.toString() ?? "",
    capturedAt: isoToLocal(photo?.captured_at),
    latitude: photo?.latitude?.toString() ?? "",
    longitude: photo?.longitude?.toString() ?? "",
  });

  const previewRatio = useMemo(() => metadata.width && metadata.height ? metadata.width / metadata.height : 4 / 3, [metadata.height, metadata.width]);

  function onTitle(value: string) {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError("");
    if (!selected) return;
    try {
      const prepared = await prepareImage(selected);
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      const make = typeof prepared.exif.Make === "string" ? prepared.exif.Make : "";
      const model = typeof prepared.exif.Model === "string" ? prepared.exif.Model : "";
      setMetadata((current) => ({
        ...current,
        width: prepared.width,
        height: prepared.height,
        blurDataUrl: prepared.blurDataUrl,
        camera: [make, model].filter(Boolean).join(" ") || current.camera,
        lens: typeof prepared.exif.LensModel === "string" ? prepared.exif.LensModel : current.lens,
        focalLength: typeof prepared.exif.FocalLength === "number" ? `${prepared.exif.FocalLength} mm` : current.focalLength,
        aperture: typeof prepared.exif.FNumber === "number" ? `f/${prepared.exif.FNumber}` : current.aperture,
        shutterSpeed: exposure(prepared.exif.ExposureTime) || current.shutterSpeed,
        iso: typeof prepared.exif.ISO === "number" ? String(prepared.exif.ISO) : current.iso,
        capturedAt: toDateTimeLocal(prepared.exif.DateTimeOriginal) || current.capturedAt,
        latitude: typeof prepared.exif.latitude === "number" ? String(prepared.exif.latitude) : current.latitude,
        longitude: typeof prepared.exif.longitude === "number" ? String(prepared.exif.longitude) : current.longitude,
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nie udało się odczytać pliku.");
      event.target.value = "";
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!photo && !file) return setError("Wybierz plik fotografii.");
    if (!slug) return setError("Uzupełnij poprawny slug.");
    setPending(true);
    setProgress(file ? 1 : 100);
    const form = new FormData(event.currentTarget);
    let paths: { original: string; thumbnail: string } | null = null;
    let uploadedOriginal = photo?.original_image_url ?? "";
    let uploadedThumbnail = photo?.thumbnail_url ?? "";
    let originalStoragePath = photo?.original_storage_path ?? "";
    let thumbnailStoragePath = photo?.thumbnail_storage_path ?? "";

    try {
      if (file) {
        const prepared = await prepareImage(file);
        paths = createStoragePaths(file, title);
        await uploadStorageObject(paths.original, file, file.type, (value) => setProgress(Math.round(value * .72)));
        await uploadStorageObject(paths.thumbnail, prepared.thumbnail, "image/webp", (value) => setProgress(72 + Math.round(value * .23)));
        uploadedOriginal = publicStorageUrl(paths.original);
        uploadedThumbnail = publicStorageUrl(paths.thumbnail);
        originalStoragePath = paths.original;
        thumbnailStoragePath = paths.thumbnail;
      }

      const status = String(form.get("status")) as "draft" | "published";
      const publishedValue = String(form.get("published_at") || "");
      const payload = {
        title,
        slug,
        description: String(form.get("description") ?? ""),
        alt_text: String(form.get("alt_text") ?? ""),
        original_image_url: uploadedOriginal,
        thumbnail_url: uploadedThumbnail,
        original_storage_path: originalStoragePath,
        thumbnail_storage_path: thumbnailStoragePath,
        width: metadata.width,
        height: metadata.height,
        aspect_ratio: metadata.width / metadata.height,
        hero_focus_x: Number(form.get("hero_focus_x") ?? 50),
        hero_focus_y: Number(form.get("hero_focus_y") ?? 50),
        hero_mobile_focus_x: Number(form.get("hero_mobile_focus_x") ?? 50),
        hero_mobile_focus_y: Number(form.get("hero_mobile_focus_y") ?? 50),
        blur_data_url: metadata.blurDataUrl || null,
        location_name: String(form.get("location_name") || "") || null,
        location_description: String(form.get("location_description") || "") || null,
        latitude: metadata.latitude ? Number(metadata.latitude) : null,
        longitude: metadata.longitude ? Number(metadata.longitude) : null,
        camera: metadata.camera || null,
        lens: metadata.lens || null,
        focal_length: metadata.focalLength || null,
        aperture: metadata.aperture || null,
        shutter_speed: metadata.shutterSpeed || null,
        iso: metadata.iso ? Number(metadata.iso) : null,
        captured_at: localToIso(metadata.capturedAt),
        published_at: status === "published" ? (localToIso(publishedValue) ?? new Date().toISOString()) : localToIso(publishedValue),
        status,
        is_featured: form.get("is_featured") === "on",
        collection_id: String(form.get("collection_id") || "") || null,
      };

      const response = await fetch(photo ? `/api/admin/photos/${photo.id}` : "/api/admin/photos", {
        method: photo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Nie udało się zapisać fotografii.");
      setProgress(100);
      router.push("/admin/photos");
      router.refresh();
    } catch (caught) {
      if (paths) await createClient().storage.from("photos").remove([paths.original, paths.thumbnail]);
      setError(caught instanceof Error ? caught.message : "Wystąpił nieoczekiwany błąd.");
      setPending(false);
    }
  }

  const updateMeta = (key: keyof typeof metadata, value: string) => setMetadata((current) => ({ ...current, [key]: value }));

  return (
    <form onSubmit={onSubmit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-8">
        <section className="editorial-panel p-5 sm:p-7">
          <h2 className="display text-3xl">Fotografia i opis</h2>
          <div className="mt-6 grid gap-5">
            <div className="field"><label htmlFor="file">Plik {photo && "(opcjonalnie: zastąp obecny)"}</label><input id="file" className="input" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFileChange} required={!photo} /></div>
            {preview && <div className="relative max-h-[34rem] overflow-hidden rounded-xl bg-black/20" style={{ aspectRatio: String(previewRatio) }}><Image src={preview} alt="Podgląd przesyłanego zdjęcia" fill unoptimized={preview.startsWith("blob:")} className="object-contain" /></div>}
            <div className="grid gap-5 sm:grid-cols-2"><div className="field"><label htmlFor="title">Tytuł</label><input id="title" className="input" value={title} onChange={(e) => onTitle(e.target.value)} required maxLength={140} /></div><div className="field"><label htmlFor="slug">Slug URL</label><input id="slug" className="input" value={slug} onChange={(e) => { setAutoSlug(false); setSlug(slugify(e.target.value)); }} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></div></div>
            <div className="field"><label htmlFor="description">Opis</label><textarea id="description" name="description" className="textarea min-h-48" defaultValue={photo?.description} required maxLength={8000} /></div>
            <div className="field"><label htmlFor="alt_text">Tekst alternatywny</label><input id="alt_text" name="alt_text" className="input" defaultValue={photo?.alt_text} required maxLength={300} placeholder="Opisz to, co widać na fotografii" /></div>
          </div>
        </section>

        <section className="editorial-panel p-5 sm:p-7">
          <h2 className="display text-3xl">Lokalizacja <span className="text-lg text-[var(--taupe)]">(opcjonalnie)</span></h2>
          <div className="mt-6 grid gap-5"><div className="field"><label htmlFor="location_name">Nazwa miejsca</label><input id="location_name" name="location_name" className="input" defaultValue={photo?.location_name ?? ""} /></div><div className="grid gap-5 sm:grid-cols-2"><div className="field"><label htmlFor="latitude">Szerokość</label><input id="latitude" className="input" inputMode="decimal" value={metadata.latitude} onChange={(e) => updateMeta("latitude", e.target.value.replace(",", "."))} /></div><div className="field"><label htmlFor="longitude">Długość</label><input id="longitude" className="input" inputMode="decimal" value={metadata.longitude} onChange={(e) => updateMeta("longitude", e.target.value.replace(",", "."))} /></div></div><div className="field"><label htmlFor="location_description">Opis miejsca</label><textarea id="location_description" name="location_description" className="textarea" defaultValue={photo?.location_description ?? ""} /></div></div>
        </section>

        <section className="editorial-panel p-5 sm:p-7">
          <h2 className="display text-3xl">Dane techniczne <span className="text-lg text-[var(--taupe)]">(opcjonalnie)</span></h2>
          <p className="muted mt-2 text-sm">Przy obsługiwanym EXIF pola zostaną wypełnione automatycznie i nadal można je zmienić.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><MetaField label="Aparat" value={metadata.camera} onChange={(v) => updateMeta("camera", v)} /><MetaField label="Obiektyw" value={metadata.lens} onChange={(v) => updateMeta("lens", v)} /><MetaField label="Ogniskowa" value={metadata.focalLength} onChange={(v) => updateMeta("focalLength", v)} /><MetaField label="Przysłona" value={metadata.aperture} onChange={(v) => updateMeta("aperture", v)} /><MetaField label="Czas migawki" value={metadata.shutterSpeed} onChange={(v) => updateMeta("shutterSpeed", v)} /><MetaField label="ISO" value={metadata.iso} onChange={(v) => updateMeta("iso", v.replace(/\D/g, ""))} /><div className="field sm:col-span-2"><label htmlFor="captured_at">Data wykonania</label><input id="captured_at" type="datetime-local" className="input" value={metadata.capturedAt} onChange={(e) => updateMeta("capturedAt", e.target.value)} /></div></div>
        </section>
      </div>

      <aside className="grid content-start gap-6 xl:sticky xl:top-28 xl:self-start">
        <section className="editorial-panel p-5 sm:p-6"><h2 className="display text-3xl">Publikacja</h2><div className="mt-6 grid gap-5"><div className="field"><label htmlFor="status">Status</label><select id="status" name="status" className="select" defaultValue={photo?.status ?? "draft"}><option value="draft">Szkic</option><option value="published">Opublikowane</option></select></div><div className="field"><label htmlFor="published_at">Data publikacji</label><input id="published_at" name="published_at" type="datetime-local" className="input" defaultValue={isoToLocal(photo?.published_at) || isoToLocal(new Date().toISOString())} /></div><div className="field"><label htmlFor="collection_id">Kolekcja</label><select id="collection_id" name="collection_id" className="select" defaultValue={photo?.collection_id ?? ""}><option value="">Bez kolekcji</option>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></div><label className="flex items-center gap-3 text-sm text-[var(--beige-soft)]"><input type="checkbox" name="is_featured" defaultChecked={photo?.is_featured} className="size-4 accent-[var(--copper)]" /> Ustaw jako zdjęcie główne</label><div className="rule pt-5"><p className="mb-4 text-xs uppercase tracking-[.16em] text-[var(--sand)]">Punkt kadrowania hero (%)</p><div className="grid grid-cols-2 gap-3"><CropField name="hero_focus_x" label="Desktop X" value={photo?.hero_focus_x ?? 50} /><CropField name="hero_focus_y" label="Desktop Y" value={photo?.hero_focus_y ?? 50} /><CropField name="hero_mobile_focus_x" label="Mobile X" value={photo?.hero_mobile_focus_x ?? 50} /><CropField name="hero_mobile_focus_y" label="Mobile Y" value={photo?.hero_mobile_focus_y ?? 50} /></div><p className="mt-3 text-xs leading-5 text-[var(--taupe)]">0 oznacza lewą/górną krawędź, 100 prawą/dolną.</p></div></div></section>
        {(pending || progress > 0) && <div className="editorial-panel p-5" aria-live="polite"><div className="mb-3 flex justify-between text-sm"><span>{pending ? "Zapisywanie..." : "Gotowe"}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[var(--copper)] transition-[width]" style={{ width: `${progress}%` }} /></div></div>}
        {error && <div role="alert" className="rounded-xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">{error}</div>}
        <button type="submit" className="button-primary" disabled={pending}>{pending ? "Zapisywanie..." : photo ? "Zapisz zmiany" : "Dodaj fotografię"}</button>
      </aside>
    </form>
  );
}

function MetaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="field"><label>{label}</label><input className="input" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function CropField({ name, label, value }: { name: string; label: string; value: number }) {
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type="number" min={0} max={100} step={1} className="input" defaultValue={value} required /></div>;
}
