import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionSuccessEmails } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Verify Authentication & Role
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userData?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // 2. Get current transaction state
    const { data: currentTx, error: fetchError } = await supabase
      .from("transactions")
      .select("status, voucher_id")
      .eq("id", id)
      .single();

    if (fetchError || !currentTx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (currentTx.status === status) {
      return NextResponse.json({ message: "Status is already " + status });
    }

    // 3. Update Status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 4. Handle Post-Update Logic if new status is SUCCESS
    if (status === "SUCCESS") {
      // Decrease voucher quota if applicable
      if (currentTx.voucher_id) {
        const { data: voucher } = await supabase
          .from("voucher_code")
          .select("kuota")
          .eq("id", currentTx.voucher_id)
          .single();

        if (voucher && voucher.kuota > 0) {
          await supabase
            .from("voucher_code")
            .update({ kuota: voucher.kuota - 1 })
            .eq("id", currentTx.voucher_id);
        }
      }

      // Send the fulfillment emails
      await sendTransactionSuccessEmails(id);
    }

    return NextResponse.json({ success: true, message: "Transaction updated successfully" });
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
