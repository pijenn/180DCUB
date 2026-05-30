import emailjs from "@emailjs/nodejs";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function sendTransactionSuccessEmails(transactionId: string, order_id?: string) {
  try {
    // Let's get the current status first
    const { data: currentTx, error: fetchError } = await supabase
      .from("transactions")
      .select("status, voucher_id, user_id, total_amount, midtrans_transaction_id")
      .eq("id", transactionId)
      .single();

    if (fetchError || !currentTx) {
      throw new Error("Transaction not found");
    }

    const orderIdToUse = order_id || `ORDER-${transactionId}`;

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
        transaction_id: orderIdToUse
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
    console.log(`Successfully sent emails for transaction ${transactionId}`);
  } catch (emailError) {
    console.error("Failed to send emails in helper:", emailError);
    // Don't throw so calling functions don't fail
  }
}
