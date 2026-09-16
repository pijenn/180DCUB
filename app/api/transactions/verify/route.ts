import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findTransaction, verifyAndFulfillPakasirOrder } from "@/lib/transaction-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id parameter" }, { status: 400 });
    }

    const result = await verifyAndFulfillPakasirOrder(orderId);

    // Fetch rich details for the success page display
    const tx = await findTransaction(orderId);

    let items: any[] = [];
    if (tx) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: itemsData } = await supabase
        .from("transaction_items")
        .select(`
          price_at_buy,
          products ( name, type, image_url, file_url, owner ),
          mentoring_schedules ( start_time, end_time )
        `)
        .eq("transaction_id", tx.id);
      items = itemsData || [];
    }

    return NextResponse.json({
      success: result.success,
      status: result.status,
      pakasirStatus: result.pakasirStatus,
      transaction: tx
        ? {
            id: tx.id,
            status: tx.status,
            total_amount: tx.total_amount,
            created_at: tx.created_at,
            order_id: tx.midtrans_transaction_id,
            user: tx.users,
            items,
          }
        : null,
      error: result.error,
    });
  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body.order_id || body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const result = await verifyAndFulfillPakasirOrder(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Verification API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
