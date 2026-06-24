"use client";

import { motion, Variants } from "framer-motion";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Target, Lightbulb, Users, Handshake } from "lucide-react";
import Image from "next/image";

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
                  To position 180DC UB by 2026 as the top-choice consulting organization for Brawijaya students to grow and create meaningful impact, delivering innovative solutions for non-profits and social ventures across Indonesia.
                </p>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="group">
                <div className="text-[var(--color-primary)] mb-8 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">
                  <Lightbulb className="w-16 h-16 stroke-[1.5]" />
                </div>
                <h2 className="text-5xl font-bold mb-6">Our Mission.</h2>
                <p className="text-white/50 text-xl font-light leading-relaxed">
                  - Strengthen 180DC UB’s branding and position as Brawijaya’s top consulting organization
                  <br />
                  - Deliver innovative & data-driven consulting solutions that empower change and   create sustainable value
                  <br />
                  - Develop high quality sustain program built on precision, creativity, and continuous improvement 
                  <br />
                  - Create a healthy & fun work environment full of support and meet the needs of members
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="relative py-32 px-6 bg-white/[0.02] overflow-hidden">
          {/* Background Logo */}
      
          <div className="relative z-10 max-w-7xl mx-auto space-y-32">
            
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center">
                {[
                  { name: "Clips.id", src: "/assets/client/clipsid.jpeg" },
                  { name: "Gradient", src: "/assets/client/gradient.png" },
                  { name: "PT IoT", src: "/assets/client/iot.png" },
                  { name: "Moorlife", src: "/assets/client/moorlife.png" }
                ].map((client, i) => (
                  <motion.div key={i} variants={fadeInUp} className="relative w-full h-24 md:h-32 bg-white/12 border border-white/10 hover:bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-all duration-500 cursor-pointer group">
                    <div className="relative w-full h-full opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <Image src={client.src} alt={client.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain" />
                    </div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center">
                {[
                  { name: "BCA", src: "/assets/partner/bca.png" },
                  { name: "Grab", src: "/assets/partner/grab.png" },
                  { name: "Markplus", src: "/assets/partner/markplus.png" },
                  { name: "Pertamina", src: "/assets/partner/pertamina.png" }
                ].map((partner, i) => (
                  <motion.div key={i} variants={fadeInUp} className="relative w-full h-24 md:h-32 bg-white/12 border border-white/10 hover:bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-all duration-500 cursor-pointer group">
                    <div className="relative w-full h-full opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <Image src={partner.src} alt={partner.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain" />
                    </div>
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
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="w-full"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center">
                {[
                  { name: "Unilever", src: "/assets/alumni/unilever1.png" },
                  { name: "Deloitte", src: "/assets/alumni/deloitte.png" },
                  { name: "L'Oreal", src: "/assets/alumni/loreal.png" },
                  { name: "Coca-Cola", src: "/assets/alumni/cocacola.png" },
                  { name: "Grab", src: "/assets/alumni/Grab.png" },
                  { name: "OCBC", src: "/assets/alumni/ocbc.png" },
                  { name: "BTN", src: "/assets/alumni/BTN.png" },
                  { name: "ASTRA", src: "/assets/alumni/ASTRA.png" }
                ].map((alumni, i) => (
                  <motion.div key={i} variants={fadeInUp} className="relative w-full h-24 md:h-32 bg-white/20 border border-white/10 hover:bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex items-center justify-center hover:scale-105 transition-all duration-500 cursor-pointer group">
                    <div className="relative w-full h-full opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <Image src={alumni.src} alt={alumni.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
              
              {/* Executive Board */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Executive Board</h3>
                
                {/* President (Center Top) */}
                <div className="flex justify-center mb-16">
                  <div className="w-full max-w-sm">
                    <TeamMemberCard 
                      name="Hanz Evan Lie" 
                      role="President" 
                      imageUrl="/assets/foto/hans.webp" 
                      linkedinUrl="https://www.linkedin.com/in/hansevanlie/" 
                    />
                  </div>
                </div>
                
                {/* Vice Presidents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  <TeamMemberCard name="Feni Afifah" role="VP of Consulting" imageUrl="/assets/foto/feni.webp" linkedinUrl="https://www.linkedin.com/in/feniafifakurniawati" />
                  <TeamMemberCard name="Aaliyah Kusuma" role="VP of External Affairs" imageUrl="/assets/foto/aal.webp" linkedinUrl="https://www.linkedin.com/in/aaliyahkusuma/" />
                  <TeamMemberCard name="Luqman Fahrul" role="VP of Business & Innovation" imageUrl="/assets/foto/fahrul.webp" linkedinUrl="https://www.linkedin.com/in/faaahrull/" />
                  <TeamMemberCard name="Naailul Azmi" role="VP of Resource Management" imageUrl="/assets/foto/nazmi.webp" linkedinUrl="https://www.linkedin.com/in/naailul-azmi/en" />
                </div>
              </div>

              {/* Strategy and Growth */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Strategy and Growth</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
                  <TeamMemberCard name="Rafie Ramadhan Al Aziz Zein" role="Director" imageUrl={DUMMY_PHOTO} linkedinUrl="https://linkedin.com/in/rafie-zein/" />
                  <TeamMemberCard name="Miftanun Nisa" role="Co-Director" imageUrl="/assets/foto/nisa.webp" linkedinUrl="https://linkedin.com/in/miftanunisa" />
                  <TeamMemberCard name="Khal Putra Adam" role="Manager of Product" imageUrl="/assets/foto/khal.webp" linkedinUrl="https://www.linkedin.com/in/khal-putra-adam-63867b314/" />
                  <TeamMemberCard name="Diffa Felisha Putri Agustian" role="Manager of Program" imageUrl="/assets/foto/feli.webp" linkedinUrl="https://www.linkedin.com/in/diffa-felisha-putri-agustian-135185322/" />
                </div>
              </div>

              {/* Human Resources */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Human Resources</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center max-w-3xl mx-auto">
                  <TeamMemberCard name="Diva Salsa" role="Director" imageUrl="/assets/foto/diva.webp" linkedinUrl="https://www.linkedin.com/in/diva-salsa-305587265/" />
                  <TeamMemberCard name="Nada Shofia Handayani" role="Co-Director" imageUrl="/assets/foto/dashi.webp" linkedinUrl="https://www.linkedin.com/in/nadashofiahandayani/" />
                </div>
              </div>

              {/* Legal and Finance */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Legal and Finance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center">
                  <TeamMemberCard name="Makuta Wiku Aji" role="Director" imageUrl="/assets/foto/wiku.webp" linkedinUrl="https://www.linkedin.com/in/makutawiku/" />
                  <TeamMemberCard name="Natasya Farezla" role="Manager of Finance" imageUrl="/assets/foto/nasya.webp" linkedinUrl="https://www.linkedin.com/in/natasyafarezla/" />
                  <TeamMemberCard name="Az Zahra Leilany Widjanarka" role="Manager of Legal" imageUrl="/assets/foto/zahra.webp" linkedinUrl="https://linkedin.com/in/az-zahra-widjanarka/" />
                </div>
              </div>

              {/* Marketing */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Marketing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center max-w-3xl mx-auto">
                  <TeamMemberCard name="Virgie Manera" role="Director" imageUrl="/assets/foto/virgie.webp" linkedinUrl="https://tinyurl.com/linkedinvirgiemanera" />
                  <TeamMemberCard name="Nadine Candra Prabawati" role="Co-Director" imageUrl="/assets/foto/nadine.webp" linkedinUrl="https://linkedin.com/in/nadine-candra-prabawati" />
                </div>
              </div>

              {/* Client Acquisition */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Client Acquisition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center">
                  <TeamMemberCard name="Nikita Costy" role="Director" imageUrl="/assets/foto/niki.webp" linkedinUrl="https://linkedin.com/in/nikitacostyy" />
                  <TeamMemberCard name="Janice Rafaela Putri Agita" role="Manager of Client Relation" imageUrl="/assets/foto/janice.webp" linkedinUrl="https://www.linkedin.com/in/janice-rafaela-000861322?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" />
                  <TeamMemberCard name="Sitorus Marlon Patrick Valentino" role="Manager of Knowledge" imageUrl="/assets/foto/marlon1.webp" linkedinUrl="https://www.linkedin.com/in/marlon-sitorus?utm_source=share_via&utm_content=profile&utm_medium=member_ios" />
                </div>
              </div>

              {/* Consulting */}
              <div>
                <h3 className="text-3xl font-bold mb-16 text-[var(--color-primary)] uppercase tracking-widest border-b border-white/10 pb-4">Consulting</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center max-w-3xl mx-auto">
                  <TeamMemberCard name="Nazwa Humaira Ramadhani" role="Director" imageUrl="/assets/foto/nazwa.webp" linkedinUrl="https://www.linkedin.com/in/nazwa-humaira-ramadhani/" />
                  <TeamMemberCard name="Muhammad Fathi lanang Kayana" role="Co-Director" imageUrl="/assets/foto/fathi.png" linkedinUrl="https://www.linkedin.com/in/muh-fathi-lanang-k/" />
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </SmoothScroll>
  );
}
