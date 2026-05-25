import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import emailjs from "@emailjs/nodejs";

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
        try {
          // 1. Fetch User Info
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("id", currentTx.user_id)
            .single();

          // 2. Fetch Transaction Items with Product Info
          const { data: itemsData } = await supabase
            .from("transaction_items")
            .select(`
              price_at_buy,
              products!inner(name, type, file_url),
              mentoring_schedules(start_time)
            `)
            .eq("transaction_id", transactionId);

          if (userData && itemsData) {
            let itemNames = [];

            // Send email to buyer for each item
            for (const rawItem of itemsData) {
              const item = rawItem as any;
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              const schedule = Array.isArray(item.mentoring_schedules) ? item.mentoring_schedules[0] : item.mentoring_schedules;

              const productName = product?.name || "Product";
              itemNames.push(productName);
              const priceStr = item.price_at_buy?.toLocaleString("id-ID") || "0";
              const fileUrl = product?.file_url || "#";

              const mentorName = product?.type === "MENTORING" 
                ? "Assigned Mentor" 
                : "";
              
              let scheduleTime = "";
              if (product?.type === "MENTORING" && schedule?.start_time) {
                const dateObj = new Date(schedule.start_time);
                scheduleTime = dateObj.toLocaleString("id-ID", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });
              }

              const templateParams = {
                to_email: userData.email,
                to_name: userData.full_name,
                item_name: productName,
                price: priceStr,
                file_url: fileUrl,
                mentor_name: mentorName,
                schedule_time: scheduleTime,
              };

              // Send to Buyer using only Product Template ID
              await emailjs.send(
                process.env.EMAILJS_SERVICE_ID!,
                process.env.EMAILJS_TEMPLATE_ID_PRODUCT!,
                templateParams,
                {
                  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
                  privateKey: process.env.EMAILJS_PRIVATE_KEY!,
                }
              );
            }

            // Send Admin Notification
            const adminParams = {
              to_email: "sngub@180dc.org",
              buyer_name: userData.full_name,
              buyer_email: userData.email,
              items: itemNames.join(", "),
              total_amount: currentTx.total_amount.toLocaleString("id-ID"),
              transaction_id: order_id
            };

            await emailjs.send(
              process.env.EMAILJS_SERVICE_ID!,
              process.env.EMAILJS_TEMPLATE_ID_ADMIN!,
              adminParams,
              {
                publicKey: process.env.EMAILJS_PUBLIC_KEY!,
                privateKey: process.env.EMAILJS_PRIVATE_KEY!,
              }
            );
          }
        } catch (emailError) {
          console.error("Failed to send emails:", emailError);
          // We don't throw here so we can still return 200 OK to Midtrans
        }
      }
    }

    console.log(`Transaction ${transactionId} updated to ${internalStatus}`);
    
    return NextResponse.json({ status: "success" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
