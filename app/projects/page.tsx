import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Project } from "@/types/project";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A collection of backend and AI-focused projects built with Node.js, TypeScript, and modern web technologies.",
};

async function getProjects(): Promise<Project[]> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Projects
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          A selection of my work across backend services, real-time
          communication, and AI-related projects. Most projects are built with
          TypeScript, Node.js, and modern web tooling.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Projects will appear here once created in Supabase.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

