import type {
  CmsAdminData,
  CmsAsset,
  CmsSection,
  ContactChannel,
  Skill,
  SocialLink,
} from "@/types/cms";

export type EditableSection = Pick<
  CmsSection,
  "section_key" | "title" | "eyebrow" | "body" | "content" | "status" | "order_index"
>;

export type EditableAsset = Pick<
  CmsAsset,
  | "asset_key"
  | "title"
  | "asset_type"
  | "file_url"
  | "file_name"
  | "file_type"
  | "alt_text"
  | "metadata"
  | "is_active"
>;

export type EditableSocialLink = Partial<Pick<SocialLink, "id">> &
  Pick<SocialLink, "platform" | "label" | "url" | "icon" | "order_index" | "is_active">;

export type EditableSkill = Partial<Pick<Skill, "id">> &
  Pick<Skill, "name" | "category" | "proficiency" | "order_index" | "is_featured" | "is_active">;

export type EditableContactChannel = Partial<Pick<ContactChannel, "id">> &
  Pick<ContactChannel, "channel_type" | "label" | "value" | "url" | "order_index" | "is_active">;

export type EditableCmsData = {
  sections: EditableSection[];
  assets: EditableAsset[];
  socialLinks: EditableSocialLink[];
  skills: EditableSkill[];
  contactChannels: EditableContactChannel[];
};

export const cmsAreas = [
  {
    href: "/admin/content/homepage",
    label: "Homepage",
    icon: "🏠",
    description: "Hero, notices, and homepage-focused content.",
  },
  {
    href: "/admin/content/about",
    label: "About",
    icon: "👤",
    description: "Intro, education, experience, and focus sections.",
  },
  {
    href: "/admin/content/projects",
    label: "Projects",
    icon: "💼",
    description: "Project CRUD, previews, sections, and images.",
  },
  {
    href: "/admin/content/resume",
    label: "Resume / CV",
    icon: "📄",
    description: "Current downloadable resume and related metadata.",
  },
  {
    href: "/admin/content/social",
    label: "Social Links",
    icon: "🔗",
    description: "Ordered social and media profile links.",
  },
  {
    href: "/admin/content/skills",
    label: "Skills",
    icon: "🧠",
    description: "Technologies, categories, and featured skill taxonomy.",
  },
  {
    href: "/admin/content/contact",
    label: "Contact Info",
    icon: "☎️",
    description: "Structured contact channels and future contact-page data.",
  },
  {
    href: "/admin/content/assets",
    label: "Assets",
    icon: "🖼️",
    description: "Profile images and reusable CMS assets.",
  },
  {
    href: "/admin/content/sections",
    label: "Reusable Sections",
    icon: "🧩",
    description: "Future keyed sections that do not belong to one page yet.",
  },
] as const;

export const contentSectionLabels: Record<string, string> = {
  "homepage.hero": "Homepage hero",
  "homepage.notice": "Homepage notice",
  "about.intro": "About intro",
  "about.education": "Education section",
  "about.experience": "Experience section",
  "about.focus": "Backend & AI focus",
};

export const defaultSections: EditableSection[] = [
  {
    section_key: "homepage.hero",
    title: "Hi, I'm Habib Mohamed Gouda.",
    eyebrow: "Back-End Developer · AI-Focused CS Student",
    body: "I build scalable backend systems and real-time applications using Node.js, TypeScript, and modern web technologies.",
    content: {
      secondaryBody:
        "My goal is to combine backend engineering with AI-driven solutions to build high-performance, scalable intelligent applications.",
      primaryCtaLabel: "View Projects",
      primaryCtaHref: "/projects",
      secondaryCtaLabel: "Download CV",
      contactCtaLabel: "Contact Me",
      contactCtaHref: "/contact",
    },
    status: "draft",
    order_index: 10,
  },
  {
    section_key: "homepage.notice",
    title: "Portfolio update notice",
    eyebrow: "",
    body: "This portfolio is actively being updated — more projects and detailed case studies are coming soon.",
    content: {},
    status: "draft",
    order_index: 20,
  },
  {
    section_key: "about.intro",
    title: "About",
    eyebrow: "",
    body: "I'm a back-end developer and Computer Science & Artificial Intelligence student based in Ingolstadt, Germany.",
    content: {},
    status: "draft",
    order_index: 30,
  },
  {
    section_key: "about.education",
    title: "Education",
    eyebrow: "",
    body: "",
    content: {
      items: [
        {
          title: "Technische Hochschule Ingolstadt",
          subtitle: "B.Sc. Computer Science & Artificial Intelligence",
          details: ["Algorithms for AI", "Software Engineering", "Web Technologies", "Data Structures"],
        },
      ],
    },
    status: "draft",
    order_index: 40,
  },
  {
    section_key: "about.experience",
    title: "Professional Experience",
    eyebrow: "",
    body: "",
    content: {
      items: [
        {
          title: "Back-End Developer – QoneQ Startup (Remote)",
          details: ["Built and optimized backend microservices.", "Focused on scalable architecture and clean service boundaries."],
        },
      ],
    },
    status: "draft",
    order_index: 50,
  },
  {
    section_key: "about.focus",
    title: "Backend & AI Focus",
    eyebrow: "",
    body: "I enjoy working at the intersection of backend systems, data infrastructure, and applied AI.",
    content: {
      secondaryBody:
        "My current interests include event-driven architectures, real-time applications, and ways to bring AI models closer to production backends.",
    },
    status: "draft",
    order_index: 60,
  },
];

