"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Loader2, Copy } from "lucide-react";

export default function VouchersAdmin() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    kode_voucher: "",
    tipe_potongan: "PERCENTAGE",
    nilai_potongan: 0,
    applicable_type: "All",
    kuota: 100,
  });

  const supabase = createClient();

  const fetchVouchers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("voucher_code")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVouchers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenModal = (voucher: any = null) => {
    if (voucher) {
      setFormData({
        id: voucher.id,
        kode_voucher: voucher.kode_voucher,
        tipe_potongan: voucher.tipe_potongan,
        nilai_potongan: voucher.nilai_potongan,
        applicable_type: voucher.applicable_type,
        kuota: voucher.kuota,
      });
    } else {
      setFormData({
        id: "",
        kode_voucher: "",
        tipe_potongan: "PERCENTAGE",
        nilai_potongan: 0,
        applicable_type: "All",
        kuota: 100,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = { ...formData };
    payload.kode_voucher = payload.kode_voucher.toUpperCase().replace(/\s+/g, ""); // sanitize code
    
    if (!payload.id) {
      delete (payload as any).id; // Let DB generate UUID
    }

    const { error } = await supabase.from("voucher_code").upsert(payload);

    if (!error) {
      setIsModalOpen(false);
      fetchVouchers();
    } else {
      alert("Failed to save voucher: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this voucher?")) {
      const { error } = await supabase.from("voucher_code").delete().eq("id", id);
      if (!error) {
        fetchVouchers();
      } else {
        alert("Failed to delete voucher: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">Manage promo codes and discounts.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Voucher</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Applies To</th>
                  <th className="px-6 py-4 font-medium">Uses</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No vouchers found.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground flex items-center space-x-2">
                        <span>{voucher.kode_voucher}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(voucher.kode_voucher)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy Code"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {voucher.tipe_potongan}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {voucher.tipe_potongan === "PERCENTAGE" 
                          ? `${voucher.nilai_potongan}%` 
                          : `Rp ${voucher.nilai_potongan.toLocaleString('id-ID')}`}
                      </td>
                      <td className="px-6 py-4">{voucher.applicable_type}</td>
                      <td className="px-6 py-4">
                       {voucher.kuota}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenModal(voucher)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{formData.id ? "Edit Voucher" : "Add New Voucher"}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Voucher Code</label>
                <input
                  required
                  type="text"
                  value={formData.kode_voucher}
                  onChange={(e) => setFormData({ ...formData, kode_voucher: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-transparent uppercase"
                  placeholder="e.g. DISKON50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type</label>
                  <select
                    value={formData.tipe_potongan}
                    onChange={(e) => setFormData({ ...formData, tipe_potongan: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (Rp)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max={formData.tipe_potongan === "PERCENTAGE" ? 100 : undefined}
                    value={formData.nilai_potongan}
                    onChange={(e) => setFormData({ ...formData, nilai_potongan: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Applies To</label>
                  <select
                    value={formData.applicable_type}
                    onChange={(e) => setFormData({ ...formData, applicable_type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  >
                    <option value="All">All Products</option>
                    <option value="DECK">Winner's Deck Only</option>
                    <option value="CASEBOOK">Casebook Only</option>
                    <option value="MENTORING">Mentoring Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Uses</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.kuota}
                    onChange={(e) => setFormData({ ...formData, kuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
