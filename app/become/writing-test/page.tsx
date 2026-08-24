'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { submitWritingTest } from './actions';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Lock,
  Sparkles,
  LogIn
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEPARTMENTS = [
  'Human Resources',
  'Legal and Finance',
  'Marketing',
  'Consulting',
  'Client Acquisition',
  'Strategy and Growth',
];

// 17 September to 25 September 00:00
const START_DATE_STR = '2026-09-17T00:00:00+07:00';
const END_DATE_STR = '2026-09-25T00:00:00+07:00';

export default function WritingTestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    department: '',
    driveLink: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Date restriction calculation
  const [dateStatus, setDateStatus] = useState<'early' | 'open' | 'closed'>('open');

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      setAuthLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Try to fetch full name from public.users table
        const { data: profile } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        const nameCandidate = profile?.full_name || session.user.user_metadata?.full_name || '';
        setFormData((prev) => ({
          ...prev,
          name: nameCandidate,
        }));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    };

    checkAuthAndProfile();

    // Check date window
    const now = new Date().getTime();
    const startDate = new Date(START_DATE_STR).getTime();
    const endDate = new Date(END_DATE_STR).getTime();

    if (now < startDate) {
      setDateStatus('early');
    } else if (now >= endDate) {
      setDateStatus('closed');
    } else {
      setDateStatus('open');
    }
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/become/writing-test`,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      toast.error('Please sign in to submit your writing test.');
      return;
    }

    if (!formData.name.trim() || !formData.nim.trim() || !formData.department || !formData.driveLink.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitWritingTest({
        name: formData.name,
        nim: formData.nim,
        department: formData.department,
        driveLink: formData.driveLink,
      });

      if (res.success) {
        setIsSubmitted(true);
        toast.success('Writing test submitted successfully!');
      } else {
        setErrorMessage(res.error || 'Failed to submit writing test. Please try again.');
        toast.error(res.error || 'Submission failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-[#ededed] font-sans selection:bg-[var(--color-primary)] selection:text-black py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background visual ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/180dc1.webp"
          alt="Become 180 Background"
          fill
          className="object-cover object-center opacity-20 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/90 to-[#0a0a0a]" />
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-primary)]/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">

        {/* Navigation & Header */}
        <div className="mb-8">
          <Link
            href="/become"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[var(--color-primary)] transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Become 180
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs sm:text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">
              Recruitment Stage 2
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Writing Test Submission
          </h1>
          <p className="text-base sm:text-lg text-white/70 font-light mt-3 leading-relaxed">
            The Writing Test is a department specific assessment designed to evaluate candidates’ knowledge, analytical thinking, problem solving, and creativity through a written or case-based task.
          </p>
        </div>

        {/* AI Policy Notice Banner */}
        <div className="mb-8 p-6 sm:p-7 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wider">
                Statement of Non-Use of AI
              </h4>
              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                <strong className="text-white font-medium">Note:</strong> The use of AI tools, including ChatGPT, Gemini, Copilot, or other similar platforms, to generate or assist with answers is strictly prohibited. Before proceeding with the Writing Test, candidates are required to read and acknowledge the Statement of Non-Use of AI.
              </p>
            </div>
          </div>

          <a
            href="https://clips.id/SuratPernyataanOrisinalitas"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black font-bold text-xs hover:bg-white transition-all shadow-md"
          >
            <span>Read Statement</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Date Window Notices */}
        {dateStatus === 'closed' && (
          <div className="mb-8 p-6 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-start gap-4">
            <Clock className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-destructive text-lg">Submissions Are Now Closed</h3>
              <p className="text-sm text-white/70 mt-1">
                The deadline for the writing test submission was 25 September at 00:00. If you have questions, please contact our contact persons on the Become page.
              </p>
            </div>
          </div>
        )}

        {dateStatus === 'early' && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
            <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-400 text-lg">Writing Test Opens on 17 September</h3>
              <p className="text-sm text-white/70 mt-1">
                The writing test portal opens on 17 September. You can preview the form and prepare your documents in advance.
              </p>
            </div>
          </div>
        )}

        {/* Action Card: "See The Test!" Prompt Access */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Case Materials & Prompt
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Access the Writing Test Prompt</h3>
            <p className="text-sm text-white/60 font-light">
              Read the case brief and instructions carefully before preparing your submission.
            </p>
          </div>


        </div>

        {/* Authentication Wall Check */}
        {authLoading ? (
          <div className="p-16 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            <p className="text-sm text-white/50">Verifying your authentication...</p>
          </div>
        ) : !user ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/15 text-center flex flex-col items-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                You must be logged in to submit your writing test so we can accurately record your application.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-base hover:bg-[var(--color-primary)] transition-all shadow-xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        ) : isSubmitted ? (
          /* Submission Success View */
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/20 text-center flex flex-col items-center space-y-6 shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white">Submission Successful!</h2>
              <p className="text-base text-white/70 max-w-md mx-auto font-light">
                Thank you, <strong className="text-white">{formData.name}</strong>! Your writing test response for the <strong className="text-[var(--color-primary)]">{formData.department}</strong> department has been recorded.
              </p>
            </div>

            <div className="w-full max-w-md p-5 bg-black/40 border border-white/10 rounded-2xl text-left text-sm space-y-2 text-white/70">
              <div className="flex justify-between">
                <span>NIM:</span>
                <span className="font-semibold text-white">{formData.nim}</span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-semibold text-white">{formData.department}</span>
              </div>
              <div className="flex justify-between truncate">
                <span className="shrink-0 mr-2">Drive Link:</span>
                <span className="font-mono text-xs text-[var(--color-primary)] truncate">{formData.driveLink}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData((prev) => ({ ...prev, driveLink: '' }));
                }}
                className="px-6 py-3 rounded-full border border-white/20 text-sm font-bold text-white/70 hover:text-white hover:border-white transition-all"
              >
                Submit Another Response
              </button>
              <Link
                href="/become"
                className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-black text-sm font-bold hover:bg-white transition-all"
              >
                Return to Become 180
              </Link>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <div className="p-6 sm:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/15 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">

              {errorMessage && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nama */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-white uppercase tracking-wider block">
                    Nama Lengkap <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Budi Santoso"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm font-light"
                  />
                </div>

                {/* NIM */}
                <div className="space-y-2">
                  <label htmlFor="nim" className="text-sm font-bold text-white uppercase tracking-wider block">
                    NIM <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="nim"
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="e.g. 235150201111000"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm font-light"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-bold text-white uppercase tracking-wider block">
                  Department <span className="text-[var(--color-primary)]">*</span>
                </label>
                <select
                  id="department"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/80 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm font-light"
                >
                  <option value="" disabled className="text-white/40">
                    Select Your Applied Department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-neutral-900 text-white py-2">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drive Link */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="driveLink" className="text-sm font-bold text-white uppercase tracking-wider block">
                    Link Google Drive <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--color-primary)] font-mono">
                    Format: Name_NIM_Department
                  </span>
                </div>
                <input
                  id="driveLink"
                  type="url"
                  required
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all text-sm font-light"
                />
                <p className="text-xs text-white/40 leading-relaxed pt-1">
                  Ensure the sharing permission of your Google Drive link is set to <strong>"Anyone with the link can view"</strong> (Siapa saja yang memiliki link dapat melihat).
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || dateStatus === 'closed'}
                  className="w-full py-4 px-8 rounded-full bg-[var(--color-primary)] text-black font-bold text-lg hover:bg-white transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(140,198,63,0.3)] flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Response...</span>
                    </>
                  ) : (
                    <span>Submit Writing Test</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
