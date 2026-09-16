import { NextResponse } from "next/server";
import {
  findTransaction,
  markTransactionSuccess,
  verifyAndFulfillPakasirOrder,
} from "@/lib/transaction-service";

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

    // Ensure this webhook is meant for our project (case-insensitive & trimmed)
    if (!project || project.trim().toLowerCase() !== slug.trim().toLowerCase()) {
      console.warn("Invalid project slug received:", project, "expected:", slug);
      return NextResponse.json({ error: "Invalid project slug" }, { status: 400 });
    }

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // 1. First attempt authoritative verification via Pakasir API
    const result = await verifyAndFulfillPakasirOrder(order_id, amount ? Number(amount) : undefined);

    if (result.success) {
      console.log(`Webhook successfully processed order ${order_id}: status ${result.status}`);
      return NextResponse.json({
        status: "success",
        order_status: result.status,
      });
    }

    // 2. Fallback: If verification API had a network hiccup or rate limit, but the webhook payload itself is 'completed'
    if (status === "completed") {
      const tx = await findTransaction(order_id);
      if (tx) {
        // Validate amount matches
        if (amount && Number(amount) !== tx.total_amount) {
          console.error(`Amount mismatch for order ${order_id}: received ${amount}, expected ${tx.total_amount}`);
          return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
        }

        const fulfillResult = await markTransactionSuccess(tx.id, tx.midtrans_transaction_id || order_id);
        if (fulfillResult.success) {
          console.log(`Webhook fallback successfully fulfilled order ${order_id}`);
          return NextResponse.json({ status: "success", order_status: "SUCCESS" });
        }
      }
    }

    console.error("Failed to process webhook order:", order_id, result.error);
    return NextResponse.json(
      { error: result.error || "Failed to process transaction" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
