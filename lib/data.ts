import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Collection, PhotoWithCollection, SiteSettings } from "@/types/database";

const photoSelect = `
  *,
  collection:collections(id,name,slug)
`;

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
    return data;
  } catch {
    return null;
  }
});

export const getFeaturedPhoto = cache(async (): Promise<PhotoWithCollection | null> => {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("photos")
      .select(photoSelect)
      .eq("status", "published")
      .eq("is_featured", true)
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    return data as PhotoWithCollection | null;
  } catch {
    return null;
  }
});

export async function getRecentPhotos(
  limit = 8
): Promise<PhotoWithCollection[]> {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getRecentPhotos:", error);
      return [];
    }

    return (data ?? []) as PhotoWithCollection[];
  } catch (error) {
    console.error("getRecentPhotos exception:", error);
    return [];
  }
}
export async function getPublishedCollections(limit?: number): Promise<Collection[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("collections")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getGalleryPhotos(options: {
  page: number;
  perPage: number;
  query?: string;
  collection?: string;
  sort?: "newest" | "oldest" | "featured";
}) {
  try {
    const supabase = createPublicClient();
    const from = (options.page - 1) * options.perPage;
    const to = from + options.perPage - 1;
    let query = supabase
      .from("photos")
      .select(photoSelect, { count: "exact" })
      .eq("status", "published")
      .lte("published_at", new Date().toISOString());

    if (options.query) {
      const safe = options.query.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
      if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }
    if (options.collection) {
      const { data: collection } = (await supabase
        .from("collections")
        .select("id")
        .eq("slug", options.collection)
        .eq("status", "published")
        .maybeSingle()) as { data: { id: string } | null };
      if (collection) query = query.eq("collection_id", collection.id);
      else return { photos: [], count: 0 };
    }

    if (options.sort === "oldest") query = query.order("published_at", { ascending: true });
    else if (options.sort === "featured") {
      query = query.order("is_featured", { ascending: false }).order("published_at", { ascending: false });
    } else query = query.order("published_at", { ascending: false });

    const { data, count } = await query.range(from, to);
    return { photos: (data ?? []) as PhotoWithCollection[], count: count ?? 0 };
  } catch {
    return { photos: [], count: 0 };
  }
}

export const getPhotoBySlug = cache(async (slug: string): Promise<PhotoWithCollection | null> => {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("photos")
      .select(photoSelect)
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    return data as PhotoWithCollection | null;
  } catch {
    return null;
  }
});

export async function getPhotoNavigation(photo: PhotoWithCollection): Promise<{ previous: { title: string; slug: string } | null; next: { title: string; slug: string } | null }> {
  try {
    const supabase = createPublicClient();
    const [previous, next] = await Promise.all([
      supabase
        .from("photos")
        .select("title,slug")
        .eq("status", "published")
        .lt("published_at", photo.published_at ?? photo.created_at)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("photos")
        .select("title,slug")
        .eq("status", "published")
        .gt("published_at", photo.published_at ?? photo.created_at)
        .order("published_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    return { previous: previous.data, next: next.data };
  } catch {
    return { previous: null, next: null };
  }
}

export async function getRelatedPhotos(
  photo: PhotoWithCollection
): Promise<PhotoWithCollection[]> {
  if (!photo.collection_id) {
    return [];
  }

  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("photos")
      .select(photoSelect)
      .eq("status", "published")
      .eq("collection_id", photo.collection_id)
      .neq("id", photo.id)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("getRelatedPhotos Supabase error:", error);
      return [];
    }

    return (data ?? []) as PhotoWithCollection[];
  } catch (error) {
    console.error("getRelatedPhotos exception:", error);
    return [];
  }
}

export const getCollectionBySlug = cache(async (slug: string): Promise<Collection | null> => {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
});

export async function getCollectionPhotos(collectionId: string) {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("photos")
      .select(photoSelect)
      .eq("collection_id", collectionId)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return (data ?? []) as PhotoWithCollection[];
  } catch {
    return [];
  }
}

export async function getCollectionCovers(collections: Collection[]) {
  const ids = collections.map((item) => item.cover_photo_id).filter(Boolean) as string[];
  if (!ids.length) return new Map<string, PhotoWithCollection>();
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("photos").select(photoSelect).in("id", ids).eq("status", "published");
    return new Map(((data ?? []) as PhotoWithCollection[]).map((photo) => [photo.id, photo]));
  } catch {
    return new Map<string, PhotoWithCollection>();
  }
}
