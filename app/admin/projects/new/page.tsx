import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          New Project
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Create a new project for your portfolio
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
