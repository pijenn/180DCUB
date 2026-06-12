"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BarChart3, Users, Globe2, Briefcase } from "lucide-react";
import { motion, Variants, animate, useInView } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { ImageReveal } from "@/components/ui/ImageReveal";
import { TypewriterEffect } from "@/components/ui/Typewriter";
import { RecentArticles } from "@/components/ui/RecentArticles";

function AnimatedCounter({ from = 0, to, suffix = "" }: { from?: number; to: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(from, to, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value).toString() + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, from, to, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

// Framer Motion Variants
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

export default function Home() {
  return (
    <SmoothScroll>
      <div className="flex flex-col w-full bg-background selection:bg-[var(--color-primary)] selection:text-black">

        {/* 1. Hero Section - Minimalist & Large Typography */}
        <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
          {/* Subtle blurred background element */}
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <div className="absolute top-[-10%] md:top-[-45%] right-[-30%] md:right-[-25%] w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] z-0 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                animate={{ opacity: 0.25, scale: 1, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full relative"
              >
                <Image
                  src="/assets/logo/Green.png"
                  alt="Background Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
          </div>

          <motion.div
            className="w-full max-w-7xl mx-auto flex flex-col gap-4 relative z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={textReveal} className="flex items-center gap-4 mb-6">
              <div className="w-16 h-[2px] bg-[var(--color-primary)]" />
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">
                180 Degrees Consulting UB
              </span>
            </motion.div>

            <motion.h1 variants={textReveal} className="text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter leading-[0.85] text-white uppercase min-h-[1.1em] flex items-center">
              <TypewriterEffect text="Impact" delay={0.8} cursor={false} />
            </motion.h1>
            <motion.h1 variants={textReveal} className="text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter leading-[0.85] text-[var(--color-primary)] uppercase min-h-[1.1em] flex items-center">
              <TypewriterEffect text="Thrivers." delay={1.5} cursor={true} />
            </motion.h1>

            <motion.p variants={textReveal} className="text-2xl md:text-4xl text-white/50 font-light mt-12 max-w-4xl leading-snug">
              Transforming non-profits and social enterprises through world-class student consulting.
            </motion.p>

            <motion.div variants={textReveal} className="mt-20 flex items-center gap-8">
              <Link
                href="/about"
                className="group flex items-center gap-6 text-2xl font-medium"
              >
                <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:border-[var(--color-primary)] group-hover:text-black transition-all duration-500 ease-out">
                  <ArrowRight className="w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                <span className="group-hover:text-[var(--color-primary)] transition-colors duration-300">Discover Our Story</span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. Previous Clients & Partners Marquee - Clean & Borderless */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-white/[0.02] to-background -z-10" />
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_200px,_black_calc(100%-200px),transparent_100%)]">
            <motion.ul
              className="flex items-center justify-center md:justify-start [&_li]:mx-12"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            >
              {/* Duplicate list for seamless loop */}
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex gap-8 md:gap-12 items-center mx-4 md:mx-6">
                  {[
                    "bca.png", "bpcons.png", "ey.png", "gnv.png",
                    "grab.png", "idx.png", "markplus.png", "pwc.png", "unilever.png"
                  ].map((logo, i) => (
                    <div
                      key={i}
                      className="relative group flex items-center justify-center h-16 w-32 md:h-20 md:w-40 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white hover:border-transparent rounded-2xl hover:scale-105 transition-all duration-500"
                    >
                      {/* Before Hover: White/Light Logo on Dark Glass */}
                      <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-center opacity-70 group-hover:opacity-0 transition-opacity duration-500">
                        <img
                          src={`/assets/logo/${logo}`}
                          alt={logo.split('.')[0].toUpperCase()}
                          className="max-h-full max-w-full object-contain mix-blend-screen grayscale invert brightness-150"
                        />
                      </div>

                      {/* On Hover: Original Colored Logo */}
                      <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <img
                          src={`/assets/logo/${logo}`}
                          alt={logo.split('.')[0].toUpperCase()}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.ul>
          </div>
        </section>

        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">By The Numbers</span>
              <h2 className="text-5xl md:text-7xl font-bold mt-4">Measurable Results.</h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-10 border-t border-white/10 pt-16"
            >
              {[
                { icon: Briefcase, to: 20, suffix: "+", label: "Client Projects Completed" },
                { icon: Users, to: 750, suffix: "+", label: "Peoples Impacted" },
                { icon: Globe2, to: 30, suffix: "+", label: "Partnerships" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex flex-col group">
                  <div className="text-[var(--color-primary)] mb-8 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
                    <item.icon className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  <h3 className="text-6xl lg:text-8xl font-black text-white mb-4 tracking-tighter">
                    <AnimatedCounter to={item.to} suffix={item.suffix} />
                  </h3>
                  <p className="text-xl text-white/50 font-light">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. Knowledge & Research (Using ImageReveal with New Assets) */}
        <section className="py-32 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">Insights</span>
                <h2 className="text-5xl md:text-7xl font-bold mt-4">Knowledge & Research.</h2>
              </div>
              <Link href="/research" className="text-lg uppercase tracking-widest border-b border-[var(--color-primary)] pb-1 hover:text-[var(--color-primary)] transition-colors">
                View All
              </Link>
            </div>

            <RecentArticles />
          </div>
        </section>

        {/* 5. Learn with us! (Using ImageReveal with 180dc3) */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">Product</span>
              <h2 className="text-5xl md:text-7xl font-bold mt-4">Learn with Us.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <ImageReveal src="/assets/180dc4.jpg" alt="Product" className="h-[600px] hidden md:block" />

              <div className="flex flex-col gap-12">
                {['Casebook', 'Mentoring', 'Deck Templates'].map((product, i) => (
                  <div key={i} className="group cursor-pointer border-b border-white/10 pb-8 hover:border-[var(--color-primary)] transition-colors duration-500">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-white/30 group-hover:text-[var(--color-primary)] transition-colors">0{i + 1}</span>
                      <ArrowUpRight className="w-8 h-8 opacity-0 -translate-y-4 translate-x-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-500 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-4xl md:text-6xl font-bold mb-4 group-hover:translate-x-4 transition-transform duration-500">{product}</h3>
                    <p className="text-xl text-white/50 font-light group-hover:translate-x-4 transition-transform duration-500 delay-75">
                      Master consulting frameworks and elevate your strategic thinking.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Massive CTA Section */}
        <section className="relative py-40 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-primary)] z-0" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0" />

          <div className="max-w-7xl mx-auto relative z-10 text-black flex flex-col items-center text-center">
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-12">
              Ready to <br /> transform?
            </h2>
            <Link
              href="https://wa.me/6289506570134"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-6 bg-black text-white px-12 py-6 rounded-full text-2xl font-bold hover:scale-105 transition-all duration-500 ease-out"
            >
              Let's Talk
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] group-hover:animate-ping" />
            </Link>
          </div>
        </section>

      </div>
    </SmoothScroll>
  );
}
