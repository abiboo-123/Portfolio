import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { notFound } from "next/navigation";
import type { Project } from "@/types/project";

async function getProject(id: string): Promise<Project | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_sections (*),
      project_images (*)
    `
    )
    .eq("id", id)
    .order("order_index", { foreignTable: "project_sections", ascending: true })
    .order("order_index", { foreignTable: "project_images", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  return (data as Project | null) ?? null;
}

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Edit Project
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Update project details and content
        </p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
