import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import { CTAButton } from "./CTAButton";
import { GithubIcon, ExternalLinkIcon } from "./icons";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft transition-transform hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark dark:hover:shadow-xl">
      {project.featured_image && (
        <div className="relative h-44 w-full">
          <Image
            src={project.featured_image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <header>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-3 text-xs text-slate-600 dark:text-slate-400">
            {project.short_description}
          </p>
        </header>
        <div className="flex flex-wrap gap-1">
          {project.tech_stack.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="GitHub repository"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Live demo"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            )}
          </div>
          <CTAButton href={`/projects/${project.slug}`} variant="primary">
            View Details
          </CTAButton>
        </div>
      </div>
    </article>
  );
}
