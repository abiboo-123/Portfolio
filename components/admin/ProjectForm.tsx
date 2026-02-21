"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project, ProjectSection, ProjectImage } from "@/types/project";
import { ProjectSectionsManager } from "./ProjectSectionsManager";
import { ProjectImagesManager } from "./ProjectImagesManager";

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;

  const [formData, setFormData] = useState({
    title: project?.title || "",
    slug: project?.slug || "",
    short_description: project?.short_description || "",
    full_description: project?.full_description || "",
    role: project?.role || "",
    architecture: project?.architecture || "",
    tech_stack: project?.tech_stack || [] as string[],
    github_url: project?.github_url || "",
    live_url: project?.live_url || "",
    featured_image: project?.featured_image || "",
    is_featured: project?.is_featured || false,
    status: project?.status || ("completed" as Project["status"]),
  });

  const [techStackInput, setTechStackInput] = useState("");
  const [sections, setSections] = useState<ProjectSection[]>(
    project?.project_sections || []
  );
  const [images, setImages] = useState<ProjectImage[]>(
    project?.project_images || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleTechStackAdd = () => {
    if (techStackInput.trim() && !formData.tech_stack.includes(techStackInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techStackInput.trim()],
      }));
      setTechStackInput("");
    }
  };

  const handleTechStackRemove = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tech),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "featured");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, featured_image: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/projects/${project.id}`
        : "/api/admin/projects";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save project");
      }

      const data = await response.json();
      router.push(`/admin/projects/${data.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
      setLoading(false);
    }
  };

  // Create preview project object
  const previewProject: Project = {
    id: project?.id || "preview",
    ...formData,
    tech_stack: formData.tech_stack,
    created_at: project?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Project Details
            </h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Short Description *
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Description *
                </label>
                <textarea
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Architecture
                </label>
                <input
                  type="text"
                  name="architecture"
                  value={formData.architecture}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tech Stack
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleTechStackAdd();
                      }
                    }}
                    placeholder="Add technology"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleTechStackAdd}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleTechStackRemove(tech)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  GitHub URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Live URL
                </label>
                <input
                  type="url"
                  name="live_url"
                  value={formData.live_url}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                {uploadingImage && (
                  <p className="mt-1 text-xs text-slate-500">Uploading...</p>
                )}
                {formData.featured_image && (
                  <div className="mt-2">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Featured
                  </span>
                </label>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="planned">Planned</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:hover:bg-accent-light"
              >
                {loading ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/projects")}
                className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Sections and Images Management - Only show when editing */}
        {isEditing && project && (
          <>
            <ProjectSectionsManager projectId={project.id} sections={sections} />
            <ProjectImagesManager projectId={project.id} images={images} />
          </>
        )}
      </div>

      {/* Live Preview */}
      <div className="lg:sticky lg:top-24">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Live Preview
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <ProjectCard project={previewProject} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
