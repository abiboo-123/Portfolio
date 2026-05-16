import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ProjectImage, ProjectSection } from "@/types/project";
import type {
  MessageStatusUpdatePayload,
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

  const [projectsResult, messagesResult] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  if (projectsResult.error || messagesResult.error) {
    throw new ServiceError("Failed to load dashboard stats");
  }

  return {
    totalProjects: projectsResult.count ?? 0,
    newMessages: messagesResult.count ?? 0,
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
  const filePath = type === "featured" ? `featured/${fileName}` : `projects/${fileName}`;
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
