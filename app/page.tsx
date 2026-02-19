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

  const cvUrl = "https://drive.google.com/file/d/1UwkU43P3pg9eKACRa-GJZlm8w33sdOxn/view?usp=sharing";

  return (
    <div className="space-y-12">
      <section className="flex flex-col-reverse gap-8 rounded-xl border border-slate-100 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark md:flex-row md:items-center md:justify-between md:gap-12">
        <div className="space-y-4 text-center md:w-2/3 md:text-left">
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
          <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center md:justify-start">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CTAButton href="/projects" variant="primary" className="w-full sm:w-auto">
                View Projects
              </CTAButton>
              <CTAButton
                href={cvUrl}
                variant="secondary"
                external={true}
                className="w-full sm:w-auto"
              >
                Download CV
              </CTAButton>
            </div>
            <CTAButton
              href="/contact"
              variant="ghost"
              className="w-full sm:w-auto sm:ml-3"
            >
              Contact Me
            </CTAButton>
          </div>
        </div>
        <div className="flex w-full justify-center md:w-1/3 md:justify-end">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-soft dark:border-slate-600 dark:bg-slate-700 md:h-[320px] md:w-[320px] lg:h-[320px] lg:w-[320px]">
            <Image
              src="/profile.jpg"
              alt="Portrait of Habib Mohamed Gouda"
              fill
              sizes="(max-width: 768px) 160px, (max-width: 1024px) 420px, 480px"
              className="object-cover object-[center_20%]"
              unoptimized
            />
          </div>
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
          <CTAButton href="/projects" variant="ghost" className="whitespace-nowrap">
            All Projects
          </CTAButton>
        </header>
        {featuredProjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Featured projects will appear here once configured in Supabase.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

