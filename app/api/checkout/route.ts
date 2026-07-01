import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems, finalTotal, voucherId } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Create Transaction in Supabase
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        total_amount: finalTotal,
        status: "PENDING",
        voucher_id: voucherId || null,
      })
      .select()
      .single();

    if (txError) {
      throw new Error("Failed to create transaction: " + txError.message);
    }

    // 2. Insert Transaction Items
    const transactionItemsData = cartItems.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      schedule_id: item.schedule_id || null,
      price_at_buy: item.products.price,
    }));

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(transactionItemsData);

    if (itemsError) {
      throw new Error("Failed to insert transaction items: " + itemsError.message);
    }

    // 3. Generate Pakasir Checkout URL
    const orderId = `ORDER-${transaction.id}`;
    
    // We update the transaction with our own generated ID as the identifier
    // For Pakasir, we use this orderId as reference
    await supabase
      .from("transactions")
      .update({ midtrans_transaction_id: orderId }) // We can keep using this column or rename it later, but using it avoids schema change
      .eq("id", transaction.id);

    const slug = process.env.PAKASIR_SLUG || "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    if (!slug) {
      throw new Error("PAKASIR_SLUG environment variable is not set");
    }

    // Format: https://app.pakasir.com/pay/{slug}/{amount}?order_id={order_id}&qris_only=1&redirect={redirect_url}
    const checkoutUrl = `https://app.pakasir.com/pay/${slug}/${finalTotal}?order_id=${orderId}&qris_only=1&redirect=${encodeURIComponent(baseUrl + '/success')}`;

    return NextResponse.json({ 
      checkout_url: checkoutUrl,
      transactionId: transaction.id 
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
