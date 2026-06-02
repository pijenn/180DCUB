"use client";

import { motion, Variants } from "framer-motion";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Target, Lightbulb, Users, Handshake } from "lucide-react";

const DUMMY_PHOTO = "https://res.cloudinary.com/ddlo3v9hx/image/upload/v1780137577/UNLK0174_1_uezzbd.jpg";
const DUMMY_NAME = "Rafie Ramadhan";

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

export default function AboutPage() {
  return (
    <SmoothScroll>
      <div className="flex flex-col w-full bg-background selection:bg-[var(--color-primary)] selection:text-black pb-32">
        
        {/* 1. Hero Section - Minimalist & Large Typography */}
        <section className="relative min-h-[80vh] flex items-center px-6 pt-32 pb-20 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
          
          <motion.div 
            className="w-full max-w-7xl mx-auto flex flex-col gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={textReveal} className="flex items-center gap-4 mb-6">
              <div className="w-16 h-[2px] bg-[var(--color-primary)]" />
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">
                Our Story
              </span>
            </motion.div>
            
            <motion.h1 variants={textReveal} className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-white uppercase">
              Get To
            </motion.h1>
            <motion.h1 variants={textReveal} className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-[var(--color-primary)] uppercase">
              Know Us.
            </motion.h1>
            
            <motion.p variants={textReveal} className="text-xl md:text-3xl text-white/50 font-light mt-12 max-w-4xl leading-snug">
              We are the world's largest university-based consultancy, providing high-quality, affordable consulting services to non-profits and social enterprises.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Our Vision & Mission - Borderless Minimal Grid */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 gap-20 border-t border-white/10 pt-16"
            >
              <motion.div variants={fadeInUp} className="group">
                <div className="text-[var(--color-primary)] mb-8 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">
                  <Target className="w-16 h-16 stroke-[1.5]" />
                </div>
                <h2 className="text-5xl font-bold mb-6">Our Vision.</h2>
                <p className="text-white/50 text-xl font-light leading-relaxed">
                  To ensure that non-profits and social enterprises are able to maximize their social impact by overcoming the challenges they face, while simultaneously developing the next generation of social impact leaders.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="group">
                <div className="text-[var(--color-primary)] mb-8 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">
                  <Lightbulb className="w-16 h-16 stroke-[1.5]" />
                </div>
                <h2 className="text-5xl font-bold mb-6">Our Mission.</h2>
                <p className="text-white/50 text-xl font-light leading-relaxed">
                  We empower organizations by providing them with innovative, practical, and sustainable solutions. We achieve this by connecting them with highly talented and driven university students.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 3 & 4. Our Clients & Partners - Clean Borderless */}
        <section className="py-32 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto space-y-32">
            
            {/* Clients */}
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-12">
                <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">Impact Scaled</span>
                <h2 className="text-5xl md:text-6xl font-bold mt-4">Our Clients.</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center justify-center opacity-30 hover:opacity-100 hover:text-[var(--color-primary)] transition-all duration-500 cursor-pointer">
                    <Handshake className="w-16 h-16 stroke-[1]" />
                    <span className="mt-4 text-sm tracking-widest uppercase">Client {i}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Partners */}
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-12">
                <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">Shared Vision</span>
                <h2 className="text-5xl md:text-6xl font-bold mt-4">Our Partners.</h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center justify-center opacity-30 hover:opacity-100 hover:text-[var(--color-primary)] transition-all duration-500 cursor-pointer">
                    <Users className="w-16 h-16 stroke-[1]" />
                    <span className="mt-4 text-sm tracking-widest uppercase">Partner {i}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </section>

        {/* 5. Our Alumni */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)] mb-4">Legacy</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-12">Alumni Placements.</h2>
            <p className="text-2xl text-white/50 font-light max-w-4xl leading-relaxed mb-16">
              Our alumni and analysts have gone on to build incredible careers at top-tier consulting firms, multinational corporations, and impactful non-profits globally.
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-3xl md:text-5xl font-black uppercase text-white/20 tracking-tighter">
              <span className="hover:text-white transition-colors duration-500 cursor-pointer">McKinsey & Co.</span>
              <span className="hover:text-white transition-colors duration-500 cursor-pointer">BCG</span>
              <span className="hover:text-white transition-colors duration-500 cursor-pointer">Bain & Co.</span>
              <span className="hover:text-white transition-colors duration-500 cursor-pointer">Unilever</span>
              <span className="hover:text-[var(--color-primary)] transition-colors duration-500 cursor-pointer">GOTO</span>
            </div>
          </div>
        </section>

        {/* 6. Meet our Team! */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 flex flex-col items-center text-center">
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)] mb-4">The People</span>
              <h2 className="text-6xl md:text-8xl font-black">Meet Our Team.</h2>
            </div>
            
            <div className="space-y-32">
              
              {/* Tier 1: Board of Executives */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Board of Executives</h3>
                
                {/* President (Center Top) */}
                <div className="flex justify-center mb-16">
                  <div className="w-full max-w-sm">
                    <TeamMemberCard name={DUMMY_NAME} role="President" imageUrl={DUMMY_PHOTO} />
                  </div>
                </div>
                
                {/* Vice Presidents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {["VP of Consulting", "VP of Business & Innovation", "VP of External Affairs", "VP of Resource Management"].map((role, i) => (
                    <TeamMemberCard key={i} name={DUMMY_NAME} role={role} imageUrl={DUMMY_PHOTO} />
                  ))}
                </div>
              </div>

              {/* Tier 2: Directors */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Directors</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                  {["Strategy & Growth", "Client Acquisition", "Marketing", "Human Resources", "Legal & Finance", "Consulting"].map((dept, i) => (
                    <TeamMemberCard key={i} name={DUMMY_NAME} role={`Director of ${dept}`} imageUrl={DUMMY_PHOTO} />
                  ))}
                </div>
              </div>

              {/* Tier 3: Co-Directors */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Co-Directors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-center">
                  {["Strategy & Growth", "Human Resources", "Marketing", "Consulting"].map((dept, i) => (
                    <TeamMemberCard key={i} name={DUMMY_NAME} role={`Co-Director of ${dept}`} imageUrl={DUMMY_PHOTO} />
                  ))}
                </div>
              </div>

              {/* Tier 4: Managers */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Managers</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                  {[
                    "Client Relation", 
                    "Knowledge", 
                    "Product", 
                    "Program", 
                    "Legal",
                    "Finance"
                  ].map((dept, i) => (
                    <TeamMemberCard key={i} name={DUMMY_NAME} role={`Manager of ${dept}`} imageUrl={DUMMY_PHOTO} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </SmoothScroll>
  );
}
