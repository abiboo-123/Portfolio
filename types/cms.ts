export type CmsSectionStatus = "draft" | "published" | "archived";
export type CmsAssetType = "image" | "document" | "link";

export interface CmsSection {
  id: string;
  section_key: string;
  title: string | null;
  eyebrow: string | null;
  body: string | null;
  content: Record<string, unknown>;
  status: CmsSectionStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CmsAsset {
  id: string;
  asset_key: string;
  title: string;
  asset_type: CmsAssetType;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string | null;
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactChannel {
  id: string;
  channel_type: string;
  label: string;
  value: string;
  url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsAdminData {
  sections: CmsSection[];
  assets: CmsAsset[];
  socialLinks: SocialLink[];
  skills: Skill[];
  contactChannels: ContactChannel[];
}
