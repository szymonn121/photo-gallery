import { getPublicEnv } from "@/lib/env";

const acceptedMime = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function isTrustedMutationRequest(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  if (origin && origin !== requestOrigin) return false;
  return true;
}

function validMagic(bytes: Uint8Array, contentType: string) {
  const text = new TextDecoder("latin1").decode(bytes);
  if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes[0] === 0x89 && text.slice(1, 4) === "PNG";
  if (contentType === "image/webp") return text.slice(0, 4) === "RIFF" && text.slice(8, 12) === "WEBP";
  if (contentType === "image/avif") return text.slice(4, 12).includes("ftyp") && (text.includes("avif") || text.includes("avis"));
  return false;
}

async function readFirstBytes(url: string) {
  const response = await fetch(url, {
    headers: { Range: "bytes=0-63" },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok && response.status !== 206) throw new Error("Nie udało się zweryfikować pliku w Storage.");
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!acceptedMime.has(contentType)) throw new Error("Storage zwrócił niedozwolony typ pliku.");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Nie udało się odczytać pliku w Storage.");
  const { value } = await reader.read();
  await reader.cancel();
  return { bytes: value ?? new Uint8Array(), contentType };
}

export async function validateStoredImages(input: {
  originalPath: string;
  thumbnailPath: string;
  originalUrl: string;
  thumbnailUrl: string;
}) {
  const originalPattern = /^originals\/\d{4}\/\d{2}\/[0-9a-f-]{36}-[a-z0-9-]+\.(jpg|png|webp|avif)$/;
  const thumbnailPattern = /^thumbnails\/\d{4}\/\d{2}\/[0-9a-f-]{36}-[a-z0-9-]+\.webp$/;
  if (!originalPattern.test(input.originalPath) || !thumbnailPattern.test(input.thumbnailPath)) {
    throw new Error("Nieprawidłowy format ścieżki Storage.");
  }

  const base = `${getPublicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`;
  const expectedOriginal = `${base}${input.originalPath}`;
  const expectedThumbnail = `${base}${input.thumbnailPath}`;
  if (input.originalUrl !== expectedOriginal || input.thumbnailUrl !== expectedThumbnail) {
    throw new Error("Adres obrazu nie odpowiada ścieżce w Storage.");
  }

  const [original, thumbnail] = await Promise.all([
    readFirstBytes(expectedOriginal),
    readFirstBytes(expectedThumbnail),
  ]);
  if (!validMagic(original.bytes, original.contentType)) throw new Error("Oryginalny plik ma nieprawidłową sygnaturę.");
  if (thumbnail.contentType !== "image/webp" || !validMagic(thumbnail.bytes, thumbnail.contentType)) {
    throw new Error("Miniatura ma nieprawidłowy format.");
  }
}
