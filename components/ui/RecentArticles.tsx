"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ImageReveal } from "@/components/ui/ImageReveal";

export function RecentArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2);

      if (!error && data) {
        setArticles(data);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 h-[400px] bg-white/5 animate-pulse rounded-2xl" />
        <div className="col-span-1 h-[400px] bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 border border-white/10 rounded-2xl">
        <p className="text-white/50 text-xl">No articles available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => {
        // Make the first article span 2 columns if there are multiple articles
        const isFeatured = index === 0 && articles.length > 1;
        
        return (
          <Link 
            key={article.id} 
            href={article.link_instagram} 
            target="_blank"
            className={`block ${isFeatured ? "col-span-1 lg:col-span-2" : "col-span-1"}`}
          >
            <ImageReveal 
              src={article.foto || "/assets/180dc1.jpeg"} 
              alt={article.judul} 
              className="h-full w-full"
            >
              <div className="bg-black/40 backdrop-blur-md p-8 border-l-4 border-[var(--color-primary)]">
                <span className="text-[var(--color-primary)] font-bold tracking-widest text-sm mb-4 block">
                  {article.jenis_artikel}
                </span>
                <h3 className={`font-bold leading-tight ${isFeatured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
                  {article.judul}
                </h3>
              </div>
            </ImageReveal>
          </Link>
        );
      })}
    </div>
  );
}
