import { createClient } from "@supabase/supabase-js";
import { sendTransactionSuccessEmails } from "@/lib/email";

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase service credentials are not configured");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface FulfillmentResult {
  success: boolean;
  message?: string;
  alreadySuccess?: boolean;
  status?: string;
  error?: string;
}

/**
 * Marks a transaction as SUCCESS and executes fulfillment:
 * 1. Updates transactions.status = 'SUCCESS'
 * 2. Decreases voucher quota (if voucher applied)
 * 3. Locks mentoring schedules by setting is_booked = true
 * 4. Triggers buyer access email & admin notification email
 */
export async function markTransactionSuccess(
  transactionId: string,
  orderId?: string
): Promise<FulfillmentResult> {
  const supabase = getAdminSupabase();

  // 1. Fetch current transaction state
  const { data: currentTx, error: fetchError } = await supabase
    .from("transactions")
    .select("id, status, voucher_id, user_id, total_amount, midtrans_transaction_id")
    .eq("id", transactionId)
    .single();

  if (fetchError || !currentTx) {
    return { success: false, error: "Transaction not found: " + transactionId };
  }

  if (currentTx.status === "SUCCESS") {
    return {
      success: true,
      alreadySuccess: true,
      status: "SUCCESS",
      message: "Transaction is already SUCCESS",
    };
  }

  const finalOrderId = orderId || currentTx.midtrans_transaction_id || `ORDER-${currentTx.id}`;

  // 2. Update status to SUCCESS
  const { error: updateError } = await supabase
    .from("transactions")
    .update({ status: "SUCCESS" })
    .eq("id", transactionId);

  if (updateError) {
    return {
      success: false,
      error: "Failed to update transaction status: " + updateError.message,
    };
  }

  // 3. Decrement voucher quota if applicable
  if (currentTx.voucher_id) {
    try {
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
    } catch (vErr) {
      console.error("Failed to update voucher quota:", vErr);
    }
  }

  // 4. Mark mentoring schedules as booked (so slots cannot be double-booked)
  try {
    const { data: items } = await supabase
      .from("transaction_items")
      .select("schedule_id")
      .eq("transaction_id", transactionId);

    if (items && items.length > 0) {
      const scheduleIds = items
        .map((i) => i.schedule_id)
        .filter((id): id is string => Boolean(id));

      if (scheduleIds.length > 0) {
        await supabase
          .from("mentoring_schedules")
          .update({ is_booked: true })
          .in("id", scheduleIds);
      }
    }
  } catch (schedErr) {
    console.error("Failed to mark mentoring schedule as booked:", schedErr);
  }

  // 5. Send fulfillment emails
  try {
    await sendTransactionSuccessEmails(transactionId, finalOrderId);
  } catch (emailErr) {
    console.error("Failed to send fulfillment emails:", emailErr);
  }

  return {
    success: true,
    status: "SUCCESS",
    message: "Transaction fulfilled successfully",
  };
}

/**
 * Finds a transaction by order ID, transaction UUID, or midtrans_transaction_id.
 */
export async function findTransaction(orderIdOrTxId: string) {
  const supabase = getAdminSupabase();
  const cleaned = (orderIdOrTxId || "").trim();
  const rawId = cleaned.replace(/^ORDER-/i, "");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);

  // 1. Try finding by UUID
  if (isUuid) {
    const { data: byId } = await supabase
      .from("transactions")
      .select(`
        id,
        status,
        total_amount,
        midtrans_transaction_id,
        voucher_id,
        user_id,
        created_at,
        users ( email, full_name, phone_number )
      `)
      .eq("id", rawId)
      .maybeSingle();

    if (byId) return byId;
  }

  // 2. Try finding by midtrans_transaction_id (exact)
  const { data: byMidtrans } = await supabase
    .from("transactions")
    .select(`
      id,
      status,
      total_amount,
      midtrans_transaction_id,
      voucher_id,
      user_id,
      created_at,
      users ( email, full_name, phone_number )
    `)
    .eq("midtrans_transaction_id", cleaned)
    .maybeSingle();

  if (byMidtrans) return byMidtrans;

  // 3. Try with ORDER- prefix if not already present
  if (!cleaned.startsWith("ORDER-")) {
    const { data: withPrefix } = await supabase
      .from("transactions")
      .select(`
        id,
        status,
        total_amount,
        midtrans_transaction_id,
        voucher_id,
        user_id,
        created_at,
        users ( email, full_name, phone_number )
      `)
      .eq("midtrans_transaction_id", `ORDER-${cleaned}`)
      .maybeSingle();

    if (withPrefix) return withPrefix;
  }

  return null;
}

