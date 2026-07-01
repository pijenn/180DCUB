"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Download, FileDigit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PayoutData {
  owner: string;
  revenue: number;
  transactions: number;
  productsSold: { [productName: string]: number };
}

export default function MentoringInvoicesPage() {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingOwner, setGeneratingOwner] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      const dateStr = oneMonthAgo.toISOString();

      const { data: txs, error } = await supabase
        .from("transactions")
        .select(`
          id, total_amount,
          transaction_items (
            price_at_buy,
            products (name, type, owner)
          )
        `)
        .eq("status", "SUCCESS")
        .gte("created_at", dateStr);

      if (error) {
        throw error;
      }

      // Group by owner
      const grouped: { [key: string]: PayoutData } = {};

      if (txs) {
        txs.forEach((tx: any) => {
          // Calculate the original subtotal of the transaction
          const subtotal = tx.transaction_items.reduce((sum: number, item: any) => sum + item.price_at_buy, 0);

          if (subtotal === 0) return; // Prevent division by zero

          tx.transaction_items.forEach((item: any) => {
            // Arrays from joined tables can sometimes be objects if single(), but let's handle as object here
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            
            if (product && product.type === "MENTORING" && product.owner) {
              const owner = product.owner.trim();
              if (owner === "") return;

              // Calculate proportional final amount based on discounted transaction total
              const proportionalFinalAmount = tx.total_amount * (item.price_at_buy / subtotal);

              if (!grouped[owner]) {
                grouped[owner] = {
                  owner,
                  revenue: 0,
                  transactions: 0,
                  productsSold: {},
                };
              }

              grouped[owner].revenue += proportionalFinalAmount;
              grouped[owner].transactions += 1;
              
              const prodName = product.name;
              if (!grouped[owner].productsSold[prodName]) {
                grouped[owner].productsSold[prodName] = 0;
              }
              grouped[owner].productsSold[prodName] += 1;
            }
          });
        });
      }

      setPayouts(Object.values(grouped).sort((a, b) => b.revenue - a.revenue));
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to load payouts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleDownloadInvoice = (data: PayoutData) => {
    setGeneratingOwner(data.owner);
    try {
      const doc = new jsPDF();
      
      const payoutAmount = data.revenue * 0.8;
      const platformFee = data.revenue * 0.2;
      
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      
      const periodStr = `${format(oneMonthAgo, "dd MMM yyyy")} - ${format(today, "dd MMM yyyy")}`;

      // Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("180 Degrees Consulting UB", 14, 22);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Jl. Veteran No.10-11, Ketawanggede, Kec. Lowokwaru,", 14, 30);
      doc.text("Kota Malang, Jawa Timur 65145", 14, 35);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("MENTORING PAYOUT INVOICE", 14, 50);

      // Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Mentor / Owner:`, 14, 60);
      doc.setFont("helvetica", "bold");
      doc.text(data.owner, 50, 60);

      doc.setFont("helvetica", "normal");
      doc.text(`Period:`, 14, 66);
      doc.setFont("helvetica", "bold");
      doc.text(periodStr, 50, 66);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Generated On:`, 14, 72);
      doc.setFont("helvetica", "bold");
      doc.text(format(today, "dd MMM yyyy HH:mm"), 50, 72);

      // Products Table
      const tableData = Object.entries(data.productsSold).map(([name, qty]) => [
        name,
        qty.toString(),
      ]);

      autoTable(doc, {
        startY: 82,
        head: [['Product Name', 'Sessions Sold']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [4, 120, 87] }, // primary color roughly
      });

      // Financials
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      const formatIDR = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

      doc.text("Gross Revenue (100%):", 120, finalY);
      doc.text(formatIDR(data.revenue), 196, finalY, { align: "right" });
      
      doc.text("Platform Fee (20%):", 120, finalY + 8);
      doc.text(`- ${formatIDR(platformFee)}`, 196, finalY + 8, { align: "right" });

      doc.setLineWidth(0.5);
      doc.line(120, finalY + 12, 196, finalY + 12);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Net Payout (80%):", 120, finalY + 20);
      doc.text(formatIDR(payoutAmount), 196, finalY + 20, { align: "right" });

      // Footer
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text("This is a computer-generated document. No signature is required.", 14, 280);
      
      // Save
      const safeFilename = data.owner.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`payout_${safeFilename}_${format(today, "yyyyMMdd")}.pdf`);
      
      toast.success("Invoice PDF generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF: " + err.message);
    } finally {
      setGeneratingOwner(null);
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentoring Invoices</h1>
          <p className="text-muted-foreground">Payout calculations for the last 30 days (80% for owners).</p>
        </div>
        <button
          onClick={fetchPayouts}
          className="flex items-center space-x-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl font-medium hover:bg-muted/80 transition-colors"
        >
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Calculating payouts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Owner / Mentor</th>
                  <th className="px-6 py-4 font-medium">Sessions Sold</th>
                  <th className="px-6 py-4 font-medium">Gross Revenue</th>
                  <th className="px-6 py-4 font-medium text-emerald-600 dark:text-emerald-400">Net Payout (80%)</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center space-y-3">
                        <FileDigit className="w-10 h-10 text-muted-foreground/30" />
                        <p>No successful mentoring transactions found in the last 30 days.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => {
                    const payoutAmount = payout.revenue * 0.8;
                    return (
                      <tr key={payout.owner} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {payout.owner}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-secondary/20 text-secondary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                            {payout.transactions} Transactions
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-muted-foreground">
                          {formatIDR(payout.revenue)}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {formatIDR(payoutAmount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(payout)}
                            disabled={generatingOwner === payout.owner}
                            className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {generatingOwner === payout.owner ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
