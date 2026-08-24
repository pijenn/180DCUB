'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { checkAnnouncementStatus } from './actions';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
        setResult(isPassed ? 'success' : 'failed');
      } else {
        setResult('failed');
      }
    } catch (error) {
      setResult('failed');
    } finally {
      setLoading(false);
    }
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
            className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Add a subtle glow inside */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-[var(--color-primary)] blur-2xl opacity-20" />
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Check Announcement
              </h2>
              <p className="text-sm text-white/50 uppercase tracking-widest font-bold">
                Batch {batch} Results
              </p>
            </div>

            {result === 'idle' && (
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
            )}

            {result === 'success' && (
               <div className="text-center animate-fade-in-up">
                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-primary)]/20 mb-4 border border-[var(--color-primary)]/50">
                   <svg className="h-8 w-8 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                 <p className="text-white/60 mb-8 leading-relaxed text-sm">
                   You've passed the Batch {batch} selection process for Become 180! We are excited to see you in the next stage.
                 </p>
                 <button
                   onClick={() => setResult('idle')}
                   className="text-sm font-bold tracking-wider uppercase text-[var(--color-primary)] hover:text-white transition-colors"
                 >
                   Check another NIM
                 </button>
               </div>
            )}

            {result === 'failed' && (
               <div className="text-center animate-fade-in-up">
                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4 border border-red-500/50">
                   <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Thank you for participating!</h3>
                 <p className="text-white/60 mb-8 text-sm leading-relaxed">
                   After careful consideration, we regret to inform you that you have not been selected to move forward in the admission process for Batch {batch}. Keep your spirits up!
                 </p>
                 <button
                   onClick={() => setResult('idle')}
                   className="text-sm font-bold tracking-wider uppercase text-[var(--color-primary)] hover:text-white transition-colors"
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
