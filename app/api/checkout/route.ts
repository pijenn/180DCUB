import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// We have to use require because midtrans-client often lacks types
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

const mapPaymentMethod = (selected: string) => {
  switch (selected) {
    case "VIRTUAL_ACCOUNT":
      return ["bank_transfer", "echannel"]; // echannel is Mandiri Bill
    case "QRIS":
      return ["gopay", "other_qris"];
    case "CREDIT_CARD":
      return ["credit_card"];
    case "GOPAY":
      return ["gopay"];
    case "SHOPEEPAY":
      return ["shopeepay"];
    case "OVO":
      return ["gopay"]; // Midtrans groups many e-wallets. Just fallback if needed, but we'll pass standard ones.
    default:
      return [];
  }
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems, finalTotal, voucherId, selectedPayment } = body;

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

    // 3. Create Midtrans Snap Token
    const orderId = `ORDER-${transaction.id}`;
    
    let enabledPayments = mapPaymentMethod(selectedPayment);
    if (selectedPayment === "OVO") enabledPayments = ["gopay"]; // For Sandbox, OVO might not be enabled. Just use gopay as a fallback for the sake of demo, or omit enabledPayments. Let's pass it anyway.

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: finalTotal,
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name || "User",
      },
      enabled_payments: enabledPayments.length > 0 ? enabledPayments : undefined,
    };

    const snapResponse = await snap.createTransaction(parameter);

    // 4. Update transaction with midtrans order id (we used our own ID for the order, but we can store the midtrans transaction ID later on webhook)
    await supabase
      .from("transactions")
      .update({ midtrans_transaction_id: orderId })
      .eq("id", transaction.id);

    return NextResponse.json({ 
      token: snapResponse.token,
      transactionId: transaction.id 
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
