"use client";

import * as exifr from "exifr";
import { createClient } from "@/lib/supabase/browser";
import { getPublicEnv } from "@/lib/env";
import { slugify } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 40 * 1024 * 1024;

export async function validateImageFile(file: File) {
  if (!ACCEPTED.includes(file.type)) throw new Error("Obsługiwane formaty: JPEG, PNG, WebP i AVIF.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Plik może mieć maksymalnie 40 MB.");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const text = new TextDecoder("latin1").decode(bytes);
  const valid =
    (file.type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    (file.type === "image/png" && bytes[0] === 0x89 && text.slice(1, 4) === "PNG") ||
    (file.type === "image/webp" && text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP") ||
    (file.type === "image/avif" && text.slice(4, 12).includes("ftyp") && (text.includes("avif") || text.includes("avis")));
  if (!valid) throw new Error("Zawartość pliku nie odpowiada deklarowanemu formatowi obrazu.");
}

async function imageBitmapFromFile(file: File) {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export async function prepareImage(file: File) {
  await validateImageFile(file);
  const image = await imageBitmapFromFile(file);
  const width = image.width;
  const height = image.height;
  if (!width || !height) throw new Error("Nie udało się odczytać wymiarów zdjęcia.");

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / width);
  const thumbWidth = Math.max(1, Math.round(width * scale));
  const thumbHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = thumbWidth;
  canvas.height = thumbHeight;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Przeglądarka nie może przygotować miniatury.");
  context.drawImage(image, 0, 0, thumbWidth, thumbHeight);
  const thumbnail = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Nie udało się utworzyć miniatury.")), "image/webp", 0.88),
  );

  const blurCanvas = document.createElement("canvas");
  const blurWidth = 24;
  const blurHeight = Math.max(1, Math.round((height / width) * blurWidth));
  blurCanvas.width = blurWidth;
  blurCanvas.height = blurHeight;
  blurCanvas.getContext("2d")?.drawImage(image, 0, 0, blurWidth, blurHeight);
  const blurDataUrl = blurCanvas.toDataURL("image/jpeg", 0.45);
  if ("close" in image && typeof image.close === "function") image.close();

  let exif: Record<string, unknown> = {};
  try {
    exif = await exifr.parse(file, ["Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO", "DateTimeOriginal", "latitude", "longitude"]) ?? {};
  } catch {
    // EXIF is optional and malformed metadata must not block an upload.
  }

  return { width, height, thumbnail, blurDataUrl, exif };
}

export function createStoragePaths(file: File, title: string) {
  const date = new Date();
  const id = crypto.randomUUID();
  const rawExt = file.name.split(".").pop()?.toLowerCase();
  const mimeExt: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
  const extension = rawExt && ["jpg", "jpeg", "png", "webp", "avif"].includes(rawExt) ? (rawExt === "jpeg" ? "jpg" : rawExt) : mimeExt[file.type];
  const safeTitle = slugify(title) || "fotografia";
  const prefix = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return {
    original: `originals/${prefix}/${id}-${safeTitle}.${extension}`,
    thumbnail: `thumbnails/${prefix}/${id}-${safeTitle}.webp`,
  };
}

export async function uploadStorageObject(path: string, body: Blob, contentType: string, onProgress: (progress: number) => void) {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Sesja wygasła. Zaloguj się ponownie.");
  const env = getPublicEnv();
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/photos/${encodedPath}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "31536000");
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onerror = () => reject(new Error("Błąd sieci podczas przesyłania obrazu."));
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Supabase Storage odrzucił przesyłany plik."));
    xhr.send(body);
  });
}

export function publicStorageUrl(path: string) {
  return `${getPublicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${path}`;
}

export function toDateTimeLocal(value: unknown) {
  if (!(value instanceof Date) || Number.isNaN(value.valueOf())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
