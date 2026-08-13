import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(300)
  .nullable()
  .optional()
  .transform((value) => value || null);

export const photoInputSchema = z
  .object({
    title: z.string().trim().min(2).max(140),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
    description: z.string().trim().min(1).max(8000),
    alt_text: z.string().trim().min(5).max(300),
    original_image_url: z.url(),
    thumbnail_url: z.url(),
    original_storage_path: z.string().min(4).max(500),
    thumbnail_storage_path: z.string().min(4).max(500),
    width: z.number().int().positive().max(50000),
    height: z.number().int().positive().max(50000),
    aspect_ratio: z.number().positive().max(100),
    hero_focus_x: z.number().int().min(0).max(100),
    hero_focus_y: z.number().int().min(0).max(100),
    hero_mobile_focus_x: z.number().int().min(0).max(100),
    hero_mobile_focus_y: z.number().int().min(0).max(100),
    blur_data_url: z.string().max(10000).nullable().optional(),
    location_name: optionalText,
    location_description: z
      .string()
      .trim()
      .max(1500)
      .nullable()
      .optional()
      .transform((value) => value || null),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    camera: optionalText,
    lens: optionalText,
    focal_length: optionalText,
    aperture: optionalText,
    shutter_speed: optionalText,
    iso: z.number().int().min(1).max(10000000).nullable().optional(),
    captured_at: z.iso.datetime().nullable().optional(),
    published_at: z.iso.datetime().nullable().optional(),
    status: z.enum(["draft", "published"]),
    is_featured: z.boolean(),
    collection_id: z.uuid().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const hasLat = value.latitude !== null && value.latitude !== undefined;
    const hasLng = value.longitude !== null && value.longitude !== undefined;
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: "custom",
        message: "Szerokość i długość geograficzna muszą być podane razem.",
        path: [hasLat ? "longitude" : "latitude"],
      });
    }
    if (value.status === "published" && !value.published_at) {
      ctx.addIssue({
        code: "custom",
        message: "Opublikowane zdjęcie wymaga daty publikacji.",
        path: ["published_at"],
      });
    }
  });

export const collectionInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  description: z.string().trim().min(1).max(4000),
  cover_photo_id: z.uuid().nullable().optional(),
  status: z.enum(["draft", "published"]),
});

export const settingsInputSchema = z.object({
  photographer_name: z.string().trim().min(2).max(120),
  gallery_name: z.string().trim().min(2).max(120),
  intro: z.string().trim().min(1).max(600),
  biography: z.string().trim().min(1).max(6000),
  photography_style: z.string().trim().min(1).max(3000),
  equipment: z.string().trim().min(1).max(2000),
  email: z.email().nullable().optional().or(z.literal("")),
  instagram_url: z.url().nullable().optional().or(z.literal("")),
  x_url: z.url().nullable().optional().or(z.literal("")),
  watermark_enabled: z.boolean(),
  watermark_text: z.string().trim().max(120),
});
