'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { checkAnnouncementStatus } from './actions';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import confetti from 'canvas-confetti';
import { Sparkles, PartyPopper, ExternalLink, RotateCcw, CheckCircle2, CalendarCheck, ArrowRight } from 'lucide-react';

const BATCH_1_WA_GROUP_URL = 'https://chat.whatsapp.com/JZvgqn5OhXD86kxThdoFvK?mode=gi_t';

const triggerJoyfulCelebration = () => {
  if (typeof window === 'undefined') return;

  // Initial cannon burst from left & right
  confetti({
    particleCount: 75,
    spread: 70,
    origin: { x: 0.15, y: 0.65 },
    colors: ['#8cc63f', '#25D366', '#facc15', '#38bdf8', '#ffffff'],
    ticks: 250,
  });
  confetti({
    particleCount: 75,
    spread: 70,
    origin: { x: 0.85, y: 0.65 },
    colors: ['#8cc63f', '#25D366', '#facc15', '#38bdf8', '#ffffff'],
    ticks: 250,
  });

  // Center star explosion
  setTimeout(() => {
    confetti({
      particleCount: 65,
      spread: 110,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#8cc63f', '#fbbf24', '#34d399', '#ffffff'],
      ticks: 300,
    });
  }, 220);

  // Cascading wide cannon blast
  setTimeout(() => {
    confetti({
      particleCount: 90,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#8cc63f', '#25D366', '#facc15', '#38bdf8'],
    });
    confetti({
      particleCount: 90,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#8cc63f', '#25D366', '#facc15', '#38bdf8'],
    });
  }, 450);
};

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

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

