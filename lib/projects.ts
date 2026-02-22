import { Project } from "@/types/project";
import { createSupabaseServerClient } from "./supabase-server";

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Failed to initialize Supabase:", error);
    return [];
  }
}
