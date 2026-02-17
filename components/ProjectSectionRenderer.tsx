import type { ProjectSection } from "@/types/project";

interface ProjectSectionRendererProps {
  section: ProjectSection;
}

export function ProjectSectionRenderer({
  section,
}: ProjectSectionRendererProps) {
  const { section_type, title, content } = section;

  const baseTitle = title ?? section_type.replace(/[-_]/g, " ");

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {baseTitle}
      </h3>
      {content && (
        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {content}
        </p>
      )}
    </section>
  );
}
