"use client";

import { useState } from "react";
import type { ProjectImage } from "@/types/project";

interface ProjectImagesManagerProps {
  projectId: string;
  images: ProjectImage[];
}

export function ProjectImagesManager({
  projectId,
  images: initialImages,
}: ProjectImagesManagerProps) {
  const [images, setImages] = useState<ProjectImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "project");
      formData.append("projectId", projectId);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const { url } = await response.json();

      // Create image record
      const createResponse = await fetch(
        `/api/admin/projects/${projectId}/images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: url,
            caption: "",
            order_index: images.length,
          }),
        }
      );

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.error || "Failed to create image record");
      }

      const newImage = await createResponse.json();
      setImages([...images, newImage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: number, updates: Partial<ProjectImage>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/images/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update image");
      }

      const data = await response.json();
      setImages(images.map((img) => (img.id === id ? data : img)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/projects/${projectId}/images/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete image");
      }

      setImages(images.filter((img) => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (id: number, direction: "up" | "down") => {
    const index = images.findIndex((img) => img.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [
      newImages[newIndex],
      newImages[index],
    ];

    // Update order_index for both images
    const updates = [
      { id: newImages[index].id, order_index: index },
      { id: newImages[newIndex].id, order_index: newIndex },
    ];

    setLoading(true);
    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/projects/${projectId}/images/${update.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_index: update.order_index }),
          })
        )
      );
      setImages(newImages);
    } catch (err) {
      setError("Failed to reorder images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Project Images
        </h2>
        <label className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark dark:bg-accent dark:hover:bg-accent-light">
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">
            No images yet. Upload your first image above.
          </p>
        ) : (
          images.map((image, index) => (
            <div
              key={image.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900"
            >
              <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700">
                <img
                  src={image.image_url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <input
                type="text"
                defaultValue={image.caption || ""}
                onBlur={(e) =>
                  handleUpdate(image.id, { caption: e.target.value })
                }
                placeholder="Caption"
                className="mb-2 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(image.id, "up")}
                    disabled={index === 0}
                    className="rounded px-2 py-1 text-xs disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(image.id, "down")}
                    disabled={index === images.length - 1}
                    className="rounded px-2 py-1 text-xs disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  className="rounded px-2 py-1 text-xs text-red-600 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
