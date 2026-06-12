"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { ExternalLink, ArrowLeft, Loader2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function ResearchPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setArticles(data);
      }
      setLoading(false);
    };

    fetchArticles();
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background selection:bg-[var(--color-primary)] selection:text-black pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          
          <Link href="/" className="inline-flex items-center space-x-2 text-white/50 hover:text-[var(--color-primary)] transition-colors mb-12">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="mb-20">
            <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">Insights & Publications</span>
            <h1 className="text-5xl md:text-8xl font-black mt-4 tracking-tighter uppercase">
              Knowledge &<br/> Research.
            </h1>
            <p className="text-xl md:text-2xl text-white/50 font-light mt-8 max-w-2xl">
              Explore our latest case studies, analysis, and thought leadership from the 180DC UB student consultants.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-32 border border-white/10 rounded-3xl">
              <p className="text-2xl text-white/50">No research articles published yet.</p>
              <p className="text-white/30 mt-4">Check back later for updates.</p>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {articles.map((article) => (
                <motion.div key={article.id} variants={fadeInUp} className="group h-[450px]">
                  <Link 
                    href={article.link_instagram} 
                    target="_blank"
                    className="block h-full w-full"
                  >
                    <ImageReveal 
                      src={article.foto || "/assets/180dc1.jpeg"} 
                      alt={article.judul} 
                      className="h-full w-full rounded-2xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 border-b-4 border-transparent group-hover:border-[var(--color-primary)] transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[var(--color-primary)] font-bold tracking-widest text-xs uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                            {article.jenis_artikel}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold leading-tight text-white group-hover:translate-y-[-8px] transition-transform duration-500">
                          {article.judul}
                        </h3>
                      </div>
                    </ImageReveal>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </div>
    </SmoothScroll>
  );
}
