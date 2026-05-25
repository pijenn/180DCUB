"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/mockData";
import { ArrowRight, FileText, MonitorPlay, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
        return <MonitorPlay className="w-4 h-4" />;
      case "CASEBOOK":
        return <FileText className="w-4 h-4" />;
      case "MENTORING":
        return <Users className="w-4 h-4" />;
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
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            {getIcon()}
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-background/90 backdrop-blur-sm text-foreground shadow-sm">
            {getIcon()}
            {getTypeLabel()}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary backdrop-blur-sm shadow-sm border border-primary/20">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">Price</span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
