import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ProjectImage, ProjectSection } from "@/types/project";
import type {
  MessageStatusUpdatePayload,
  CmsPayload,
  ProjectImageCreatePayload,
  ProjectImageUpdatePayload,
  ProjectPayload,
  ProjectSectionCreatePayload,
  ProjectSectionUpdatePayload,
  UploadPayload,
} from "@/lib/validation/schemas";
import { ServiceError } from "./errors";

const PORTFOLIO_IMAGE_BUCKET = "portfolio-images";

function getPortfolioStoragePath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) {
    return null;
  }

  const marker = `/storage/v1/object/public/${PORTFOLIO_IMAGE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const pathWithQuery = publicUrl.slice(markerIndex + marker.length);
  const [path] = pathWithQuery.split("?", 1);
  return path || null;
}

async function cleanupStorageObjectsBestEffort(imageUrls: Array<string | null | undefined>) {
  const supabase = createSupabaseAdminClient();
  const storagePaths = Array.from(
    new Set(
      imageUrls
        .map((url) => getPortfolioStoragePath(url))
        .filter((path): path is string => typeof path === "string" && path.length > 0)
    )
  );

  if (storagePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from(PORTFOLIO_IMAGE_BUCKET)
    .remove(storagePaths);

  if (error) {
    console.warn("[admin] Failed to clean up storage objects:", {
      storagePaths,
      error,
    });
  }
}

async function rollbackDeletedProjectRelations(
  projectId: string,
  deletedSections: ProjectSection[],
  deletedImages: ProjectImage[]
) {
  const supabase = createSupabaseAdminClient();

  const rollbackOperations: PromiseLike<unknown>[] = [];

  if (deletedSections.length > 0) {
    rollbackOperations.push(
      supabase.from("project_sections").insert(
        deletedSections.map((section) => ({
          ...section,
          project_id: projectId,
        }))
      )
    );
  }

  if (deletedImages.length > 0) {
    rollbackOperations.push(
      supabase.from("project_images").insert(
        deletedImages.map((image) => ({
          ...image,
          project_id: projectId,
        }))
      )
    );
  }

  if (rollbackOperations.length === 0) {
    return;
  }

  const results = await Promise.allSettled(rollbackOperations);
  const rollbackFailures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected"
  );

  if (rollbackFailures.length > 0) {
    console.error("[admin] Failed to roll back deleted project relations:", {
      projectId,
      rollbackFailures,
    });
  }
}

export async function createProject(project: ProjectPayload) {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", project.slug)
    .maybeSingle();

  if (existingError) {
    throw new ServiceError("Failed to validate project slug.");
  }

  if (existing) {
    throw new ServiceError("Slug already exists", 400);
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to create project");
  }

  return data;
}

export async function updateProject(projectId: string, project: ProjectPayload) {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("id")
    .eq("slug", project.slug)
    .neq("id", projectId)
    .maybeSingle();

  if (existingError) {
    throw new ServiceError("Failed to validate project slug.");
  }

  if (existing) {
    throw new ServiceError("Slug already exists", 400);
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      ...project,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to update project");
  }

  return data;
}

export async function deleteProject(projectId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: project, error: projectFetchError } = await supabase
    .from("projects")
    .select("featured_image")
    .eq("id", projectId)
    .maybeSingle();

  if (projectFetchError) {
    throw new ServiceError("Failed to load project before deletion");
  }

  const [sectionsResult, imagesResult] = await Promise.all([
    supabase
      .from("project_sections")
      .delete()
      .eq("project_id", projectId)
      .select("*"),
    supabase
      .from("project_images")
      .delete()
      .eq("project_id", projectId)
      .select("*"),
  ]);

  if (sectionsResult.error || imagesResult.error) {
    throw new ServiceError("Failed to delete project relations");
  }

  const deletedSections = (sectionsResult.data ?? []) as ProjectSection[];
  const deletedImages = (imagesResult.data ?? []) as ProjectImage[];

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    await rollbackDeletedProjectRelations(projectId, deletedSections, deletedImages);
    throw new ServiceError("Failed to delete project");
  }

  await cleanupStorageObjectsBestEffort([
    project?.featured_image,
    ...deletedImages.map((image) => image.image_url),
  ]);

  return { success: true as const };
}

export async function createProjectSection(
  projectId: string,
  section: ProjectSectionCreatePayload
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("project_sections")
    .insert({
      project_id: projectId,
      ...section,
    })
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to create section");
  }

  return data;
}

export async function updateProjectSection(
  projectId: string,
  sectionId: string,
  updates: ProjectSectionUpdatePayload
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("project_sections")
    .update(updates)
    .eq("id", sectionId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to update section");
  }

  return data;
}

export async function deleteProjectSection(projectId: string, sectionId: string) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("project_sections")
    .delete()
    .eq("id", sectionId)
    .eq("project_id", projectId);

  if (error) {
    throw new ServiceError("Failed to delete section");
  }

  return { success: true as const };
}

export async function createProjectImage(
  projectId: string,
  image: ProjectImageCreatePayload
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("project_images")
    .insert({
      project_id: projectId,
      ...image,
    })
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to create image record");
  }

  return data;
}

export async function updateProjectImage(
  projectId: string,
  imageId: string,
  updates: ProjectImageUpdatePayload
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("project_images")
    .update(updates)
    .eq("id", imageId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to update image");
  }

  return data;
}

export async function deleteProjectImage(projectId: string, imageId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: image, error: fetchError } = await supabase
    .from("project_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (fetchError) {
    throw new ServiceError("Failed to load image before deletion");
  }

  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", imageId)
    .eq("project_id", projectId);

  if (error) {
    throw new ServiceError("Failed to delete image");
  }

  await cleanupStorageObjectsBestEffort([image?.image_url]);

  return { success: true as const };
}

export async function listContactMessages(status: string | null) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new ServiceError("Failed to fetch messages");
  }

  return data ?? [];
}

export async function getAdminDashboardStats() {
  const supabase = createSupabaseAdminClient();

  const [projectsResult, newMessagesResult, cmsSectionsResult, draftSectionsResult] =
    await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase.from("cms_sections").select("id", { count: "exact", head: true }),
      supabase
        .from("cms_sections")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
    ]);

  if (projectsResult.error || newMessagesResult.error) {
    throw new ServiceError("Failed to load dashboard stats");
  }

  if (cmsSectionsResult.error || draftSectionsResult.error) {
    console.warn("[admin] CMS dashboard counts unavailable. Has the CMS migration been applied?");
  }

  return {
    totalProjects: projectsResult.count ?? 0,
    newMessages: newMessagesResult.count ?? 0,
    editableSections: cmsSectionsResult.error ? 0 : cmsSectionsResult.count ?? 0,
    draftSections: draftSectionsResult.error ? 0 : draftSectionsResult.count ?? 0,
  };
}

export async function updateContactMessageStatus(
  messageId: string,
  payload: MessageStatusUpdatePayload
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    throw new ServiceError("Failed to update message");
  }

  return data;
}

export async function uploadPortfolioImage(payload: UploadPayload) {
  const supabase = createSupabaseAdminClient();
  const { file, type } = payload;
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const folderByType: Record<UploadPayload["type"], string> = {
    featured: "featured",
    project: "projects",
    profile: "profile",
    resume: "documents/resumes",
    cms: "cms",
  };
  const filePath = `${folderByType[type]}/${fileName}`;
  let uploaded = false;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from(PORTFOLIO_IMAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new ServiceError("Failed to upload image");
    }

    uploaded = true;

    const {
      data: { publicUrl },
    } = supabase.storage.from(PORTFOLIO_IMAGE_BUCKET).getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    if (uploaded) {
      await cleanupStorageObjectsBestEffort([
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PORTFOLIO_IMAGE_BUCKET}/${filePath}`,
      ]);
    }

    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Failed to upload image");
  }
}


