import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// For webhook, we must use the service role key to bypass RLS,
// since this request comes from Midtrans server, not an authenticated user.
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

    const { error } = await supabase
      .from("transactions")
      .update({ status: internalStatus })
      .eq("id", transactionId);

    if (error) {
      console.error("Failed to update transaction status:", error);
      throw new Error(error.message);
    }

    console.log(`Transaction ${transactionId} updated to ${internalStatus}`);
    
    return NextResponse.json({ status: "success" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
