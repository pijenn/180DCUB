'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, animate, useInView } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';
import { DepartmentCarousel } from '@/components/become/DepartmentCarousel';
import { ContactPersonSection } from '@/components/become/ContactPersonSection';
import { SmoothScroll } from '@/components/ui/SmoothScroll';
import {
  FileText,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Globe2,
  Building2,
  ArrowUpRight
} from 'lucide-react';

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
            nodeRef.current.textContent = Math.round(value).toLocaleString("en-US") + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, from, to, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

// Helper: cek apakah tanggal hari ini ada di dalam rentang (atau setelah) suatu tahap
function getActiveIndex(items: { start: Date; end: Date }[]) {
  const now = new Date();
  // Cari stage yang sedang berjalan
  const runningIndex = items.findIndex((i) => now >= i.start && now <= i.end);
  if (runningIndex !== -1) return runningIndex;
  // Kalau tidak ada yang sedang berjalan, tandai stage terakhir yang sudah lewat
  let lastPassed = -1;
  items.forEach((i, idx) => {
    if (now > i.end) lastPassed = idx;
  });
  return lastPassed;
}

const rawTimeline = [
  {
    date: "24 Aug - 7 Sept",
    title: "Open Recruitment",
    description:
      "Pendaftaran terbuka bagi seluruh calon anggota baru. Lengkapi formulir dan siapkan berkas yang dibutuhkan sebelum batas waktu ditutup.",
    start: new Date("2026-08-24"),
    end: new Date("2026-09-07"),
  },
  {
    date: "12 - 13 Sept",
    title: "LGD",
    description:
      "Leaderless Group Discussion — sesi diskusi kelompok untuk menilai kemampuan komunikasi, kepemimpinan, dan kerja sama tim peserta.",
    start: new Date("2026-09-12"),
    end: new Date("2026-09-13"),
  },
  {
    date: "16 Sept",
    title: "Announcement Batch 1",
    description:
      "Pengumuman hasil seleksi batch pertama. Peserta yang lolos akan lanjut ke tahap Writing Test & Screening.",
    start: new Date("2026-09-16"),
    end: new Date("2026-09-16"),
    hasAnnouncement: true,
    batchNumber: 1,
  },
  {
    date: "17 - 24 Sept",
    title: "Writing Test & Screening",
    description:
      "The Writing Test is a department specific assessment designed to evaluate candidates’ knowledge, analytical thinking, problem solving, and creativity through a written or case-based task.",
    start: new Date("2026-09-17"),
    end: new Date("2026-09-24"),
  },
  {
    date: "26 Sept",
    title: "Announcement",
    description:
      "Pengumuman hasil akhir seleksi. Peserta yang dinyatakan lolos akan resmi bergabung dan melanjutkan ke tahap On Boarding.",
    start: new Date("2026-09-26"),
    end: new Date("2026-09-26"),
    hasAnnouncement: true,
    batchNumber: 2,
  },
  {
    date: "27 Sept",
    title: "On Boarding",
    description:
      "Sesi perkenalan dan pembekalan awal bagi anggota baru sebelum resmi memulai perjalanan bersama organisasi.",
    start: new Date("2026-09-27"),
    end: new Date("2026-09-27"),
  },
];

const FlipCard = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-white shadow-xl min-w-[3.5rem] md:min-w-[4.5rem] lg:min-w-[5.5rem] h-[4.5rem] md:h-[5.5rem] lg:h-[6.5rem] overflow-hidden mb-2"
        style={{ perspective: "400px" }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -90, filter: "blur(4px)", opacity: 0, y: -10 }}
            animate={{ rotateX: 0, filter: "blur(0px)", opacity: 1, y: 0 }}
            exit={{ rotateX: 90, filter: "blur(4px)", opacity: 0, y: 10 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            className="absolute inset-0 flex items-center justify-center font-mono text-3xl md:text-4xl lg:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            {value.toString().padStart(2, "0")}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest font-bold">{label}</span>
    </div>
  );
};

