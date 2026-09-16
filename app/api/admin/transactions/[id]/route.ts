import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  markTransactionSuccess,
  verifyAndFulfillPakasirOrder,
} from "@/lib/transaction-service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Verify Authentication & Role
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

    const body = await req.json();
    const { status, action } = body;

    // Handle "sync" with Pakasir action
    if (action === "sync") {
      const syncResult = await verifyAndFulfillPakasirOrder(id);
      return NextResponse.json({
        success: syncResult.success,
        status: syncResult.status,
        pakasirStatus: syncResult.pakasirStatus,
        error: syncResult.error,
        message:
          syncResult.status === "SUCCESS"
            ? "Payment verified on Pakasir and marked as SUCCESS"
            : `Pakasir status: ${syncResult.pakasirStatus || syncResult.status}`,
      });
    }

    if (!status) {
      return NextResponse.json({ error: "Status or action is required" }, { status: 400 });
    }

    if (status === "SUCCESS") {
      const result = await markTransactionSuccess(id);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "Transaction marked as SUCCESS and fulfilled",
      });
    }

    // For statuses other than SUCCESS (e.g. FAILED, EXPIRED, PENDING)
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      message: `Transaction updated to ${status}`,
    });
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
