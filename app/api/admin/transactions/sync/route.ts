import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAllPendingTransactions } from "@/lib/transaction-service";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication & Admin Role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const summary = await syncAllPendingTransactions(50);

    return NextResponse.json({
      message: `Checked ${summary.checked} pending transaction(s). ${summary.updatedToSuccess} marked as SUCCESS.`,
      ...summary,
    });
  } catch (error: any) {
    console.error("Error bulk syncing transactions:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
