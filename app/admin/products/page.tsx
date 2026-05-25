"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    type: "DECK",
    category: "",
    name: "",
    description: "",
    price: 0,
    image_url: "",
    file_url: "",
    owner: "",
  });

  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setFormData({
        id: product.id,
        type: product.type,
        category: product.category || "",
        name: product.name,
        description: product.description || "",
        price: product.price,
        image_url: product.image_url || "",
        file_url: product.file_url || "",
        owner: product.owner || "",
      });
    } else {
      setFormData({
        id: "",
        type: "DECK",
        category: "",
        name: "",
        description: "",
        price: 0,
        image_url: "",
        file_url: "",
        owner: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = { ...formData };
    if (!payload.id) {
      delete (payload as any).id; // Let DB generate UUID
    }

    const { error } = await supabase.from("products").upsert(payload);

    if (!error) {
      setIsModalOpen(false);
      fetchProducts();
    } else {
      alert("Failed to save product: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        fetchProducts();
      } else {
        alert("Failed to delete product: " + error.message);
      }
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your store's catalog.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
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
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {product.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          {product.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{product.category || "-"}</td>
                      <td className="px-6 py-4 font-medium">{formatIDR(product.price)}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{formData.id ? "Edit Product" : "Add New Product"}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  >
                    <option value="DECK">Winner's Deck</option>
                    <option value="CASEBOOK">Casebook</option>
                    <option value="MENTORING">Mentoring</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                    placeholder="e.g. Competition, Career"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (IDR)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent resize-none"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                    placeholder="https://..."
                  />
                </div>

                {formData.type !== "MENTORING" && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">File URL (Google Drive / DropBox link)</label>
                    <input
                      type="url"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                      placeholder="https://..."
                    />
                  </div>
                )}
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
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
