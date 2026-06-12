import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Ticket, CalendarClock, LogOut, Receipt, FileText } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // 2. Check user role in public.users
  const { data: userData, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || userData?.role !== "ADMIN") {
    // If error or not admin, kick them out
    redirect("/");
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Transactions", href: "/admin/transactions", icon: Receipt },
    { name: "Vouchers", href: "/admin/vouchers", icon: Ticket },
    { name: "Mentoring", href: "/admin/mentoring", icon: CalendarClock },
    { name: "Articles", href: "/admin/articles", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row pt-16">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border md:min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold text-primary tracking-tight">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage 180DC UB</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
