import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTransactionSuccessEmails } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Pakasir Webhook Received:", body);

    const {
      amount,
      order_id,
      project,
      status,
    } = body;

    const apiKey = process.env.PAKASIR_API_KEY || "";
    const slug = process.env.PAKASIR_SLUG || "";

    if (!apiKey || !slug) {
      console.error("Pakasir API Key or Slug is not set in environment variables");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    // Ensure this webhook is meant for our project
    if (project !== slug) {
      return NextResponse.json({ error: "Invalid project slug" }, { status: 400 });
    }

    // 1. Validate Transaction via Pakasir API
    const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${slug}&amount=${amount}&order_id=${order_id}&api_key=${apiKey}`;
    const response = await fetch(verifyUrl);
    
    if (!response.ok) {
      console.error("Failed to verify transaction with Pakasir", await response.text());
      return NextResponse.json({ error: "Verification Failed" }, { status: 400 });
    }

    const data = await response.json();
    if (!data.transaction) {
      console.error("Invalid response from Pakasir verification");
      return NextResponse.json({ error: "Verification Failed" }, { status: 400 });
    }

    const transactionStatus = data.transaction.status;

    // 2. Determine our internal status
    let internalStatus = "PENDING";
    if (transactionStatus === "completed") {
      internalStatus = "SUCCESS";
    } else if (transactionStatus === "canceled") {
      internalStatus = "FAILED";
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
      console.error("Transaction not found:", transactionId);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
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
