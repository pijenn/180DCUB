import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Package, Phone, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { TransactionStatusAction } from "./TransactionStatusAction";

export const dynamic = "force-dynamic";

export default async function AdminTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Use Service Role Key to bypass RLS so we can see all users' data
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch transaction details
  const { data: tx, error: txError } = await supabaseAdmin
    .from("transactions")
    .select(`
      *,
      users ( email, full_name, phone_number ),
      voucher_code ( kode_voucher, tipe_potongan, nilai_potongan )
    `)
    .eq("id", id)
    .single();

  if (txError || !tx) {
    notFound();
  }

  // Fetch transaction items
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("transaction_items")
    .select(`
      *,
      products ( name, type, price, image_url ),
      mentoring_schedules ( start_time, end_time )
    `)
    .eq("transaction_id", tx.id);

  const user = Array.isArray(tx.users) ? tx.users[0] : tx.users;
  const voucher = Array.isArray(tx.voucher_code) ? tx.voucher_code[0] : tx.voucher_code;

  // Format WhatsApp number link
  let waUrl = "";
  if (user?.phone_number) {
    let cleanNumber = user.phone_number.replace(/[^0-9]/g, "");
    if (cleanNumber.startsWith("0")) {
      cleanNumber = "62" + cleanNumber.slice(1);
    }
    waUrl = `https://wa.me/${cleanNumber}`;
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/transactions"
              className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            ID: {tx.id}
          </p>
        </div>
        
        {/* Status Action Component */}
        <TransactionStatusAction transactionId={tx.id} currentStatus={tx.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="col-span-1 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-2">Customer Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{user?.full_name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email || "No email"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone / WhatsApp</p>
                {user?.phone_number ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-medium text-foreground">{user.phone_number}</span>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                        title="Chat on WhatsApp"
                      >
                        <ExternalLink className="w-3 h-3" /> WA
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-xs">Not provided</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-2">Payment Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1 ${
                    tx.status === "SUCCESS"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : tx.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg text-primary">Rp {tx.total_amount.toLocaleString("id-ID")}</p>
              </div>
              {tx.midtrans_transaction_id && (
                <div>
                  <p className="text-muted-foreground">Pakasir ID</p>
                  <p className="font-medium break-all">{tx.midtrans_transaction_id}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(tx.created_at), "PPP p")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-lg">Purchased Items</h3>
            </div>
            <div className="divide-y divide-border">
              {items?.map((item) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products;
                const schedule = Array.isArray(item.mentoring_schedules) ? item.mentoring_schedules[0] : item.mentoring_schedules;

                return (
                  <div key={item.id} className="p-6 flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product?.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{product?.name || "Unknown Product"}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground">{product?.type}</span>
                      </p>
                      
                      {product?.type === "MENTORING" && schedule && (
                        <div className="flex items-center text-sm text-muted-foreground mt-2 bg-muted/50 w-fit px-3 py-1.5 rounded-md">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(schedule.start_time), "PPP p")}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rp {item.price_at_buy.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary Footer */}
            <div className="p-6 bg-muted/20 border-t border-border space-y-2">
              {voucher && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Voucher Applied ({voucher.kode_voucher})</span>
                  <span className="text-emerald-500 font-medium">
                    {voucher.tipe_potongan === "PERCENTAGE" 
                      ? `-${voucher.nilai_potongan}%` 
                      : `-Rp ${voucher.nilai_potongan.toLocaleString("id-ID")}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                <span>Total Paid</span>
                <span className="text-primary">Rp {tx.total_amount.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
