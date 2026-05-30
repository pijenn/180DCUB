import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { sendTransactionSuccessEmails } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Midtrans Webhook Received:", body);

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // 1. Verify Signature
    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      console.error("Invalid Midtrans Signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // 2. Determine our internal status
    let internalStatus = "PENDING";
    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      internalStatus = "SUCCESS";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel"
    ) {
      internalStatus = "FAILED";
    } else if (transaction_status === "expire") {
      internalStatus = "EXPIRED";
    } else if (transaction_status === "pending") {
      internalStatus = "PENDING";
    }

    // 3. Update Database
    // Order ID format we sent was `ORDER-{uuid}`
    const transactionId = order_id.replace("ORDER-", "");

    // Let's get the current status first to prevent double-processing
    const { data: currentTx, error: fetchError } = await supabase
      .from("transactions")
      .select("status, voucher_id, user_id, total_amount")
      .eq("id", transactionId)
      .single();

    if (fetchError || !currentTx) {
      throw new Error("Transaction not found");
    }

    if (currentTx.status !== internalStatus) {
      const { error } = await supabase
        .from("transactions")
        .update({ status: internalStatus })
        .eq("id", transactionId);

      if (error) {
        console.error("Failed to update transaction status:", error);
        throw new Error(error.message);
      }

      // Decrease voucher quota if success
      if (internalStatus === "SUCCESS" && currentTx.voucher_id) {
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

      // Send Emails if SUCCESS
      if (internalStatus === "SUCCESS") {
        await sendTransactionSuccessEmails(transactionId, order_id);
      }
    }

    console.log(`Transaction ${transactionId} updated to ${internalStatus}`);
    
    return NextResponse.json({ status: "success" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
