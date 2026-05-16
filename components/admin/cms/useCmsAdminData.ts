"use client";

import { useEffect, useMemo, useState } from "react";
import { parseAdminApiResponse } from "@/lib/api/client";
import type { CmsAdminData } from "@/types/cms";
import {
  emptyCmsData,
  getAsset,
  getSection,
  nextOrder,
  normalizeCmsData,
  type EditableAsset,
  type EditableCmsData,
  type EditableContactChannel,
  type EditableSection,
  type EditableSkill,
  type EditableSocialLink,
} from "./cms-data";

export function useCmsAdminData() {
  const [cmsData, setCmsData] = useState<EditableCmsData>(emptyCmsData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const helpers = useMemo(
    () => ({
      getSection: (key: string) => getSection(cmsData, key),
      getAsset: (key: string) => getAsset(cmsData, key),
    }),
    [cmsData]
  );

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/cms");
      const data = await parseAdminApiResponse<CmsAdminData>(
        response,
        "Failed to load CMS content. Apply the CMS migration if this is the first run."
      );
      setCmsData(normalizeCmsData(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CMS content");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (successMessage = "Content saved successfully.") => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData),
      });
      const data = await parseAdminApiResponse<CmsAdminData>(
        response,
        "Failed to save CMS content"
      );
      setCmsData(normalizeCmsData(data));
      setSuccess(`${successMessage} Public pages are not wired to this CMS data yet.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save CMS content");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (sectionKey: string, updates: Partial<EditableSection>) => {
    setCmsData((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.section_key === sectionKey ? { ...section, ...updates } : section
      ),
    }));
  };

  const updateSectionContent = (sectionKey: string, field: string, value: string) => {
    updateSectionContentValue(sectionKey, field, value);
  };

  const updateSectionContentValue = (
    sectionKey: string,
    field: string,
    value: unknown
  ) => {
    setCmsData((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.section_key === sectionKey
          ? { ...section, content: { ...section.content, [field]: value } }
          : section
      ),
    }));
  };

  const updateAsset = (assetKey: string, updates: Partial<EditableAsset>) => {
    setCmsData((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        asset.asset_key === assetKey ? { ...asset, ...updates } : asset
      ),
    }));
  };

  const uploadAsset = async (assetKey: string, file: File) => {
    const asset = helpers.getAsset(assetKey);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", asset?.asset_type === "document" ? "resume" : "profile");
    formData.append("assetKey", assetKey);

    setUploadingKey(assetKey);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await parseAdminApiResponse<{ url: string }>(
        response,
        "Failed to upload asset"
      );
      updateAsset(assetKey, {
        file_url: result.url,
        file_name: file.name,
        file_type: file.type,
      });
      setSuccess("Asset uploaded and the managed CMS asset record was updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload asset");
    } finally {
      setUploadingKey(null);
    }
  };

  const addSocialLink = () => {
    setCmsData((current) => ({
      ...current,
      socialLinks: [
        ...current.socialLinks,
        {
          platform: "New platform",
          label: "New link",
          url: "https://example.com",
          icon: "",
          order_index: nextOrder(current.socialLinks),
          is_active: true,
        },
      ],
    }));
  };

  const updateSocialLink = (index: number, updates: Partial<EditableSocialLink>) => {
    setCmsData((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeSocialLink = (index: number) => {
    setCmsData((current) => ({
      ...current,
      socialLinks: current.socialLinks.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addSkill = () => {
    setCmsData((current) => ({
      ...current,
      skills: [
        ...current.skills,
        {
          name: "New skill",
          category: "General",
          proficiency: "",
          order_index: nextOrder(current.skills),
          is_featured: false,
          is_active: true,
        },
      ],
    }));
  };

  const updateSkill = (index: number, updates: Partial<EditableSkill>) => {
    setCmsData((current) => ({
      ...current,
      skills: current.skills.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeSkill = (index: number) => {
    setCmsData((current) => ({
      ...current,
      skills: current.skills.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addContactChannel = () => {
    setCmsData((current) => ({
      ...current,
      contactChannels: [
        ...current.contactChannels,
        {
          channel_type: "email",
          label: "Email",
          value: "hello@example.com",
          url: "mailto:hello@example.com",
          order_index: nextOrder(current.contactChannels),
          is_active: true,
        },
      ],
    }));
  };

  const updateContactChannel = (index: number, updates: Partial<EditableContactChannel>) => {
    setCmsData((current) => ({
      ...current,
      contactChannels: current.contactChannels.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeContactChannel = (index: number) => {
    setCmsData((current) => ({
      ...current,
      contactChannels: current.contactChannels.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return {
    cmsData,
    loading,
    saving,
    uploadingKey,
    error,
    success,
    helpers,
    fetchContent,
    saveContent,
    updateSection,
    updateSectionContent,
    updateSectionContentValue,
    updateAsset,
    uploadAsset,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    addSkill,
    updateSkill,
    removeSkill,
    addContactChannel,
    updateContactChannel,
    removeContactChannel,
  };
}
