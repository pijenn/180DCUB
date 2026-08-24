import { createClient } from "@/lib/supabase/server";
import { DollarSign, ShoppingBag, BookOpen, Presentation, Users, FileCheck, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("status", "SUCCESS");

  const totalSales = transactions?.length || 0;
  const grossProfit = transactions?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

  // Fetch writing test submissions count
  const { count: writingTestsCount } = await supabase
    .from("become_writing_tests")
    .select("*", { count: "exact", head: true });

  // Fetch applicants count
  const { count: applicantsCount } = await supabase
    .from("become_applicants")
    .select("*", { count: "exact", head: true });

  const { data: items } = await supabase
    .from("transaction_items")
    .select(`
      products!inner(type),
      transactions!inner(status)
    `)
    .eq("transactions.status", "SUCCESS");

  const salesByType = {
    DECK: 0,
    CASEBOOK: 0,
    MENTORING: 0,
  };

  if (items) {
    items.forEach((item: any) => {
      const type = item.products.type as keyof typeof salesByType;
      if (salesByType[type] !== undefined) {
        salesByType[type] += 1;
      }
    });
  }

  // Formatting currency
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Monitor store performance, sales analytics, and recruitment status.</p>
      </div>

      {/* Top Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
            <h3 className="text-2xl font-bold">{formatIDR(grossProfit)}</h3>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
            <h3 className="text-2xl font-bold">{totalSales} Transaksi</h3>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Writing Tests</p>
            <h3 className="text-2xl font-bold">{writingTestsCount ?? 0} Submissions</h3>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Applicants Status</p>
            <h3 className="text-2xl font-bold">{applicantsCount ?? 0} Candidates</h3>
          </div>
        </div>
      </div>

      {/* Recruitment Quick Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Recruitment & Screening</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/writing-tests"
            className="group p-6 bg-card hover:bg-muted/30 rounded-2xl border border-border transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  Writing Test Submissions
                </h3>
                <p className="text-sm text-muted-foreground">
                  View Drive response links, filter by department, & export CSV.
                </p>
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          <Link
            href="/admin/become"
            className="group p-6 bg-card hover:bg-muted/30 rounded-2xl border border-border transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                  Become 180 Applicants
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage pass/fail status for Batch 1 & 2 recruitment.
                </p>
              </div>
            </div>
            <div className="text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Product Breakdown */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Penjualan Based on Product Type</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Presentation className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Winner's Deck</h3>
            </div>
            <p className="text-3xl font-bold">{salesByType.DECK}</p>
            <p className="text-sm text-muted-foreground mt-1">Terjual</p>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold">Casebook</h3>
            </div>
            <p className="text-3xl font-bold">{salesByType.CASEBOOK}</p>
            <p className="text-sm text-muted-foreground mt-1">Terjual</p>
          </div>

          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold">Mentoring</h3>
            </div>
            <p className="text-3xl font-bold">{salesByType.MENTORING}</p>
            <p className="text-sm text-muted-foreground mt-1">Terjual</p>
          </div>
        </div>
      </div>
    </div>
  );
}
