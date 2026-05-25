"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      const { data: cartData } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cartData) {
        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("cart_id", cartData.id);
        
        setCartCount(count || 0);
      }
    };

    fetchCartCount();
  }, [user, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Product", href: "/product" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
              180DC<span className="text-foreground">UB</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 border-l border-border pl-6">
              <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="text-muted-foreground hover:text-foreground relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <button 
              className="text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === link.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 py-4 mt-4 border-t border-border flex flex-col space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-destructive hover:bg-destructive/10 px-3 py-2 rounded-md transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center w-full bg-primary text-primary-foreground font-medium py-2 rounded-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
