"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cmsAreas } from "./cms-data";

export function CmsPageShell({
  title,
  description,
  saving,
  loading,
  error,
  success,
  onSave,
  children,
}: {
  title: string;
  description: string;
  saving?: boolean;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  onSave?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            CMS Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || loading}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-accent-light"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      <nav className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
        {cmsAreas.map((area) => {
          const active = pathname === area.href;
          return (
            <Link
              key={area.href}
              href={area.href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <span>{area.icon}</span>
              <span>{area.label}</span>
            </Link>
          );
        })}
      </nav>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:shadow-soft-dark">
          Loading CMS content...
        </div>
      ) : (
        children
      )}
    </div>
  );
}