type ReplaceableCmsTable = "social_links" | "skills" | "contact_channels";

type ReplaceRowsOptions<TRow extends { id?: string; order_index: number }> = {
  table: ReplaceableCmsTable;
  existingIds: string[];
  rows: TRow[];
  mapRow: (row: TRow) => Record<string, unknown>;
};

async function replaceCmsRows<TRow extends { id?: string; order_index: number }>({
  table,
  existingIds,
  rows,
  mapRow,
}: ReplaceRowsOptions<TRow>) {
  const supabase = createSupabaseAdminClient();
  const submittedIds = rows
    .map((row) => row.id)
    .filter((id): id is string => typeof id === "string");
  const idsToDelete = existingIds.filter((id) => !submittedIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error } = await supabase.from(table).delete().in("id", idsToDelete);
    if (error) {
      throw new ServiceError(`Failed to remove ${table.replace("_", " ")}`);
    }
  }

  for (const row of rows) {
    const payload = mapRow(row);

    if (row.id) {
      const { error } = await supabase
        .from(table)
        .update(payload)
        .eq("id", row.id);

      if (error) {
        throw new ServiceError(`Failed to update ${table.replace("_", " ")}`);
      }
      continue;
    }

    const { error } = await supabase.from(table).insert(payload);
    if (error) {
      throw new ServiceError(`Failed to create ${table.replace("_", " ")}`);
    }
  }
}

