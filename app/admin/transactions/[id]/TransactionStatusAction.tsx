"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function TransactionStatusAction({
  transactionId,
  currentStatus,
}: {
  transactionId: string;
  currentStatus: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (currentStatus === "SUCCESS") {
    return (
      <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-lg text-sm font-medium">
        <CheckCircle className="w-4 h-4 mr-2" />
        Completed
      </div>
    );
  }

  const handleMarkAsSuccess = async () => {
    if (!confirm("Are you sure you want to mark this transaction as SUCCESS? This will send confirmation emails to the customer.")) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "SUCCESS" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update transaction status");
      }

      toast.success("Transaction marked as SUCCESS and emails sent.");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMarkAsSuccess} 
      disabled={isLoading}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4 mr-2" />
      )}
      Mark as Success
    </button>
  );
}
