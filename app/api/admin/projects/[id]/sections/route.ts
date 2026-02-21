import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(
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
    const { section_type, title, content, order_index } = body;

    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from("project_sections")
      .insert({
        project_id: params.id,
        section_type: section_type || "text",
        title: title || null,
        content: content || null,
        order_index: order_index ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create section error:", error);
      return NextResponse.json(
        { error: "Failed to create section" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