export async function getCmsAdminData() {
  const supabase = createSupabaseAdminClient();

  const [sectionsResult, assetsResult, socialsResult, skillsResult, contactsResult] =
    await Promise.all([
      supabase.from("cms_sections").select("*").order("order_index"),
      supabase.from("cms_assets").select("*").order("asset_key"),
      supabase.from("social_links").select("*").order("order_index"),
      supabase.from("skills").select("*").order("order_index"),
      supabase.from("contact_channels").select("*").order("order_index"),
    ]);

  if (
    sectionsResult.error ||
    assetsResult.error ||
    socialsResult.error ||
    skillsResult.error ||
    contactsResult.error
  ) {
    throw new ServiceError("Failed to load CMS content");
  }

  return {
    sections: sectionsResult.data ?? [],
    assets: assetsResult.data ?? [],
    socialLinks: socialsResult.data ?? [],
    skills: skillsResult.data ?? [],
    contactChannels: contactsResult.data ?? [],
  };
}

export async function saveCmsAdminData(payload: CmsPayload) {
  const supabase = createSupabaseAdminClient();
  const current = await getCmsAdminData();

  for (const section of payload.sections) {
    const { error } = await supabase.from("cms_sections").upsert(
      {
        section_key: section.section_key,
        title: section.title,
        eyebrow: section.eyebrow,
        body: section.body,
        content: section.content,
        status: section.status,
        order_index: section.order_index,
      },
      { onConflict: "section_key" }
    );

    if (error) {
      throw new ServiceError("Failed to save content sections");
    }
  }

  for (const asset of payload.assets) {
    const { error } = await supabase.from("cms_assets").upsert(
      {
        asset_key: asset.asset_key,
        title: asset.title,
        asset_type: asset.asset_type,
        file_url: asset.file_url,
        file_name: asset.file_name,
        file_type: asset.file_type,
        alt_text: asset.alt_text,
        metadata: asset.metadata,
        is_active: asset.is_active,
      },
      { onConflict: "asset_key" }
    );

    if (error) {
      throw new ServiceError("Failed to save content assets");
    }
  }

  await replaceCmsRows<CmsPayload["socialLinks"][number]>({
    table: "social_links",
    existingIds: current.socialLinks.map((link: { id: string }) => link.id),
    rows: payload.socialLinks,
    mapRow: (link) => ({
      platform: link.platform,
      label: link.label,
      url: link.url,
      icon: link.icon,
      order_index: link.order_index,
      is_active: link.is_active,
    }),
  });

  await replaceCmsRows<CmsPayload["skills"][number]>({
    table: "skills",
    existingIds: current.skills.map((skill: { id: string }) => skill.id),
    rows: payload.skills,
    mapRow: (skill) => ({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      order_index: skill.order_index,
      is_featured: skill.is_featured,
      is_active: skill.is_active,
    }),
  });

  await replaceCmsRows<CmsPayload["contactChannels"][number]>({
    table: "contact_channels",
    existingIds: current.contactChannels.map((channel: { id: string }) => channel.id),
    rows: payload.contactChannels,
    mapRow: (channel) => ({
      channel_type: channel.channel_type,
      label: channel.label,
      value: channel.value,
      url: channel.url,
      order_index: channel.order_index,
      is_active: channel.is_active,
    }),
  });

  return getCmsAdminData();
}

export async function getContactMessage(messageId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    throw new ServiceError("Failed to fetch message");
  }

  if (!data) {
    throw new ServiceError("Message not found", 404);
  }

  return data;
}

export async function getMessageStatusCounts() {
  const supabase = createSupabaseAdminClient();
  const statuses = ["new", "delivered", "read", "replied", "archived"];
  const counts: Record<string, number> = { all: 0 };

  const results = await Promise.all(
    statuses.map((status) =>
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", status)
    )
  );

  for (const [index, result] of results.entries()) {
    if (result.error) {
      throw new ServiceError("Failed to fetch message status counts");
    }

    counts[statuses[index]] = result.count ?? 0;
    counts.all += result.count ?? 0;
  }

  return counts;
}
