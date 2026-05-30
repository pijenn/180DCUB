"use client";

import { motion, Variants } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { Target, Lightbulb, Users, Handshake } from "lucide-react";

const DUMMY_PHOTO = "https://res.cloudinary.com/ddlo3v9hx/image/upload/v1780137577/UNLK0174_1_uezzbd.jpg";
const DUMMY_NAME = "Rafie Ramadhan Al Aziz Zein";

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden pb-32">
      
      {/* 1. Get to Know Us! */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 blur-[150px] -z-10 rounded-full" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={fadeInUp}>
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Get to <span className="text-[var(--color-primary)]">Know Us!</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              180 Degrees Consulting Universitas Brawijaya is a branch of the world's largest university-based consultancy. We provide high-quality, affordable consulting services to non-profits and social enterprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Our Vision & Mission */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <GlassCard className="h-full border-t-4 border-t-[var(--color-primary)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[var(--color-primary)]/20 rounded-xl">
                    <Target className="w-8 h-8 text-[var(--color-primary)]" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To ensure that non-profits and social enterprises are able to maximize their social impact by overcoming the challenges they face, while simultaneously developing the next generation of social impact leaders.
                </p>
              </GlassCard>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <GlassCard className="h-full border-t-4 border-t-blue-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Lightbulb className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We empower organizations by providing them with innovative, practical, and sustainable solutions. We achieve this by connecting them with highly talented and driven university students.
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3 & 4. Our Clients & Partners */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-20"
          >
            {/* Clients */}
            <motion.div variants={fadeInUp}>
              <SectionHeading title="Our Clients" subtitle="Organizations we've helped scale their impact." align="left" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <GlassCard key={i} className="flex items-center justify-center py-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <Handshake className="w-12 h-12 mb-2" />
                    <span className="sr-only">Client {i}</span>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            {/* Partners */}
            <motion.div variants={fadeInUp}>
              <SectionHeading title="Our Partners" subtitle="Collaborators who share our vision." align="left" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <GlassCard key={i} className="flex items-center justify-center py-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                    <Users className="w-12 h-12 mb-2" />
                    <span className="sr-only">Partner {i}</span>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Our Alumni & Analyst */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading title="Our Alumni & Analyst" />
          <GlassCard className="p-10">
            <p className="text-xl text-muted-foreground mb-8">
              Our alumni and analysts have gone on to build incredible careers at top-tier consulting firms, multinational corporations, and impactful non-profits globally.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/50 font-bold">
              <span>McKinsey & Co.</span> &bull; <span>BCG</span> &bull; <span>Bain & Co.</span> &bull; <span>Unilever</span> &bull; <span>GOTO</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 6. Meet our Team! */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Meet Our Team" subtitle="The dedicated individuals driving 180DC UB forward." />
          
          <div className="space-y-24 mt-16">
            
            {/* Tier 1: Board of Executives */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-12 text-[var(--color-primary)]">Board of Executives</h3>
              
              {/* President (Center Top) */}
              <div className="flex justify-center mb-12">
                <div className="w-full max-w-[280px]">
                  <TeamMemberCard name={DUMMY_NAME} role="President" imageUrl={DUMMY_PHOTO} />
                </div>
              </div>
              
              {/* Vice Presidents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {["Vice President of Consulting", "Vice President of Business & Innovation", "Vice President of External Affairs", "Vice President of Resource Management"].map((role, i) => (
                  <TeamMemberCard key={i} name={DUMMY_NAME} role={role} imageUrl={DUMMY_PHOTO} />
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Tier 2: Directors */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-12 text-[var(--color-primary)]">Directors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {["Strategy & Growth", "Client Acquisition", "Marketing", "Human Resources", "Legal & Finance", "Consulting"].map((dept, i) => (
                  <TeamMemberCard key={i} name={DUMMY_NAME} role={`Director of ${dept}`} imageUrl={DUMMY_PHOTO} />
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Tier 3: Co-Directors */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-12 text-[var(--color-primary)]">Co-Directors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center">
                {["Strategy & Growth", "Human Resources", "Marketing", "Consulting"].map((dept, i) => (
                  <TeamMemberCard key={i} name={DUMMY_NAME} role={`Co-Director of ${dept}`} imageUrl={DUMMY_PHOTO} />
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Tier 4: Managers */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-12 text-[var(--color-primary)]">Managers</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  "Manager of Client Relation", 
                  "Manager of Knowledge", 
                  "Manager of Product", 
                  "Manager of Program", 
                  "Manager of Legal",
                  "Manager of Finance"
                ].map((role, i) => (
                  <TeamMemberCard key={i} name={DUMMY_NAME} role={role} imageUrl={DUMMY_PHOTO} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
