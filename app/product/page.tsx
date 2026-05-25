"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import { Product, ProductType, mockProducts } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ProductCatalog() {
  const [activeTab, setActiveTab] = useState<ProductType | "ALL">("ALL");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs: { label: string; value: ProductType | "ALL" }[] = [
    { label: "All Products", value: "ALL" },
    { label: "Winner's Deck", value: "DECK" },
    { label: "Casebook", value: "CASEBOOK" },
    { label: "Mentoring", value: "MENTORING" },
  ];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Try fetching from Supabase
        const { data, error } = await supabase.from('products').select('*');
        
        if (error) {
          console.error('Supabase error:', error.message);
          // Fallback to mock data
          setProducts(mockProducts);
        } else if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // If table is empty, use mock data for UI demo purposes
          setProducts(mockProducts);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) => activeTab === "ALL" || product.type === activeTab
  );

  return (
    <div className="min-h-screen bg-muted/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Discover Our Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elevate your skills with our premium selection of decks, casebooks, and expert mentoring sessions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex bg-background p-1.5 rounded-full border border-border shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl h-[400px] animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
