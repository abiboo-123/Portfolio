import type { ProjectSection } from "@/types/project";

interface ProjectSectionRendererProps {
  section: ProjectSection;
}

export function ProjectSectionRenderer({
  section,
}: ProjectSectionRendererProps) {
  const { section_type, title, content } = section;

  // Simple heuristic rendering based on section_type; easy to extend later.
  const baseTitle = title ?? section_type.replace(/[-_]/g, " ");

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-soft">
      <h3 className="text-sm font-semibold tracking-tight text-slate-900">
        {baseTitle}
      </h3>
      {content && (
        <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700">
          {content}
        </p>
      )}
    </section>
  );
}

