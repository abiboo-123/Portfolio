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
    const { image_url, caption, order_index } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from("project_images")
      .insert({
        project_id: params.id,
        image_url,
        caption: caption || null,
        order_index: order_index ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Create image error:", error);
      return NextResponse.json(
        { error: "Failed to create image record" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create image error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