export default function BecomePage() {
  const targetDate = useMemo(() => new Date("2026-09-07T23:59:59").getTime(), []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);
  const [isWritingTestVisible, setIsWritingTestVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Cek apakah tanggal sekarang berada di antara 17 September dan 25 September 00:00
    const now = new Date();
    const currentYear = now.getFullYear();
    const startWriting = new Date(`${currentYear}-09-17T00:00:00`);
    const endWriting = new Date(`${currentYear}-09-25T00:00:00`);

    // Juga cek jadwal recruitment 2026
    const startWriting2026 = new Date("2026-09-17T00:00:00");
    const endWriting2026 = new Date("2026-09-25T00:00:00");

    const isVisibleNow =
      (now >= startWriting && now < endWriting) ||
      (now >= startWriting2026 && now < endWriting2026);

    setIsWritingTestVisible(isVisibleNow);

    const timer = setInterval(() => {
      const nowTime = new Date().getTime();
      const difference = targetDate - nowTime;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const yPos = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const activeIndex = useMemo(() => getActiveIndex(rawTimeline), []);

  const timelineData = rawTimeline.map((item, index) => ({
    ...item,
    isActive: index === activeIndex,
  }));

  const batch_1 = false;
  const batch_2 = false;

  let buttonText = 'Join Us!';
  let buttonLink = 'https://forms.monday.com/forms/b00a49c2076e52aac3358dd1fb13adc8?r=use1';

  if (batch_1 && !batch_2) {
    buttonText = 'Check Announcement!';
    buttonLink = '/become/check?batch=1';
  } else if (!batch_1 && batch_2) {
    buttonText = 'Check your Final Announcement!';
    buttonLink = '/become/check?batch=2';
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-[#ededed] font-sans selection:bg-[var(--color-primary)] selection:text-black">
        {/* Hero Section */}
        <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/180dc1.webp"
              alt="Become 180"
              fill
              className="object-cover object-center opacity-30 mix-blend-overlay"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
          <div className="relative z-10 text-center px-6 max-w-7xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-white uppercase mb-2">
                Become
              </h1>
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-[var(--color-primary)] uppercase">
                180.
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="mt-12 mb-10 w-full max-w-6xl px-6 md:px-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                {/* Col 1: Countdown */}
                <div className="flex flex-col items-center md:items-start justify-center md:border-r border-white/10 pb-8 md:pb-0 md:pr-10 border-b md:border-b-0">
                  <span className="text-xs tracking-[0.2em] uppercase font-bold text-[var(--color-primary)] mb-6 block text-center md:text-left w-full">Registration Closes In</span>
                  <div className="grid grid-flow-col gap-2 lg:gap-3 text-center auto-cols-max">
                    <FlipCard value={mounted ? timeLeft.days : 0} label="days" />
                    <FlipCard value={mounted ? timeLeft.hours : 0} label="hours" />
                    <FlipCard value={mounted ? timeLeft.minutes : 0} label="min" />
                    <FlipCard value={mounted ? timeLeft.seconds : 0} label="sec" />
                  </div>
                </div>

                {/* Col 2: Text & Button */}
                <div className="flex flex-col justify-center text-center md:text-left">
                  <p className="text-lg md:text-xl lg:text-xl text-white/70 font-light leading-relaxed mb-8">
                    <strong className="text-white font-semibold">Join 180 Degrees Consulting Universitas Brawijaya</strong>
                    <br></br>and make a tangible impact while developing your professional skills.
                  </p>

                  <div className="flex justify-center md:justify-start">
                    {buttonLink.startsWith('http') ? (
                      <a
                        href={buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[var(--color-primary)] text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(140,198,63,0.4)]"
                      >
                        {buttonText}
                      </a>
                    ) : (
                      <Link
                        href={buttonLink}
                        className="inline-block bg-[var(--color-primary)] text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(140,198,63,0.4)]"
                      >
                        {buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Writing Test & AI Policy Section */}
        <section className="relative w-full py-20 px-6 bg-gradient-to-b from-black/60 via-black/80 to-background border-y border-white/10 backdrop-blur-md overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-black flex items-center justify-center shrink-0 shadow-lg shadow-[var(--color-primary)]/30 mt-1">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                      Recruitment Stage 2
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Writing Test
                  </h3>
                  <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed max-w-3xl">
                    The Writing Test is a department specific assessment designed to evaluate candidates’ knowledge, analytical thinking, problem solving, and creativity through a written or case-based task.
                  </p>
                </div>
              </div>

              <Link
                href="/become/writing-test"
                className="group shrink-0 inline-flex items-center gap-3 bg-[var(--color-primary)] text-black font-bold text-base px-8 py-4 rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_25px_rgba(140,198,63,0.35)]"
              >
                <span>Writing Test Portal</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* AI Policy Notice Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wider">
                    Important: Statement of Non-Use of AI
                  </h4>
                  <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed max-w-4xl">
                    <strong className="text-white font-medium">Note:</strong> The use of AI tools, including ChatGPT, Gemini, Copilot, or other similar platforms, to generate or assist with answers is strictly prohibited. Before proceeding with the Writing Test, candidates are required to read and acknowledge the Statement of Non-Use of AI.
                  </p>
                </div>
              </div>

              <a
                href="http://clips.biz.id/OriginalityStatement"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 text-black font-bold text-sm hover:bg-white transition-all shadow-md"
              >
                <span>Read Statement</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Criteria Section - Glassmorphism layout */}
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden bg-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center">
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)] mb-4 block">What We Look For</span>
              <h2 className="text-5xl md:text-6xl font-bold mb-4">Criteria</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center w-full">
              {/* Left Column */}
              <div className="space-y-8 z-20">
                <motion.div
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl relative overflow-hidden group cursor-default"
                >
                  <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2" />
                  <h3 className="text-2xl font-bold text-white mb-3">Active Student</h3>
                  <p className="text-white/60 text-base leading-relaxed">
                    Active undergraduate student at Universitas Brawijaya with a drive to learn.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl relative overflow-hidden group cursor-default"
                >
                  <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2" />
                  <h3 className="text-2xl font-bold text-white mb-3">Analytical Skills</h3>
                  <p className="text-white/60 text-base leading-relaxed">
                    Strong analytical and problem-solving skills to tackle complex business challenges.
                  </p>
                </motion.div>
              </div>

              {/* Center Image */}
              <div className="flex justify-center relative py-10 lg:py-0 h-[35rem] w-full">
                <motion.div
                  whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full flex items-end justify-center"
                >
                  <Image
                    src="/assets/foto/nanad.png"
                    alt="Criteria central image"
                    fill
                    className="object-contain object-bottom drop-shadow-[0_0_40px_rgba(140,198,63,0.3)] z-10"
                  />
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-8 z-20">
                <motion.div
                  whileHover={{ scale: 1.05, x: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl relative overflow-hidden group cursor-default"
                >
                  <div className="absolute top-0 right-0 w-1 h-full transition-all duration-300 group-hover:w-2" />
                  <h3 className="text-2xl font-bold text-white mb-3">Social Impact</h3>
                  <p className="text-white/60 text-base leading-relaxed">
                    A genuine passion for driving meaningful social impact in our community.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, x: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl relative overflow-hidden group cursor-default"
                >
                  <div className="absolute top-0 right-0 w-1 h-full transition-all duration-300 group-hover:w-2" />
                  <h3 className="text-2xl font-bold text-white mb-3">Commitment</h3>
                  <p className="text-white/60 text-base leading-relaxed">
                    Dedicated time and effort to participate actively in consulting projects.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Our Department Carousel Segment */}
        <DepartmentCarousel />

        {/* 4. Why Join Us / Benefits Section - Seamless & Minimalist (Referencing Home) */}
        <section className="relative w-full bg-background border-t border-white/10 py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-[2px] bg-[var(--color-primary)]" />
                <span className="text-xs sm:text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">
                  Why Join Us
                </span>
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
                Benefits.
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl text-white/60 font-light max-w-4xl leading-relaxed">
                Become a member of the world&apos;s largest university-based consultancy organization.
              </p>
            </div>

            {/* Animated Statistics Row - Minimalist, Non-Boxed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-8 border-t border-white/10 pt-16 pb-24">
              <div className="flex flex-col group">
                <div className="text-[var(--color-primary)] mb-6 opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                  <Globe2 className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-3 tracking-tighter">
                  <AnimatedCounter from={0} to={35} suffix="+" />
                </h3>
                <p className="text-sm uppercase tracking-[0.25em] font-bold text-white/50">Countries</p>
              </div>

              <div className="flex flex-col group">
                <div className="text-[var(--color-primary)] mb-6 opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                  <Building2 className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-3 tracking-tighter">
                  <AnimatedCounter from={0} to={180} suffix="+" />
                </h3>
                <p className="text-sm uppercase tracking-[0.25em] font-bold text-white/50">Branches Worldwide</p>
              </div>

              <div className="flex flex-col group">
                <div className="text-[var(--color-primary)] mb-6 opacity-70 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                  <Users className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-3 tracking-tighter">
                  <AnimatedCounter from={0} to={10000} suffix="+" />
                </h3>
                <p className="text-sm uppercase tracking-[0.25em] font-bold text-white/50">Consultants</p>
              </div>
            </div>

            {/* 2 Core Benefit Pillars - Editorial Seamless Split Design */}
            <div className="space-y-0 border-t border-white/10">
              {/* Pillar 01 */}
              <div className="py-16 md:py-20 border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start group">
                <div className="lg:col-span-5 flex items-baseline gap-4">
                  <span className="text-3xl sm:text-5xl font-mono font-bold text-white/20 group-hover:text-[var(--color-primary)] transition-colors duration-500">
                    01
                  </span>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-bold text-[var(--color-primary)] block">
                      Personal & Career
                    </span>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight group-hover:translate-x-1 transition-transform duration-500">
                      Supporting Your Personal & Professional Growth
                    </h3>
                  </div>
                </div>

                <div className="lg:col-span-7 pl-0 lg:pl-8 lg:border-l border-white/10">
                  <ul className="space-y-8">
                    <li className="flex items-start gap-4 group/item">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white group-hover/item:text-[var(--color-primary)] transition-colors">
                          Gain professional work experience
                        </h4>
                        <p className="text-base sm:text-lg text-white/50 font-light mt-1.5 leading-relaxed">
                          Immerse yourself in authentic management consulting workflows and build an impressive portfolio.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 group/item">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white group-hover/item:text-[var(--color-primary)] transition-colors">
                          Enhance your research and analytical skills
                        </h4>
                        <p className="text-base sm:text-lg text-white/50 font-light mt-1.5 leading-relaxed">
                          Master structured frameworks, data-driven methodology, and executive presentation capabilities.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 group/item">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white group-hover/item:text-[var(--color-primary)] transition-colors">
                          Participate in hands-on projects with real clients
                        </h4>
                        <p className="text-base sm:text-lg text-white/50 font-light mt-1.5 leading-relaxed">
                          Work directly with social enterprises, NGOs, and businesses to solve high-impact strategic challenges.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pillar 02 */}
              <div className="py-16 md:py-20 border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start group">
                <div className="lg:col-span-5 flex items-baseline gap-4">
                  <span className="text-3xl sm:text-5xl font-mono font-bold text-white/20 group-hover:text-[var(--color-primary)] transition-colors duration-500">
                    02
                  </span>
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.25em] font-bold text-[var(--color-primary)] block">
                      Leadership & Community
                    </span>
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight group-hover:translate-x-1 transition-transform duration-500">
                      Build Connections with High-Achieving Students & Professionals
                    </h3>
                  </div>
                </div>

                <div className="lg:col-span-7 pl-0 lg:pl-8 lg:border-l border-white/10">
                  <ul className="space-y-8">
                    <li className="flex items-start gap-4 group/item">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white group-hover/item:text-[var(--color-primary)] transition-colors">
                          Collaborate with 40+ analysts from diverse backgrounds
                        </h4>
                        <p className="text-base sm:text-lg text-white/50 font-light mt-1.5 leading-relaxed">
                          Team up with top-performing students across various faculties in an agile, supportive culture.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 group/item">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white group-hover/item:text-[var(--color-primary)] transition-colors">
                          Receive mentorship from professionals and board members
                        </h4>
                        <p className="text-base sm:text-lg text-white/50 font-light mt-1.5 leading-relaxed">
                          Accelerate your trajectory with dedicated 1-on-1 coaching, industry insights, and career feedback.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4 group/item">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform" />
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white group-hover/item:text-[var(--color-primary)] transition-colors">
                          Expand your network with internationally minded future leaders
                        </h4>
                        <p className="text-base sm:text-lg text-white/50 font-light mt-1.5 leading-relaxed">
                          Connect with alumni and branch members from our worldwide network across 35+ countries.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section - Sticky Scroll */}
        <section className="relative w-full bg-background border-t border-white/10 py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row relative">

            {/* Left Sticky Header */}
            <div className="lg:w-1/3 lg:sticky lg:top-32 h-fit mb-16 lg:mb-0 z-10 flex flex-col items-start">
              <span className="text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)] mb-4 block">Journey</span>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">Recruitment<br />Timeline.</h2>
              <p className="text-xl text-white/50 font-light max-w-sm leading-relaxed">
                Follow our timeline to stay updated on the recruitment stages. Don't miss your chance to be part of the change.
              </p>
            </div>

            {/* Right Scrollable Content */}
            <div className="lg:w-2/3 lg:pl-16 relative" ref={containerRef}>
              {/* The vertical tracking line */}
              <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-white/10 hidden md:block">
                <motion.div
                  className="absolute top-0 w-full bg-[var(--color-primary)] shadow-[0_0_15px_rgba(140,198,63,0.8)]"
                  style={{ height: yPos, maxHeight: '100%' }}
                />
              </div>

              <div className="space-y-24">
                {timelineData.map((item, index) => (
                  <div key={index} className="relative flex flex-col md:flex-row gap-8 md:gap-16 group">
                    {/* Date/Dot Area */}
                    <div className="flex items-center gap-6 md:w-[150px] shrink-0">
                      <div className={`hidden md:flex w-14 h-14 rounded-full border-2 ${item.isActive ? 'border-[var(--color-primary)] bg-background' : 'border-white/10 bg-background'} items-center justify-center absolute left-0 z-10 transition-colors duration-500`}>
                        <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-[var(--color-primary)] shadow-[0_0_10px_rgba(140,198,63,1)]' : 'bg-white/20'}`} />
                      </div>
                      <div className={`md:ml-20 text-sm md:text-base font-bold tracking-wider ${item.isActive ? 'text-[var(--color-primary)]' : 'text-white/40'} transition-colors`}>
                        {item.date}
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-grow bg-white/5 backdrop-blur-sm border ${item.isActive ? 'border-[var(--color-primary)]/50 shadow-[0_0_30px_rgba(140,198,63,0.15)]' : 'border-white/10'} rounded-3xl p-8 md:p-10 transition-all duration-300 hover:bg-white/10`}>
                      <h3 className="text-3xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-white/50 font-light leading-relaxed mb-6 text-lg">
                        {item.description}
                      </p>

                      {item.hasAnnouncement && (
                        <Link
                          href={`/become/check?batch=${item.batchNumber}`}
                          className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest uppercase text-black bg-[var(--color-primary)] rounded-full hover:bg-white transition-all transform hover:scale-105"
                        >
                          Check Announcement &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 5. Contact Person Section ("Still Curious about Become 180? Contact Us!") */}
        <ContactPersonSection />
      </div>
    </SmoothScroll>
  );
}
