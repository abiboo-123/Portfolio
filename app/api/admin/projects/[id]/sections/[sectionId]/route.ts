import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: { id: string; sectionId: string } }
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
    const updates: Record<string, unknown> = {};

    if (body.section_type !== undefined) updates.section_type = body.section_type;
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.order_index !== undefined) updates.order_index = body.order_index;

    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from("project_sections")
      .update(updates)
      .eq("id", params.sectionId)
      .eq("project_id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Update section error:", error);
      return NextResponse.json(
        { error: "Failed to update section" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: { id: string; sectionId: string } }
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

    const { error } = await adminSupabase
      .from("project_sections")
      .delete()
      .eq("id", params.sectionId)
      .eq("project_id", params.id);

    if (error) {
      console.error("Delete section error:", error);
      return NextResponse.json(
        { error: "Failed to delete section" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
