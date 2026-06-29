"use client";

import { useEffect, useState, use } from "react";
import { Product, MentoringSchedule, mockProducts, mockSchedules } from "@/lib/mockData";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Clock, Calendar, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [schedules, setSchedules] = useState<MentoringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        // Try Supabase first
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          throw new Error("Not found in Supabase");
        }
        setProduct(data as Product);

        if (data.type === "MENTORING") {
          const { data: scheduleData } = await supabase
            .from("mentoring_schedules")
            .select("*")
            .eq("product_id", id);
          if (scheduleData) setSchedules(scheduleData as MentoringSchedule[]);
        }
      } catch (err) {
        // Fallback to mock data
        const mockP = mockProducts.find((p) => p.id === id);
        if (mockP) {
          setProduct(mockP);
          if (mockP.type === "MENTORING") {
            setSchedules(mockSchedules.filter((s) => s.product_id === id));
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please login to add items to cart");
        router.push("/login");
        return;
      }

      // 2. Find or create cart for user
      let cartId = null;
      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cartError || !cartData) {
        // Create new cart
        const { data: newCart, error: newCartError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();
          
        if (newCartError) throw newCartError;
        cartId = newCart.id;
      } else {
        cartId = cartData.id;
      }

      // 3. Add item to cart
      const cartItemPayload: any = {
        cart_id: cartId,
        product_id: product.id,
      };

      if (product.type === "MENTORING" && selectedSchedule) {
        cartItemPayload.schedule_id = selectedSchedule;
      }

      const { error: insertError } = await supabase
        .from("cart_items")
        .insert(cartItemPayload);

      if (insertError) throw insertError;

      alert("Added to cart successfully!");
      router.push("/cart");

    } catch (error: any) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart: " + error.message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // COMING SOON OVERRIDE
  const isComingSoon = true;
  if (isComingSoon) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-background selection:bg-[var(--color-primary)] selection:text-black items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="flex flex-col items-center z-10 p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-white uppercase text-center mb-8">
            Coming <span className="text-transparent bg-clip-text bg-[var(--color-primary)]">Soon.</span>
          </h1>
          <p className="text-xl md:text-3xl text-white/50 font-light max-w-3xl text-center leading-snug">
            Our payment system is currently undergoing maintenance. We'll be back shortly!
          </p>
          <button 
            onClick={() => window.location.href = "/product"}
            className="mt-12 px-8 py-4 rounded-full text-sm tracking-widest uppercase font-bold transition-all duration-300 border border-white/20 text-white/50 hover:border-[var(--color-primary)] hover:text-white"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 animate-pulse">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="aspect-[21/9] bg-muted rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-10 w-2/3 bg-muted rounded"></div>
            <div className="h-6 w-1/3 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/product" className="text-primary hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link 
          href="/product" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-3xl overflow-hidden border border-border shadow-lg">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {product.type}
                </span>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {product.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="prose dark:prose-invert">
              <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Mentoring Schedules */}
            {product.type === "MENTORING" && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Available Sessions
                </h3>
                {schedules.length === 0 ? (
                  <p className="text-muted-foreground text-sm bg-muted/50 p-4 rounded-xl">
                    No sessions available at the moment.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {schedules.map((schedule) => {
                      const isAvailable = !schedule.is_booked && !schedule.locked_until;
                      return (
                        <button
                          key={schedule.id}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSchedule(schedule.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                            !isAvailable
                              ? "bg-muted/50 border-border/50 opacity-60 cursor-not-allowed"
                              : selectedSchedule === schedule.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Clock className={`w-5 h-5 ${selectedSchedule === schedule.id ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {formatDate(schedule.start_time)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                1 Hour Session
                              </span>
                            </div>
                          </div>
                          {selectedSchedule === schedule.id && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Checkout Action */}
            <div className="pt-8 mt-auto flex gap-4">
              <button
                disabled={isAddingToCart || (product.type === "MENTORING" && !selectedSchedule)}
                onClick={handleAddToCart}
                className="w-full py-4 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {product.type === "MENTORING" && !selectedSchedule
                      ? "Select a Session"
                      : "Add to Cart"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
