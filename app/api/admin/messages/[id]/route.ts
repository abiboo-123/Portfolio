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
    const { status } = body;

    if (!status || !["new", "read", "replied", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from("contact_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Update message error:", error);
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
