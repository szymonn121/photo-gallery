export type PhotoStatus = "draft" | "published";
export type CollectionStatus = "draft" | "published";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_photo_id: string | null;
  status: CollectionStatus;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  title: string;
  slug: string;
  description: string;
  alt_text: string;
  original_image_url: string;
  thumbnail_url: string;
  original_storage_path: string;
  thumbnail_storage_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  hero_focus_x: number;
  hero_focus_y: number;
  hero_mobile_focus_x: number;
  hero_mobile_focus_y: number;
  blur_data_url: string | null;
  location_name: string | null;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  camera: string | null;
  lens: string | null;
  focal_length: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: number | null;
  captured_at: string | null;
  published_at: string | null;
  status: PhotoStatus;
  is_featured: boolean;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhotoWithCollection extends Photo {
  collection: Pick<Collection, "id" | "name" | "slug"> | null;
}

export interface SiteSettings {
  id: boolean;
  photographer_name: string;
  gallery_name: string;
  intro: string;
  biography: string;
  photography_style: string;
  equipment: string;
  email: string | null;
  instagram_url: string | null;
  x_url: string | null;
  watermark_enabled: boolean;
  watermark_text: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      photos: {
        Row: Photo;
        Insert: Omit<Photo, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Photo, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Collection, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: SiteSettings;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string; email: string; created_at: string };
        Insert: { user_id: string; email: string; created_at?: string };
        Update: { email?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_login_rate_limit: {
        Args: { p_key: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
