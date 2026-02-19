import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Project } from "@/types/project";
import { CTAButton } from "@/components/CTAButton";
import { GithubIcon, ExternalLinkIcon } from "@/components/icons";
import { ProjectSectionRenderer } from "@/components/ProjectSectionRenderer";

interface ProjectPageProps {
  params: { slug: string };
}

async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
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
      .eq("slug", slug)
      .order("order_index", { foreignTable: "project_sections", ascending: true })
      .order("order_index", { foreignTable: "project_images", ascending: true })
      .maybeSingle();

    if (error) {
      console.error("Error fetching project by slug:", error.message);
      return null;
    }

    return (data as Project | null) ?? null;
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: ProjectPageProps
): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project not found",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: project.title,
    description: project.short_description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const sections = (project.project_sections ?? []).sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  const images = (project.project_images ?? []).sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {project.featured_image && (
            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-600 dark:bg-slate-700 md:h-48 md:w-56">
              <Image
                src={project.featured_image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                Project
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {project.title}
              </h1>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{project.short_description}</p>
            <div className="flex flex-wrap gap-1">
              {project.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
              {project.role && (
                <span className="rounded-full bg-slate-50 px-3 py-1 dark:bg-slate-700">
                  Role: <span className="font-medium">{project.role}</span>
                </span>
              )}
              {project.architecture && (
                <span className="rounded-full bg-slate-50 px-3 py-1 dark:bg-slate-700">
                  Architecture:{" "}
                  <span className="font-medium">{project.architecture}</span>
                </span>
              )}
              {project.status && (
                <span className="rounded-full bg-slate-50 px-3 py-1 dark:bg-slate-700">
                  Status: <span className="font-medium">{project.status}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>View on GitHub</span>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-soft hover:bg-accent-dark"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  <span>Live demo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <article className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Overview
          </h2>
          <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {project.full_description}
          </p>
        </article>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-xs font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Project Details
            </h2>
            <dl className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Tech stack</dt>
                <dd className="text-right">
                  {project.tech_stack.join(", ")}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Created at</dt>
                <dd className="text-right">
                  {new Date(project.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Last updated</dt>
                <dd className="text-right">
                  {new Date(project.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <p>
              Interested in similar work or extending this project with
              AI-driven features?
            </p>
            <div className="mt-8 flex justify-center">
              <CTAButton
                href="/contact"
                variant="primary"
                className="w-full sm:w-auto"
              >
                Get in touch
              </CTAButton>
            </div>
          </section>
        </div>
      </section>

      {sections.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Deep dive
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <ProjectSectionRenderer key={section.id} section={section} />
            ))}
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Gallery
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {images.map((image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={image.image_url}
                    alt={image.caption ?? project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {image.caption && (
                  <figcaption className="px-3 py-2 text-[11px] text-slate-600 dark:text-slate-400">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

