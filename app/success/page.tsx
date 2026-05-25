import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-[3rem] border border-border shadow-2xl relative z-10 text-center">
        <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">Payment Successful!</h2>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. We've received your payment and your order is being processed.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <Link
            href="/product"
            className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            <Package className="w-5 h-5" />
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-full bg-secondary text-secondary-foreground font-bold text-lg hover:bg-secondary/80 transition-all"
          >
            Back to Home
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
