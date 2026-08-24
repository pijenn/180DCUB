import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = parseInt((params.page as string) || "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  // Use Service Role Key to bypass RLS so we can see all users' data
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: transactions, error, count } = await supabaseAdmin
    .from("transactions")
    .select(`
      id,
      status,
      total_amount,
      created_at,
      midtrans_transaction_id,
      users ( email, full_name, phone_number )
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const totalPages = count ? Math.ceil(count / limit) : 1;

  if (error) {
    console.error("Error fetching transactions:", error);
    return <div className="p-6">Error loading transactions.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Manage all customer transactions and their payment status.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Customer</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Amount</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-left py-4 px-6 font-medium text-muted-foreground text-sm">Date</th>
                <th className="text-right py-4 px-6 font-medium text-muted-foreground text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions?.map((tx) => {
                  const user = Array.isArray(tx.users) ? tx.users[0] : tx.users;
                  return (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-foreground">{user?.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{user?.email || "No email"}</div>
                        {user?.phone_number && (
                          <div className="flex items-center gap-1 text-xs text-primary font-mono mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone_number}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium">
                        Rp {tx.total_amount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            tx.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : tx.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/transactions/${tx.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
            <div className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/admin/transactions?page=${Math.max(1, page - 1)}`}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${
                  page <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Previous
              </Link>
              <Link
                href={`/admin/transactions?page=${Math.min(totalPages, page + 1)}`}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
