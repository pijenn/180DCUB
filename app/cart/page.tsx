"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, ArrowLeft, Ticket, CreditCard, Wallet, QrCode, Banknote } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface CartItem {
  id: string;
  product_id: string;
  schedule_id: string | null;
  products: {
    name: string;
    price: number;
    image_url: string;
    type: string;
  };
  mentoring_schedules?: {
    start_time: string;
  };
}

const PAYMENT_METHODS = [
  { id: "QRIS", name: "QRIS", icon: QrCode },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<string>("QRIS");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: cartData } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cartData) {
      const { data: items } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          schedule_id,
          products (name, price, image_url, type),
          mentoring_schedules (start_time)
        `)
        .eq("cart_id", cartData.id);

      if (items) {
        setCartItems(items as any[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("cart_items").delete().eq("id", id);
    setCartItems(cartItems.filter(item => item.id !== id));
    setDeletingId(null);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    setVoucherError("");
    setAppliedVoucher(null);

    const code = voucherCode.toUpperCase().replace(/\s+/g, "");

    const { data: voucher, error } = await supabase
      .from("voucher_code")
      .select("*")
      .eq("kode_voucher", code)
      .maybeSingle();

    if (error || !voucher) {
      setVoucherError("Voucher tidak ditemukan.");
      setIsApplyingVoucher(false);
      return;
    }

    if (voucher.kuota <= 0) {
      setVoucherError("Kuota voucher sudah habis.");
      setIsApplyingVoucher(false);
      return;
    }

    // Check applicable type
    if (voucher.applicable_type !== "All") {
      const hasValidProduct = cartItems.some(item => 
        (voucher.applicable_type === "DECK" && item.products.type === "DECK") ||
        (voucher.applicable_type === "CASEBOOK" && item.products.type === "CASEBOOK") ||
        (voucher.applicable_type === "MENTORING" && item.products.type === "MENTORING")
      );

      if (!hasValidProduct) {
        setVoucherError(`Voucher ini hanya berlaku untuk produk ${voucher.applicable_type}.`);
        setIsApplyingVoucher(false);
        return;
      }
    }

    setAppliedVoucher(voucher);
    setIsApplyingVoucher(false);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          finalTotal,
          voucherId: appliedVoucher?.id,
          selectedPayment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create transaction");
      }

      // Clear cart items before redirecting
      for (const item of cartItems) {
        await supabase.from("cart_items").delete().eq("id", item.id);
      }

      // Redirect to Pakasir checkout URL
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Error during checkout: " + error.message);
      setIsCheckingOut(false);
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.products.price, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    
    // Calculate eligible subtotal if voucher is specific
    let eligibleSubtotal = subtotal;
    if (appliedVoucher.applicable_type !== "All") {
      eligibleSubtotal = cartItems.reduce((acc, item) => {
        if (item.products.type === appliedVoucher.applicable_type) {
          return acc + item.products.price;
        }
        return acc;
      }, 0);
    }

    if (appliedVoucher.tipe_potongan === "PERCENTAGE") {
      const calculatedDiscount = (eligibleSubtotal * appliedVoucher.nilai_potongan) / 100;
      if (appliedVoucher.max_discount && calculatedDiscount > appliedVoucher.max_discount) {
        return appliedVoucher.max_discount;
      }
      return Math.floor(calculatedDiscount);
    } else {
      // FLAT discount
      return Math.min(appliedVoucher.nilai_potongan, eligibleSubtotal);
    }
  }, [subtotal, cartItems, appliedVoucher]);

  const netTotal = Math.max(0, subtotal - discountAmount);

  const paymentFee = useMemo(() => {
    if (netTotal === 0) return 0;
    
    // Pakasir QRIS Fee: 0.7% + Rp 310
    return Math.floor(netTotal * 0.007) + 310;
  }, [netTotal]);

  const finalTotal = netTotal + paymentFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Link href="/product" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.length === 0 ? (
              <div className="bg-card p-12 text-center rounded-3xl border border-border flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Your cart is empty</h3>
                <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/product" className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors mt-4">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 p-6 bg-card rounded-3xl border border-border shadow-sm group">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                      {item.products.image_url ? (
                        <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full mb-2 inline-block">
                            {item.products.type}
                          </span>
                          <h3 className="text-lg font-bold line-clamp-1">{item.products.name}</h3>
                          {item.mentoring_schedules && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Session: {formatDate(item.mentoring_schedules.start_time)}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <div className="mt-auto">
                        <p className="text-xl font-bold">{formatPrice(item.products.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-3xl border border-border p-6 space-y-6 shadow-sm sticky top-24 px-2">
              <h3 className="text-xl font-bold">Order Summary</h3>

              {/* Voucher Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Promo Code</label>
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. DISCOUNT50"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent border border-border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    />
                    <button 
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher || !voucherCode.trim() || cartItems.length === 0}
                      className="bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {isApplyingVoucher ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-bold text-green-600 dark:text-green-400">{appliedVoucher.kode_voucher}</p>
                        <p className="text-xs text-green-600/80 dark:text-green-400/80">Voucher applied successfully</p>
                      </div>
                    </div>
                    <button onClick={removeVoucher} className="text-muted-foreground hover:text-foreground text-sm font-medium">
                      Remove
                    </button>
                  </div>
                )}
                {voucherError && <p className="text-sm text-destructive mt-1">{voucherError}</p>}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-4 border-t border-border">
                <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all gap-2 ${
                          selectedPayment === method.id 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${selectedPayment === method.id ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium">{method.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Fee</span>
                  <span>{formatPrice(paymentFee)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="font-black text-3xl text-primary">{formatPrice(finalTotal)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isCheckingOut}
                className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