function CheckerContent() {
  const searchParams = useSearchParams();
  const batchParam = searchParams.get('batch');
  const batch = batchParam === '2' ? 2 : 1;

  const targetDateStr = batch === 2 ? "2026-09-26T15:00:00+07:00" : "2026-06-16T15:00:00+07:00";
  const targetDate = useMemo(() => new Date(targetDateStr).getTime(), [targetDateStr]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'failed'>('idle');

  useEffect(() => {
    setMounted(true);
    
    const checkLockStatus = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setIsLocked(true);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setIsLocked(false);
      }
    };

    checkLockStatus(); 

    const timer = setInterval(checkLockStatus, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || !email) return;

    setLoading(true);
    setResult('idle');

    try {
      const res = await checkAnnouncementStatus(nim, email);
      if (res.success && res.status) {
        const isPassed = batch === 2 ? res.status.status_2 : res.status.status_1;
        setApplicantName(res.status.name || '');
        if (isPassed) {
          setResult('success');
          // Trigger joyful celebration animation & confetti immediately!
          setTimeout(() => {
            triggerJoyfulCelebration();
          }, 150);
        } else {
          setResult('failed');
        }
      } else {
        setResult('failed');
      }
    } catch {
      setResult('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult('idle');
    setApplicantName('');
  };

  return (
    <div className="min-h-screen bg-background text-[#ededed] font-sans selection:bg-[var(--color-primary)] selection:text-black flex flex-col items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
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

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {isLocked ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
              Please wait for your announcement at <br className="hidden md:block" />
              <span className="text-[var(--color-primary)]">
                {batch === 2 ? '26th September' : '16th September'}
              </span>
            </h1>
            <p className="text-lg text-white/50 mb-12">
              The result for Batch {batch} will be available soon.
            </p>
            
            <div className="grid grid-flow-col gap-2 md:gap-4 text-center auto-cols-max">
              <FlipCard value={mounted ? timeLeft.days : 0} label="days" />
              <FlipCard value={mounted ? timeLeft.hours : 0} label="hours" />
              <FlipCard value={mounted ? timeLeft.minutes : 0} label="min" />
              <FlipCard value={mounted ? timeLeft.seconds : 0} label="sec" />
            </div>

            <div className="mt-12">
              <Link href="/become" className="text-sm font-medium text-white/50 hover:text-white transition-colors">
                &larr; Back to Timeline
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`w-full ${result === 'success' ? 'max-w-lg' : 'max-w-md'} bg-white/5 backdrop-blur-md border ${result === 'success' ? 'border-[var(--color-primary)]/40 shadow-[0_0_50px_rgba(140,198,63,0.2)]' : 'border-white/10 shadow-2xl'} p-6 sm:p-8 rounded-3xl relative overflow-hidden transition-all duration-500`}
          >
            {/* Ambient glow top */}
            <div 
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 ${result === 'success' ? 'bg-[var(--color-primary)] opacity-80 blur-xl' : 'bg-[var(--color-primary)] opacity-20 blur-2xl'} transition-all`} 
            />

            {result === 'idle' && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Check Announcement
                  </h2>
                  <p className="text-sm text-white/50 uppercase tracking-widest font-bold">
                    Batch {batch} Results
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="nim" className="sr-only">NIM</label>
                    <input
                      id="nim"
                      name="nim"
                      type="text"
                      required
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      placeholder="Enter your NIM"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      placeholder="Enter your Email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-primary)] text-black font-bold py-3 px-4 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(140,198,63,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Checking...' : 'Check Status'}
                  </button>
                </form>
              </>
            )}

            {result === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.35, duration: 0.7 }}
                className="text-center relative z-10"
              >
                {/* Radiant celebration ambient background aura */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-primary)]/15 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse" />

                {/* Animated celebration icon */}
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.15, duration: 0.8 }}
                  className="mx-auto relative flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)]/30 via-[var(--color-primary)]/20 to-emerald-400/30 mb-5 border-2 border-[var(--color-primary)] shadow-[0_0_35px_rgba(140,198,63,0.4)]"
                >
                  <PartyPopper className="h-10 w-10 text-[var(--color-primary)] animate-bounce" />
                  
                  {/* Floating sparkles badges around the icon */}
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute -top-2 -right-2 bg-yellow-400/90 text-black p-1 rounded-full shadow-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                  </motion.div>
                </motion.div>

                {/* Batch status badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(140,198,63,0.15)]">
                  <span>Batch {batch} Selection • Passed</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
                  Congratulations!
                </h3>

                {applicantName ? (
                  <p className="text-lg font-medium text-white/90 mb-3">
                    Congratulations, <span className="text-[var(--color-primary)] font-bold">{applicantName}</span>! 🎉
                  </p>
                ) : (
                  <p className="text-lg font-medium text-white/90 mb-3">
                    Selamat, Kamu Lolos! 🎉
                  </p>
                )}

                <p className="text-white/70 mb-6 leading-relaxed text-sm max-w-md mx-auto">
                  You have successfully passed the <span className="text-white font-semibold">Batch {batch} selection process</span> for <span className="text-white font-semibold">Become 180</span>! We are thrilled to welcome your talent and passion to 180 Degrees Consulting Universitas Brawijaya.
                </p>

                {/* WhatsApp Group Call-to-Action */}
                {batch === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="mb-6"
                  >
                    <div className="bg-black/30 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.3)] text-left">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Next Step Required</span>
                      </div>
                      <p className="text-xs text-white/70 mb-3 leading-relaxed">
                        Please join the official WhatsApp group for Batch 1 successful candidates as soon as possible to receive the briefing, and other important information.
                      </p>
                      <motion.a
                        href={BATCH_1_WA_GROUP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(37, 211, 102, 0.45)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-[#25D366] via-[#20ba5a] to-[#128C7E] text-white font-bold p-3.5 sm:p-4 rounded-xl shadow-lg transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
                            <WhatsAppIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-white/85 uppercase tracking-wider leading-none mb-1">Official Community</div>
                            <div className="text-sm sm:text-base font-extrabold text-white leading-tight">Join Batch 1 WhatsApp Group</div>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </motion.a>

                      {/* Interview Schedule Call-to-Action */}
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <Link
                          href={`/become/interview-schedule?nim=${encodeURIComponent(nim)}&email=${encodeURIComponent(email)}`}
                          className="w-full flex items-center justify-between gap-3 bg-[var(--color-primary)] text-black font-extrabold p-3.5 sm:p-4 rounded-xl shadow-lg hover:bg-white transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black/15 flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition-transform">
                              <CalendarCheck className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="text-[11px] font-bold text-black/70 uppercase tracking-wider leading-none mb-1">Mandatory Next Step</div>
                              <div className="text-sm sm:text-base font-extrabold text-black leading-tight">Book Interview Schedule</div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-black group-hover:translate-x-1 transition-transform shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Additional celebratory action: Celebrate again confetti button */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={triggerJoyfulCelebration}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Celebrate again 🎉</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/60 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Check another NIM</span>
                  </button>
                </div>
              </motion.div>
            )}

            {result === 'failed' && (
              <div className="text-center animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4 border border-red-500/50">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Thank you for participating and Don’t let this stop you! !</h3>
                <p className="text-white/60 mb-8 text-sm leading-relaxed">
                  We truly appreciate all the effort you’ve put into this process. Keep growing and we hope to see you again at another 180 event!
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-sm font-bold tracking-wider uppercase text-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
                >
                  Check another NIM
                </button>
              </div>
            )}

            <div className="mt-8 text-center pt-6 border-t border-white/10">
              <Link href="/become" className="text-sm font-medium text-white/40 hover:text-white transition-colors">
                &larr; Back to Timeline
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function CheckAnnouncementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background text-white flex items-center justify-center">Loading...</div>}>
      <CheckerContent />
    </Suspense>
  );
}
