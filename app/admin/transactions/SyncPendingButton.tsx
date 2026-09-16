"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function SyncPendingButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSyncAll = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/admin/transactions/sync", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync pending transactions");
      }

      toast.success(data.message || `Checked ${data.checked} orders.`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to sync transactions");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSyncAll}
      disabled={isSyncing}
      className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-10 px-4 py-2 disabled:opacity-50"
      title="Check all recent pending transactions with Pakasir"
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4 mr-2" />
      )}
      Sync Pending with Pakasir
    </button>
  );
}
