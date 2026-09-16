"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Eye,
  LayoutList,
  Smartphone,
  Monitor,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ProductCard from "@/components/product/ProductCard";
import { Product, ProductType } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"manage" | "preview">("manage");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewCategory, setPreviewCategory] = useState<ProductType | "ALL">("ALL");

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

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
    display_order: 1,
    is_best_seller: false,
  });

  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // First try fetching ordered by display_order
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Sort so that best sellers appear first, followed by display_order
        const sorted = [...data].sort((a, b) => {
          const aBest = Boolean(a.is_best_seller);
          const bBest = Boolean(b.is_best_seller);
          if (aBest !== bBest) return aBest ? -1 : 1;

          const ordA = a.display_order ?? 9999;
          const ordB = b.display_order ?? 9999;
          if (ordA !== ordB) return ordA - ordB;

          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
        setProducts(sorted);
      } else {
        // Fallback if display_order does not exist in DB yet
        const fallback = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (fallback.data) {
          setProducts(fallback.data);
        }
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const bestSellerCount = products.filter((p) => p.is_best_seller).length;

  // Toggle Best Seller on a product (max 3)
  const handleToggleBestSeller = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const willBeActive = !target.is_best_seller;
    if (willBeActive && bestSellerCount >= 3) {
      toast.error("You can highlight up to 3 Best Seller products. Please unhighlight one first.");
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_best_seller: willBeActive } : p))
    );
    setHasUnsavedChanges(true);
    toast.success(
      willBeActive
        ? `⭐ Highlighted "${target.name}" as Best Seller!`
        : `Removed Best Seller from "${target.name}"`
    );
  };

  // Move product up or down
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const updated = [...products];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((p, idx) => ({ ...p, display_order: idx + 1 }));
    setProducts(reordered);
    setHasUnsavedChanges(true);
  };

  // One-click: Pin highlighted Best Sellers to the top 3 positions (#1, #2, #3)
  const handlePinBestSellersToTop = () => {
    const bestSellers = products.filter((p) => p.is_best_seller);
    const others = products.filter((p) => !p.is_best_seller);

    const combined = [...bestSellers, ...others].map((p, idx) => ({
      ...p,
      display_order: idx + 1,
    }));

    setProducts(combined);
    setHasUnsavedChanges(true);
    toast.success("Best Sellers positioned at the top (#1-#3)!");
  };

  // Save Placement & Best Seller status to Supabase
  const handleSaveArrangement = async () => {
    setIsSavingOrder(true);
    try {
      let hasError = false;
      let errorMsg = "";

      for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        const { error } = await supabase
          .from("products")
          .update({
            display_order: i + 1,
            is_best_seller: Boolean(prod.is_best_seller),
          })
          .eq("id", prod.id);

        if (error) {
          hasError = true;
          errorMsg = error.message;
          break;
        }
      }

      if (hasError) {
        if (errorMsg.includes("display_order") || errorMsg.includes("is_best_seller")) {
          toast.error(
            "Database columns missing. Please execute the SQL migration in Supabase SQL editor: 20260916010000_add_product_display_order_and_bestseller.sql"
          );
        } else {
          toast.error("Failed to save arrangement: " + errorMsg);
        }
      } else {
        setHasUnsavedChanges(false);
        toast.success("Product placement and Best Sellers saved successfully!");
        fetchProducts();
      }
    } catch (err: any) {
      toast.error("Unexpected error: " + err.message);
    } finally {
      setIsSavingOrder(false);
    }
  };

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
        display_order: product.display_order ?? products.findIndex((p) => p.id === product.id) + 1,
        is_best_seller: Boolean(product.is_best_seller),
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
        display_order: products.length + 1,
        is_best_seller: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.is_best_seller && !formData.id && bestSellerCount >= 3) {
      toast.error("You can highlight a maximum of 3 Best Sellers. Please unhighlight one first.");
      return;
    }

    setIsSaving(true);

    const payload: any = { ...formData };
    if (!payload.id) {
      delete payload.id; // Let DB generate UUID
    }

    const { error } = await supabase.from("products").upsert(payload);

    if (!error) {
      setIsModalOpen(false);
      fetchProducts();
      toast.success("Product saved successfully!");
    } else {
      toast.error("Failed to save product: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        fetchProducts();
        toast.success("Product deleted successfully!");
      } else {
        toast.error("Failed to delete product: " + error.message);
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

  const previewFilteredProducts = products.filter(
    (product) => previewCategory === "ALL" || product.type === previewCategory
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">Products & Placement</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Best Sellers: {bestSellerCount}/3
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Arrange catalog placement, highlight up to 3 Best Sellers for the user POV, and preview live.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border">
            <button
              onClick={() => setActiveView("manage")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeView === "manage"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="w-4 h-4" />
              <span>Manage & Placement</span>
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeView === "preview"
                  ? "bg-[var(--color-primary)] text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="w-4 h-4" />
              <span>User POV Preview</span>
            </button>
          </div>

          {activeView === "manage" && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MANAGE & PLACEMENT MODE                                           */}
      {/* ========================================================================= */}
      {activeView === "manage" && (
        <div className="space-y-4">
          {/* Quick Action & Notice Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/30 p-4 sm:p-5 rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Arrange Product Placement & Best Sellers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Highlighted Best Sellers ({bestSellerCount}/3) will always appear first in the User POV with the "Best Seller!" badge.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handlePinBestSellersToTop}
                className="px-3.5 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-xl border border-border flex items-center gap-1.5 transition-colors"
                title="Automatically push highlighted Best Sellers to positions #1, #2, #3"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Pin Best Sellers to Top 3</span>
              </button>

              <button
                type="button"
                disabled={!hasUnsavedChanges || isSavingOrder}
                onClick={handleSaveArrangement}
                className={cn(
                  "px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-sm",
                  hasUnsavedChanges
                    ? "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary)]/90 shadow-[0_0_20px_rgba(140,198,63,0.3)] animate-pulse"
                    : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60"
                )}
              >
                {isSavingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{hasUnsavedChanges ? "Save Changes" : "Arrangement Saved"}</span>
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-medium">Loading products...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-4 font-semibold text-center w-28">Placement</th>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Type & Category</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold text-center">User POV Highlight</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          No products found in store. Click "Add Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => {
                        const isBest = Boolean(product.is_best_seller);
                        return (
                          <tr
                            key={product.id}
                            className={cn(
                              "transition-colors",
                              isBest
                                ? "bg-[var(--color-primary)]/[0.04] hover:bg-[var(--color-primary)]/[0.08]"
                                : "hover:bg-muted/30"
                            )}
                          >
                            {/* Placement Order & Move Controls */}
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs",
                                  isBest
                                    ? "bg-[var(--color-primary)] text-black shadow-sm font-extrabold"
                                    : "bg-muted text-foreground"
                                )}>
                                  #{index + 1}
                                </span>
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => handleMove(index, "up")}
                                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent"
                                    title="Move Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === products.length - 1}
                                    onClick={() => handleMove(index, "down")}
                                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent"
                                    title="Move Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Product Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-12 h-14 object-cover rounded-lg border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                                    No Img
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground line-clamp-1">
                                      {product.name}
                                    </span>
                                  </div>
                                  {product.owner && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Owner: {product.owner}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Type & Category */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full inline-block">
                                  {product.type}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {product.category || "General"}
                                </p>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 font-mono font-semibold text-foreground">
                              {formatIDR(product.price)}
                            </td>

                            {/* Best Seller Highlighting Toggle */}
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleBestSeller(product.id)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border",
                                  isBest
                                    ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_15px_rgba(140,198,63,0.35)]"
                                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                                )}
                                title={isBest ? "Click to remove Best Seller" : "Click to mark as Best Seller (Max 3)"}
                              >
                                <Sparkles className={cn("w-3.5 h-3.5", isBest ? "fill-black" : "")} />
                                <span>{isBest ? "Best Seller!" : "Highlight"}</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenModal(product)}
                                className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4 inline" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIVE USER POV PREVIEW                                             */}
      {/* ========================================================================= */}
      {activeView === "preview" && (
        <div className="space-y-6">
          {/* Preview Navigation & Device Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">
                  User POV Live Preview
                </h2>
                <p className="text-xs text-white/50">
                  This simulates how customers and candidates see the /product catalog. Top 3 Best Sellers appear first with glowing badges.
                </p>
              </div>
            </div>

            {/* Viewport Width Controls */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  previewDevice === "desktop"
                    ? "bg-[var(--color-primary)] text-black"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  previewDevice === "mobile"
                    ? "bg-[var(--color-primary)] text-black"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          {/* Simulated User Interface */}
          <div
            className={cn(
              "mx-auto transition-all duration-300 rounded-3xl bg-background border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-12",
              previewDevice === "mobile" ? "max-w-[420px]" : "w-full"
            )}
          >
            {/* Catalog Hero Banner */}
            <div className="mb-10 text-left border-b border-white/10 pb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-[2px] bg-[var(--color-primary)]" />
                <span className="text-xs tracking-[0.25em] uppercase font-bold text-[var(--color-primary)]">
                  180DC UB Products
                </span>
              </div>
              <h1 className={cn(
                "font-black tracking-tighter uppercase text-white leading-none",
                previewDevice === "mobile" ? "text-4xl" : "text-6xl sm:text-7xl"
              )}>
                Our <span className="text-transparent bg-clip-text bg-[var(--color-primary)]">Products.</span>
              </h1>
              <p className="text-sm sm:text-base text-white/50 mt-4 max-w-xl font-light">
                Elevate your skills with our curated decks, casebooks, and expert mentorship sessions.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {[
                { label: "All", value: "ALL" as const },
                { label: "Winner's Deck", value: "DECK" as const },
                { label: "Casebook", value: "CASEBOOK" as const },
                { label: "Mentoring", value: "MENTORING" as const },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setPreviewCategory(tab.value)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-xs tracking-wider uppercase font-bold transition-all whitespace-nowrap border",
                    previewCategory === tab.value
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-black"
                      : "bg-transparent border-white/20 text-white/50 hover:border-white/40 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Live Catalog Product Grid */}
            {previewFilteredProducts.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <p className="text-base font-light">No products found under this filter.</p>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-8",
                  previewDevice === "mobile"
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {previewFilteredProducts.map((prod) => (
                  <div key={prod.id} className="relative">
                    <ProductCard product={prod as Product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT EDIT / CREATE MODAL                                               */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {formData.id ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update product details, placement order, and Best Seller status.
                </p>
              </div>
              {formData.is_best_seller && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Best Seller Active
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                    placeholder="e.g. Consulting 101 Deck"
                  />
                </div>

                {/* Best Seller Highlighting Checkbox */}
                <div className="col-span-2 p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="is_best_seller"
                      className="text-sm font-bold text-foreground flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                      Highlight as Best Seller!
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Will display the prominent glowing "Best Seller!" badge and appear first in the User POV (maximum 3 products).
                    </p>
                  </div>
                  <input
                    id="is_best_seller"
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => {
                      if (e.target.checked && !formData.is_best_seller && bestSellerCount >= 3) {
                        toast.error("Maximum 3 Best Seller products allowed. Please unhighlight one first.");
                        return;
                      }
                      setFormData({ ...formData, is_best_seller: e.target.checked });
                    }}
                    className="w-5 h-5 accent-[var(--color-primary)] rounded cursor-pointer"
                  />
                </div>

                {/* Placement Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placement Order (#)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent font-mono"
                  />
                </div>

                {/* Type */}
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

                {/* Category */}
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

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (IDR)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent font-mono"
                  />
                </div>

                {/* Owner */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent"
                    placeholder="e.g. Kukuh Ragil Prayogi"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent resize-none text-sm"
                    placeholder="Detailed overview of what the product covers..."
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>

                {/* File URL */}
                {formData.type !== "MENTORING" && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">
                      File URL (Google Drive / DropBox link)
                    </label>
                    <input
                      type="url"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-transparent text-sm"
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
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 text-sm shadow-sm"
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
