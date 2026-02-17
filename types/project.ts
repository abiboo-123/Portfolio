export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'archived' | string;

export interface ProjectSection {
  id: number;
  project_id: string;
  section_type: string;
  title: string | null;
  content: string | null;
  order_index: number | null;
}

export interface ProjectImage {
  id: number;
  project_id: string;
  image_url: string;
  caption: string | null;
  order_index: number | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  role: string | null;
  architecture: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  featured_image: string | null;
  is_featured: boolean;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  project_sections?: ProjectSection[];
  project_images?: ProjectImage[];
}

