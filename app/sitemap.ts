import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: photos }, { data: collections }] = (await Promise.all([
    supabase.from("photos").select("slug,updated_at").eq("status", "published").lte("published_at", new Date().toISOString()),
    supabase.from("collections").select("slug,updated_at").eq("status", "published"),
  ])) as [{ data: { slug: string; updated_at: string }[] | null }, { data: { slug: string; updated_at: string }[] | null }];
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/gallery"), changeFrequency: "daily", priority: .9 },
    { url: absoluteUrl("/collections"), changeFrequency: "weekly", priority: .8 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: .6 },
    ...(photos ?? []).map((photo) => ({ url: absoluteUrl(`/gallery/${photo.slug}`), lastModified: photo.updated_at, changeFrequency: "monthly" as const, priority: .75 })),
    ...(collections ?? []).map((collection) => ({ url: absoluteUrl(`/collections/${collection.slug}`), lastModified: collection.updated_at, changeFrequency: "weekly" as const, priority: .7 })),
  ];
}
