"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { Product, ProductType, mockProducts } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { useLenis } from 'lenis/react';
// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const textReveal: Variants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function ProductCatalog() {
  const [activeTab, setActiveTab] = useState<ProductType | "ALL">("ALL");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs: { label: string; value: ProductType | "ALL" }[] = [
    { label: "All", value: "ALL" },
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

  const lenis = useLenis();

  useEffect(() => {
    if (!loading && lenis) {
      // Force lenis to recalculate height after DOM updates
      setTimeout(() => {
        lenis.resize();
      }, 100);
    }
  }, [loading, activeTab, lenis]);

  // COMING SOON OVERRIDE
  const isComingSoon = true;
  if (isComingSoon) {
    return (
      <SmoothScroll>
        <div className="flex flex-col w-full min-h-screen bg-background selection:bg-[var(--color-primary)] selection:text-black items-center justify-center relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
          
          <motion.div 
            className="flex flex-col items-center z-10 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-white uppercase text-center mb-8">
              Coming <span className="text-transparent bg-clip-text bg-[var(--color-primary)]">Soon.</span>
            </h1>
            <p className="text-xl md:text-3xl text-white/50 font-light max-w-3xl text-center leading-snug">
              Our payment system is currently undergoing maintenance. We'll be back shortly!
            </p>
            <button 
              onClick={() => window.location.href = "/"}
              className="mt-12 px-8 py-4 rounded-full text-sm tracking-widest uppercase font-bold transition-all duration-300 border border-white/20 text-white/50 hover:border-[var(--color-primary)] hover:text-white"
            >
              Back to Home
            </button>
          </motion.div>
        </div>
      </SmoothScroll>
    );
  }

  return (
    <SmoothScroll>
      <div className="flex flex-col w-full min-h-screen bg-background selection:bg-[var(--color-primary)] selection:text-black pb-32">
        
        {/* 1. Header Section - Minimalist & Large Typography */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
          
          <motion.div 
            className="w-full max-w-7xl mx-auto flex flex-col gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={textReveal} className="flex items-center gap-4 mb-6">
              <div className="w-16 h-[2px] bg-[var(--color-primary)]" />
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">
                Resources
              </span>
            </motion.div>
            
            <motion.h1 variants={textReveal} className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-white uppercase">
              Our
            </motion.h1>
            <motion.h1 variants={textReveal} className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-[var(--color-primary)] uppercase">
              Products.
            </motion.h1>
            
            <motion.p variants={textReveal} className="text-xl md:text-3xl text-white/50 font-light mt-12 max-w-3xl leading-snug">
              Elevate your skills with our premium selection of decks, casebooks, and expert mentoring sessions.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Content Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Filters - Minimalist Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex justify-start overflow-x-auto pb-4 scrollbar-hide"
            >
              <div className="flex gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "px-8 py-4 rounded-full text-sm tracking-widest uppercase font-bold transition-all duration-300 whitespace-nowrap border",
                      activeTab === tab.value
                        ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-black"
                        : "bg-transparent border-white/20 text-white/50 hover:border-[var(--color-primary)] hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-none" />
                ))}
              </div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                key={activeTab} // re-trigger animation on tab change
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
              >
                {filteredProducts.map((product) => (
                  <motion.div key={product.id} variants={fadeInUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <p className="text-3xl text-white/30 font-light tracking-tight">No products found in this category.</p>
              </motion.div>
            )}

          </div>
        </section>

      </div>
    </SmoothScroll>
  );
}
