"use client";

import type { ReactNode } from "react";
import type { EditableAsset, EditableSection, StructuredCmsItem } from "./cms-data";
import { contentSectionLabels, normalizeStructuredCmsContent } from "./cms-data";

export function SectionEditor({
  section,
  onChange,
  onContentChange,
  contentFields = [],
}: {
  section: EditableSection;
  onChange: (updates: Partial<EditableSection>) => void;
  onContentChange?: (field: string, value: string) => void;
  contentFields?: Array<{ field: string; label: string; multiline?: boolean }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {contentSectionLabels[section.section_key] ?? section.section_key}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {section.section_key}
          </p>
        </div>
        <select
          value={section.status}
          onChange={(event) => onChange({ status: event.target.value as EditableSection["status"] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Title" value={section.title ?? ""} onChange={(value) => onChange({ title: value })} />
        <TextInput label="Eyebrow / label" value={section.eyebrow ?? ""} onChange={(value) => onChange({ eyebrow: value })} />
      </div>
      <TextArea label="Body" value={section.body ?? ""} rows={4} onChange={(value) => onChange({ body: value })} />

      {contentFields.length > 0 && onContentChange && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {contentFields.map((field) =>
            field.multiline ? (
              <TextArea
                key={field.field}
                label={field.label}
                value={String(section.content[field.field] ?? "")}
                rows={3}
                onChange={(value) => onContentChange(field.field, value)}
              />
            ) : (
              <TextInput
                key={field.field}
                label={field.label}
                value={String(section.content[field.field] ?? "")}
                onChange={(value) => onContentChange(field.field, value)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}


export function StructuredListSectionEditor({
  section,
  detailLabel = "Details",
  onChange,
  onItemsChange,
}: {
  section: EditableSection;
  detailLabel?: string;
  onChange: (updates: Partial<EditableSection>) => void;
  onItemsChange: (items: StructuredCmsItem[]) => void;
}) {
  const content = normalizeStructuredCmsContent(section.content);
  const items = content.items;

  const updateItem = (index: number, updates: Partial<StructuredCmsItem>) => {
    onItemsChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item)));
  };

  const addItem = () => {
    onItemsChange([...items, { title: "", subtitle: "", details: [""] }]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateDetails = (index: number, value: string) => {
    updateItem(index, {
      details: value
        .split("\n")
        .map((detail) => detail.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {contentSectionLabels[section.section_key] ?? section.section_key}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {section.section_key}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Structured content is stored in <code>content.items</code>; each detail line is preserved as a list item.
          </p>
        </div>
        <select
          value={section.status}
          onChange={(event) => onChange({ status: event.target.value as EditableSection["status"] })}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Section title" value={section.title ?? ""} onChange={(value) => onChange({ title: value })} />
        <TextInput label="Eyebrow / label" value={section.eyebrow ?? ""} onChange={(value) => onChange({ eyebrow: value })} />
      </div>
      <TextArea
        label="Optional intro text"
        value={section.body ?? ""}
        rows={3}
        onChange={(value) => onChange({ body: value })}
      />

      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Item {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Title" value={item.title} onChange={(value) => updateItem(index, { title: value })} />
              <TextInput label="Subtitle" value={item.subtitle ?? ""} onChange={(value) => updateItem(index, { subtitle: value })} />
            </div>
            <TextArea
              label={`${detailLabel} (one per line)`}
              value={item.details.join("\n")}
              rows={4}
              onChange={(value) => updateDetails(index, value)}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Add structured item
        </button>
      </div>
    </div>
  );
}

export function SectionPreview({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {eyebrow ?? "Preview"}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
}

export function AssetEditor({
  asset,
  uploading,
  onChange,
  onUpload,
}: {
  asset: EditableAsset;
  uploading: boolean;
  onChange: (updates: Partial<EditableAsset>) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {asset.asset_type}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {asset.title}
          </h2>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {asset.asset_key}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={asset.is_active}
            onChange={(event) => onChange({ is_active: event.target.checked })}
          />
          Active
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextInput label="Title" value={asset.title} onChange={(value) => onChange({ title: value })} />
        <TextInput label="File name" value={asset.file_name ?? ""} onChange={(value) => onChange({ file_name: value })} />
        <TextInput label="File type" value={asset.file_type ?? ""} onChange={(value) => onChange({ file_type: value })} />
        <TextInput label="Alt text" value={asset.alt_text ?? ""} onChange={(value) => onChange({ alt_text: value })} />
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Managed URL
        <input
          type="text"
          value={asset.file_url}
          readOnly={asset.asset_type !== "link"}
          onChange={(event) => asset.asset_type === "link" && onChange({ file_url: event.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>
      {asset.asset_type !== "link" && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Upload a file to update this managed storage URL. Manual URL edits are reserved for link assets.
        </p>
      )}

      {asset.asset_type !== "link" && (
        <input
          type="file"
          accept={asset.asset_type === "document" ? "application/pdf" : "image/*"}
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
              event.currentTarget.value = "";
            }
          }}
          className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
        />
      )}
      {uploading && <p className="mt-2 text-xs text-slate-500">Uploading...</p>}
    </div>
  );
}

export function RepeatableListCard({
  title,
  description,
  onAdd,
  children,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800 dark:shadow-soft-dark">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Add item
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      />
    </label>
  );
}
