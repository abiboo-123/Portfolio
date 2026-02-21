"use client";

import { useState } from "react";
import type { ProjectSection } from "@/types/project";

interface ProjectSectionsManagerProps {
  projectId: string;
  sections: ProjectSection[];
}

export function ProjectSectionsManager({
  projectId,
  sections: initialSections,
}: ProjectSectionsManagerProps) {
  const [sections, setSections] = useState<ProjectSection[]>(initialSections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    section_type: "text",
    title: "",
    content: "",
    order_index: sections.length,
  });

  const handleAdd = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add section");
      }

      const data = await response.json();
      setSections([...sections, data]);
      setFormData({
        section_type: "text",
        title: "",
        content: "",
        order_index: sections.length + 1,
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number, updates: Partial<ProjectSection>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/sections/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update section");
      }

      const data = await response.json();
      setSections(sections.map((s) => (s.id === id ? data : s)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/sections/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete section");
      }

      setSections(sections.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete section");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (id: number, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ];

    // Update order_index for both sections
    const updates = [
      { id: newSections[index].id, order_index: index },
      { id: newSections[newIndex].id, order_index: newIndex },
    ];

    setLoading(true);
    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/projects/${projectId}/sections/${update.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_index: update.order_index }),
          })
        )
      );
      setSections(newSections);
    } catch (err) {
      setError("Failed to reorder sections");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Project Sections
        </h2>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark dark:bg-accent dark:hover:bg-accent-light"
        >
          {showAddForm ? "Cancel" : "Add Section"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Type
            </label>
            <select
              value={formData.section_type}
              onChange={(e) =>
                setFormData({ ...formData, section_type: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            >
              <option value="text">Text</option>
              <option value="code">Code</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Section"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {sections.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No sections yet. Add your first section above.
          </p>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900"
            >
              {editingId === section.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    defaultValue={section.title || ""}
                    onBlur={(e) =>
                      handleUpdate(section.id, { title: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                    placeholder="Title"
                  />
                  <textarea
                    defaultValue={section.content || ""}
                    onBlur={(e) =>
                      handleUpdate(section.id, { content: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
                    placeholder="Content"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-slate-200 px-3 py-1 text-sm dark:bg-slate-600"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {section.title || `Section ${index + 1}`}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {section.section_type}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(section.id, "up")}
                        disabled={index === 0}
                        className="rounded px-2 py-1 text-xs disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(section.id, "down")}
                        disabled={index === sections.length - 1}
                        className="rounded px-2 py-1 text-xs disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(section.id)}
                        className="rounded px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(section.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
