"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, Users, Globe2, Briefcase } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import Image from "next/image";

// Framer Motion Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* 1. Hero Section - 180DC UB Short Introduction */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[96px] -z-10 pointer-events-none" />
        
        <motion.div 
          className="text-center max-w-4xl space-y-8 glass-panel p-10 md:p-16 rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            180 Degrees Consulting Universitas Brawijaya
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Transforming Non-Profits through <span className="text-gradient font-black">Strategic</span> <span className="text-[var(--color-primary)]">Impact</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            We are the world's largest university-based consultancy for non-profits and social enterprises. We empower organizations to overcome challenges and maximize their social impact.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/about" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-black bg-[var(--color-primary)] rounded-full overflow-hidden transition-all hover:scale-105"
            >
              <span className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                Discover Our Impact
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. Previous Clients & Partners Marquee */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading title="Trusted by Global & Local Organizations" subtitle="We've partnered with amazing organizations to drive meaningful change." />
          
          {/* Simple Marquee Implementation */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <motion.ul 
              className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            >
              {/* Duplicate list for seamless loop */}
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex gap-16 items-center">
                  <div className="text-2xl font-bold text-white/30">Deloitte</div>
                  <div className="text-2xl font-bold text-white/30">BCA</div>
                  <div className="text-2xl font-bold text-white/30">Unilever</div>
                  <div className="text-2xl font-bold text-white/30">Bank BRI</div>
                  <div className="text-2xl font-bold text-white/30">GOTO</div>
                  <div className="text-2xl font-bold text-white/30">PwC</div>
                </div>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* 3. Our Impact */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Our Impact by the Numbers" subtitle="Measurable results that highlight our commitment to social enterprise growth." />
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Briefcase, stat: "50+", label: "Projects Completed" },
              { icon: Users, stat: "120+", label: "Student Consultants" },
              { icon: Globe2, stat: "30+", label: "Non-Profit Partners" },
              { icon: BarChart3, stat: "10k+", label: "Hours Volunteered" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <GlassCard className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] mb-2">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black text-white">{item.stat}</h3>
                  <p className="text-muted-foreground font-medium">{item.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Our Knowledge Research */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-white/[0.01] -z-10" />
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Our Knowledge & Research" subtitle="Stay updated with our latest insights and industry analysis." />
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { title: "Is AI Taking Your Job, Or Creating New Opportunities?", img: "https://res.cloudinary.com/ddlo3v9hx/image/upload/v1780137577/UNLK0174_1_uezzbd.jpg", link: "#" },
              { title: "Indonesian Banks Have The Highest Margins In The World", img: "https://res.cloudinary.com/ddlo3v9hx/image/upload/v1780137577/UNLK0174_1_uezzbd.jpg", link: "#" },
              { title: "Why Do Leading Companies Rely on Tax Advisors?", img: "https://res.cloudinary.com/ddlo3v9hx/image/upload/v1780137577/UNLK0174_1_uezzbd.jpg", link: "#" }
            ].map((post, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Link href={post.link} target="_blank" rel="noopener noreferrer" className="block group h-full">
                  <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
                    <div className="relative w-full h-64 overflow-hidden">
                      <Image src={post.img} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex items-center">
                      <h4 className="text-xl font-bold text-foreground group-hover:text-[var(--color-primary)] transition-colors line-clamp-3">
                        {post.title}
                      </h4>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Learn with us! */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Learn with Us!" subtitle="Discover our short showcase products designed to boost your consulting skills." />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Casebook', 'Mentoring', 'Deck Templates'].map((product, i) => (
              <GlassCard key={i} className="text-center space-y-6 group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                  <span className="text-3xl font-black text-white/50 group-hover:text-[var(--color-primary)]">0{i+1}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{product}</h3>
                  <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.</p>
                </div>
                <div className="pt-4">
                  <span className="text-[var(--color-primary)] font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-32 px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <GlassCard className="p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-white/5 to-[var(--color-primary)]/10 border-[var(--color-primary)]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-primary)]/10 blur-[100px] rounded-full" />
            
            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">
              Have a problem with your Business or Organization?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto relative z-10">
              Our student consultants are ready to provide strategic, impact-driven solutions tailored to your unique challenges.
            </p>
            <Link 
              href="/contact" 
              className="relative z-10 inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-black bg-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary)]/90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(140,198,63,0.3)] hover:shadow-[0_0_50px_rgba(140,198,63,0.5)]"
            >
              Consult with Us Today
            </Link>
          </GlassCard>
        </div>
      </section>

    </div>
  );
}
