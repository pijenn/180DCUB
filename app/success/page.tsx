"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ProductInfo {
  name?: string;
  type?: string;
  image_url?: string;
  file_url?: string;
  owner?: string;
}

interface ScheduleInfo {
  start_time?: string;
  end_time?: string;
}

interface PurchasedItem {
  price_at_buy: number;
  products?: ProductInfo | ProductInfo[];
  mentoring_schedules?: ScheduleInfo | ScheduleInfo[];
}

interface TransactionDetails {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_id?: string;
  user?: {
    email?: string;
    full_name?: string;
    phone_number?: string;
  };
  items?: PurchasedItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState<"loading" | "SUCCESS" | "PENDING" | "FAILED" | "idle">(
    orderId ? "loading" : "idle"
  );
  const [transactionData, setTransactionData] = useState<TransactionDetails | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [isManualChecking, setIsManualChecking] = useState(false);

  const verifyOrder = useCallback(
    async (isManual = false) => {
      if (!orderId) return;

      if (isManual) {
        setIsManualChecking(true);
      }

      try {
        const res = await fetch(`/api/transactions/verify?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.status === "SUCCESS") {
          setStatus("SUCCESS");
          setTransactionData(data.transaction);
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
        } else if (data.status === "FAILED") {
          setStatus("FAILED");
          setTransactionData(data.transaction);
        } else {
          setStatus("PENDING");
          setTransactionData(data.transaction);
        }
      } catch (err) {
        console.error("Verification failed:", err);
        setStatus("PENDING");
      } finally {
        if (isManual) {
          setIsManualChecking(false);
        }
      }
    },
    [orderId]
  );

  // Initial verification on mount when order_id is present
  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/transactions/verify?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.status === "SUCCESS") {
          setStatus("SUCCESS");
          setTransactionData(data.transaction);
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
        } else if (data.status === "FAILED") {
          setStatus("FAILED");
          setTransactionData(data.transaction);
        } else {
          setStatus("PENDING");
          setTransactionData(data.transaction);
        }
      } catch (err) {
        console.error("Initial verification failed:", err);
        if (isMounted) setStatus("PENDING");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Auto-polling for pending transactions up to 5 times (every 3 seconds)
  useEffect(() => {
    if (status === "PENDING" && pollCount < 5) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        verifyOrder();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, pollCount, verifyOrder]);

  // Format currency helper
  const formatIDR = (val: number) => `Rp ${Number(val).toLocaleString("id-ID")}`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-xl w-full bg-card p-8 sm:p-10 rounded-[2.5rem] border border-border shadow-2xl relative z-10 text-center">
        {/* State 1: Verifying */}
        {status === "loading" && (
          <div className="py-12 space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Verifying Payment...</h2>
              <p className="text-muted-foreground text-sm">
                Communicating with Pakasir payment gateway to confirm your order.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Payment Confirmed (SUCCESS) */}
        {(status === "SUCCESS" || status === "idle") && (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                Payment Confirmed
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Thank you for your order!</h2>
              <p className="text-muted-foreground">
                Your payment has been successfully verified. A confirmation email with your purchase details and access links has been sent.
              </p>
            </div>

            {/* Order Details Card if loaded */}
            {transactionData && (
              <div className="bg-muted/40 rounded-2xl p-5 text-left border border-border/60 space-y-3">
                <div className="flex justify-between items-center text-xs text-muted-foreground pb-2 border-b border-border/60">
                  <span>
                    Order ID:{" "}
                    <strong className="text-foreground font-mono">
                      {transactionData.order_id || orderId}
                    </strong>
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {formatIDR(transactionData.total_amount)}
                  </span>
                </div>

                {transactionData.items && transactionData.items.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Purchased Items
                    </p>
                    <ul className="space-y-2 text-sm">
                      {transactionData.items.map((item, idx) => {
                        const product = Array.isArray(item.products)
                          ? item.products[0]
                          : item.products;
                        const schedule = Array.isArray(item.mentoring_schedules)
                          ? item.mentoring_schedules[0]
                          : item.mentoring_schedules;
                        return (
                          <li key={idx} className="flex justify-between items-start gap-3">
                            <div>
                              <p className="font-medium text-foreground">
                                {product?.name || "Product"}
                              </p>
                              {schedule?.start_time && (
                                <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  Session:{" "}
                                  {new Date(schedule.start_time).toLocaleString("id-ID", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                              {formatIDR(item.price_at_buy)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    Sent to:{" "}
                    <strong className="text-foreground">
                      {transactionData.user?.email || "your registered email"}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Link
                href="/product"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <Package className="w-4 h-4" />
                Continue Exploring
              </Link>

              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-secondary text-secondary-foreground font-semibold text-base hover:bg-secondary/80 transition-all"
              >
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Payment Still Pending */}
        {status === "PENDING" && (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center">
              <RefreshCw
                className={`w-10 h-10 text-amber-500 ${pollCount < 5 ? "animate-spin" : ""}`}
              />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                Awaiting Confirmation
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Waiting for Payment Confirmation</h2>
              <p className="text-muted-foreground text-sm">
                If you just paid on Pakasir, the payment gateway is processing the settlement. This usually takes just a few seconds.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => verifyOrder(true)}
                disabled={isManualChecking}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isManualChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Check Payment Status Now
              </button>

              <Link
                href="/cart"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80 transition-all"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Payment Failed / Canceled */}
        {status === "FAILED" && (
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full border border-destructive/20">
                Payment Not Completed
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Payment Was Not Completed</h2>
              <p className="text-muted-foreground text-sm">
                The payment session on Pakasir expired or was canceled. No funds were debited.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                href="/cart"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all"
              >
                Try Checking Out Again
              </Link>

              <Link
                href="/product"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-all"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
