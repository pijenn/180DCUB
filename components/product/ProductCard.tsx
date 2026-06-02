"use client";

import Link from "next/link";
import { Product } from "@/lib/mockData";
import { ArrowRight, FileText, MonitorPlay, Users } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getIcon = () => {
    switch (product.type) {
      case "DECK":
        return <MonitorPlay className="w-5 h-5" />;
      case "CASEBOOK":
        return <FileText className="w-5 h-5" />;
      case "MENTORING":
        return <Users className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (product.type) {
      case "DECK":
        return "Winner's Deck";
      case "CASEBOOK":
        return "Casebook";
      case "MENTORING":
        return "Mentoring";
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden border border-white/10 mb-8">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-white/5 text-white/20 group-hover:text-[var(--color-primary)] transition-colors duration-500">
            {getIcon()}
          </div>
        )}
        
        {/* Overlay Hover State */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />

        {/* Category Badge */}
        <div className="absolute top-6 left-6 flex gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase rounded-none bg-black/80 backdrop-blur-md text-white border border-white/10">
            {getIcon()}
            {getTypeLabel()}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow pr-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm tracking-[0.2em] uppercase font-bold text-[var(--color-primary)]">
            {product.category}
          </span>
          <span className="text-xl font-light text-white">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <h3 className="text-3xl font-bold tracking-tighter mb-4 group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-lg text-white/50 font-light line-clamp-2 mb-8">
          {product.description}
        </p>
        
        {/* Animated Arrow Footer */}
        <div className="mt-auto flex items-center gap-4 text-white group-hover:text-[var(--color-primary)] transition-colors duration-300">
          <span className="text-sm tracking-widest uppercase font-bold">Explore Product</span>
          <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-500 ease-out" />
        </div>
      </div>
    </Link>
  );
}
