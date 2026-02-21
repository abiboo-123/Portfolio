import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Project } from "@/types/project";

async function getProjects(): Promise<Project[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data ?? [];
}

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your portfolio projects
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:bg-accent dark:hover:bg-accent-light"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center dark:border-slate-600 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No projects yet. Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {project.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {project.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : project.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {project.is_featured ? (
                        <span className="text-sm text-accent">⭐</span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="text-sm font-medium text-accent hover:text-accent-dark dark:text-accent-light dark:hover:text-accent"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
