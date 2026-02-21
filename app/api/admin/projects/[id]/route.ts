import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const supabase = await createSupabaseAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      short_description,
      full_description,
      role,
      architecture,
      tech_stack,
      github_url,
      live_url,
      featured_image,
      is_featured,
      status,
    } = body;

    // Validate required fields
    if (!title || !slug || !short_description || !full_description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const adminSupabase = createSupabaseAdminClient();

    // Check if slug already exists (excluding current project)
    const { data: existing } = await adminSupabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .neq("id", params.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
      .from("projects")
      .update({
        title,
        slug,
        short_description,
        full_description,
        role: role || null,
        architecture: architecture || null,
        tech_stack: tech_stack || [],
        github_url: github_url || null,
        live_url: live_url || null,
        featured_image: featured_image || null,
        is_featured: is_featured || false,
        status: status || "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Update project error:", error);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const supabase = await createSupabaseAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createSupabaseAdminClient();

    // Delete related sections and images first
    await Promise.all([
      adminSupabase.from("project_sections").delete().eq("project_id", params.id),
      adminSupabase.from("project_images").delete().eq("project_id", params.id),
    ]);

    const { error } = await adminSupabase
      .from("projects")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Delete project error:", error);
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
