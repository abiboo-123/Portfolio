import Image from "next/image";
import { CTAButton } from "@/components/CTAButton";
import { ProjectCard } from "@/components/ProjectCard";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Project } from "@/types/project";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back-End Developer & AI-Focused CS Student",
  description:
    "I build scalable backend systems and real-time applications using Node.js, TypeScript, and modern web technologies, with a focus on AI-driven intelligent systems.",
};

async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching featured projects:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();

  return (
    
    <div className="space-y-12">
      <section className="grid gap-8 rounded-xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Back-End Developer · AI-Focused CS Student
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Hi, I&apos;m{" "}
            <span className="text-accent">Habib Mohamed Gouda</span>.
          </h1>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            I build scalable backend systems and real-time applications using
            Node.js, TypeScript, and modern web technologies. Alongside
            production experience in microservices architecture, I am pursuing a
            B.Sc. in Computer Science &amp; Artificial Intelligence in Germany,
            with a strong focus on machine learning, algorithms, and
            intelligent system design.
          </p>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            My goal is to combine backend engineering with AI-driven solutions
            to build high-performance, scalable intelligent applications.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <CTAButton href="/projects" variant="primary">
              View Projects
            </CTAButton>
            <CTAButton href="https://drive.google.com/file/d/14P326M7_EWB68zQW5NvXNgR9UlDed2Xw/view?usp=sharing"  variant="secondary" external={true}>
              Download CV
            </CTAButton>
            <CTAButton href="/contact" variant="ghost">
              Contact Me
            </CTAButton>
          </div>
        </div>
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-soft dark:border-slate-600 dark:bg-slate-700 md:h-48 md:w-48">
          <Image
            src="/profile.jpg"
            alt="Portrait of Habib Mohamed Gouda"
            fill
            sizes="192px"
            className="object-cover"
            unoptimized
          />
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Featured Projects
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Selected work showcasing backend engineering and AI-focused
              projects.
            </p>
          </div>
          <CTAButton href="/projects" variant="ghost">
            View all
          </CTAButton>
        </header>
        {featuredProjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Featured projects will appear here once configured in Supabase.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