/**
 * Verifies transaction status directly against Pakasir API
 * and fulfills the order if Pakasir reports status 'completed'.
 */
export async function verifyAndFulfillPakasirOrder(
  orderIdOrTxId: string,
  expectedAmount?: number
): Promise<{
  success: boolean;
  status: string;
  pakasirStatus?: string;
  transaction?: Record<string, unknown> | null;
  error?: string;
}> {
  const supabase = getAdminSupabase();

  const apiKey = process.env.PAKASIR_API_KEY || "";
  const slug = process.env.PAKASIR_SLUG || "";

  if (!apiKey || !slug) {
    return {
      success: false,
      status: "ERROR",
      error: "Pakasir API Key or Slug is not set in environment variables",
    };
  }

  const tx = await findTransaction(orderIdOrTxId);
  if (!tx) {
    return {
      success: false,
      status: "NOT_FOUND",
      error: `Transaction not found for ID: ${orderIdOrTxId}`,
    };
  }

  // If already SUCCESS in our database, return immediately
  if (tx.status === "SUCCESS") {
    return {
      success: true,
      status: "SUCCESS",
      pakasirStatus: "completed",
      transaction: tx,
    };
  }

  const orderIdToVerify = tx.midtrans_transaction_id || `ORDER-${tx.id}`;
  const amountToVerify = expectedAmount || tx.total_amount;

  const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${encodeURIComponent(
    slug.trim()
  )}&amount=${amountToVerify}&order_id=${encodeURIComponent(
    orderIdToVerify.trim()
  )}&api_key=${encodeURIComponent(apiKey.trim())}`;

  try {
    const res = await fetch(verifyUrl, { cache: "no-store" });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Pakasir verify API HTTP error:", res.status, errText);
      return {
        success: false,
        status: tx.status,
        error: `Pakasir API returned status ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();
    if (!data.transaction) {
      console.error("Invalid response from Pakasir verification API:", data);
      return {
        success: false,
        status: tx.status,
        error: "Invalid response from Pakasir API",
      };
    }

    const pakasirStatus = (data.transaction.status || "").toLowerCase();

    if (pakasirStatus === "completed") {
      const fulfillResult = await markTransactionSuccess(tx.id, orderIdToVerify);
      return {
        success: fulfillResult.success,
        status: "SUCCESS",
        pakasirStatus: "completed",
        transaction: { ...tx, status: "SUCCESS" },
        error: fulfillResult.error,
      };
    } else if (pakasirStatus === "canceled") {
      await supabase.from("transactions").update({ status: "FAILED" }).eq("id", tx.id);
      return {
        success: true,
        status: "FAILED",
        pakasirStatus: "canceled",
        transaction: { ...tx, status: "FAILED" },
      };
    } else {
      return {
        success: true,
        status: tx.status,
        pakasirStatus: pakasirStatus || "pending",
        transaction: tx,
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error verifying with Pakasir:", err);
    return {
      success: false,
      status: tx.status,
      error: message || "Failed to contact Pakasir verification API",
    };
  }
}

/**
 * Scans recent PENDING transactions and syncs each with Pakasir.
 */
export async function syncAllPendingTransactions(limit = 25) {
  const supabase = getAdminSupabase();

  const { data: pendingTxs, error } = await supabase
    .from("transactions")
    .select("id, midtrans_transaction_id, total_amount")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !pendingTxs) {
    return {
      success: false,
      error: error?.message || "Failed to fetch pending transactions",
      checked: 0,
      updatedToSuccess: 0,
      results: [],
    };
  }

  let updatedCount = 0;
  const results = [];

  for (const tx of pendingTxs) {
    const res = await verifyAndFulfillPakasirOrder(tx.id, tx.total_amount);
    if (res.status === "SUCCESS") {
      updatedCount++;
    }
    results.push({
      id: tx.id,
      orderId: tx.midtrans_transaction_id,
      status: res.status,
      pakasirStatus: res.pakasirStatus,
    });
  }

  return {
    success: true,
    checked: pendingTxs.length,
    updatedToSuccess: updatedCount,
    results,
  };
}
