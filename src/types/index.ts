export interface Category {
  id: number;
  name: string;
  name_km: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface Author {
  id: number;
  name: string;
  name_km: string;
  img_url?: string;
  bio?: string;
  bio_km?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Monk {
  id: number;
  name: string;
  name_km: string;
  title: string;
  title_km: string;
  img_url?: string;
  join_year: number;
  left_year?: number;
  bio?: string;
  bio_km?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Activity {
  id: number;
  category_id?: number;
  title: string;
  title_km: string;
  description?: string;
  description_km?: string;
  img_url?: string;
  video_url?: string;
  event_year: number;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityPhoto {
  id: number;
  activity_id: number;
  img_url: string;
  sort_order: number;
  created_at: Date;
}

export interface Article {
  id: number;
  category_id?: number;
  author_id?: number;
  title?: string;
  title_km: string;
  excerpt?: string;
  excerpt_km?: string;
  content?: string;
  content_km?: string;
  img_url?: string;
  video_url?: string;
  published_date?: Date;
  read_time?: string;
  read_time_km?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TempleHistory {
  id: number;
  history_year: number;
  title_en?: string;
  title_km?: string;
  description_en?: string;
  description_km?: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface HeaderNav {
  id: number;
  label: string;
  label_km: string;
  path: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FooterSection {
  id: number;
  title: string;
  title_km: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface FooterLink {
  id: number;
  section_id: number;
  label: string;
  label_km: string;
  url: string;
  icon?: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ContactInfo {
  id: number;
  info_key: string;
  value_en?: string;
  value_km?: string;
  created_at: Date;
  updated_at: Date;
}