export const defaultAssets: EditableAsset[] = [
  {
    asset_key: "profile.image",
    title: "Profile image",
    asset_type: "image",
    file_url: "/profile.jpg",
    file_name: "profile.jpg",
    file_type: "image/jpeg",
    alt_text: "Portrait of Habib Mohamed Gouda",
    metadata: {},
    is_active: true,
  },
  {
    asset_key: "resume.current",
    title: "Current CV / Resume",
    asset_type: "document",
    file_url: "/documents/resume.pdf",
    file_name: "Managed resume upload pending",
    file_type: "application/pdf",
    alt_text: "",
    metadata: {},
    is_active: true,
  },
];

export const emptyCmsData: EditableCmsData = {
  sections: defaultSections,
  assets: defaultAssets,
  socialLinks: [],
  skills: [],
  contactChannels: [],
};

export function normalizeCmsData(data: CmsAdminData): EditableCmsData {
  const sectionKeys = new Set(data.sections.map((section) => section.section_key));
  const assetKeys = new Set(data.assets.map((asset) => asset.asset_key));

  return {
    sections: [
      ...data.sections.map((section) => ({
        section_key: section.section_key,
        title: section.title ?? "",
        eyebrow: section.eyebrow ?? "",
        body: section.body ?? "",
        content: section.content ?? {},
        status: section.status,
        order_index: section.order_index,
      })),
      ...defaultSections.filter((section) => !sectionKeys.has(section.section_key)),
    ].sort((a, b) => a.order_index - b.order_index),
    assets: [
      ...data.assets.map((asset) => ({
        asset_key: asset.asset_key,
        title: asset.title,
        asset_type: asset.asset_type,
        file_url: asset.file_url,
        file_name: asset.file_name ?? "",
        file_type: asset.file_type ?? "",
        alt_text: asset.alt_text ?? "",
        metadata: asset.metadata ?? {},
        is_active: asset.is_active,
      })),
      ...defaultAssets.filter((asset) => !assetKeys.has(asset.asset_key)),
    ],
    socialLinks: data.socialLinks,
    skills: data.skills,
    contactChannels: data.contactChannels,
  };
}

export function nextOrder<T extends { order_index: number }>(items: T[]) {
  return items.reduce((max, item) => Math.max(max, item.order_index), 0) + 10;
}

export function getSection(data: EditableCmsData, key: string) {
  return data.sections.find((section) => section.section_key === key);
}

export function getAsset(data: EditableCmsData, key: string) {
  return data.assets.find((asset) => asset.asset_key === key);
}

export interface StructuredCmsItem {
  title: string;
  subtitle?: string;
  details: string[];
}

export interface StructuredCmsContent extends Record<string, unknown> {
  items: StructuredCmsItem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeStructuredCmsContent(
  content: Record<string, unknown>
): StructuredCmsContent {
  const rawItems = Array.isArray(content.items) ? content.items : [];
  const items = rawItems
    .filter(isRecord)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      subtitle: typeof item.subtitle === "string" ? item.subtitle : "",
      details: Array.isArray(item.details)
        ? item.details.filter((detail): detail is string => typeof detail === "string")
        : [],
    }));

  return {
    ...content,
    items,
  };
}
