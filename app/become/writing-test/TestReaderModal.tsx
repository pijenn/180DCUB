'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Lock,
  ExternalLink,
  Phone,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  WRITING_TEST_DEPARTMENTS,
  DepartmentTest,
  TrackTest,
  ContactPerson
} from './writingTestData';

interface TestReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  userName?: string | null;
  defaultDepartment?: string | null;
}

export default function TestReaderModal({
  isOpen,
  onClose,
  userEmail,
  userName,
  defaultDepartment
}: TestReaderModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('hr');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');

  // Check stored agreement in session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('180dc_writing_test_agreed');
      if (saved === 'true') {
        setHasAgreed(true);
      }
    }
  }, []);

  // Sync selected dept when defaultDepartment changes or when opened
  useEffect(() => {
    if (defaultDepartment) {
      const match = WRITING_TEST_DEPARTMENTS.find(
        (d) => d.name.toLowerCase() === defaultDepartment.toLowerCase() ||
               d.shortName.toLowerCase() === defaultDepartment.toLowerCase()
      );
      if (match) {
        setSelectedDeptId(match.id);
        setSelectedTrackId(match.tracks[0]?.id || '');
        return;
      }
    }
    // Default to first track of the current selected department
    const currentDept = WRITING_TEST_DEPARTMENTS.find((d) => d.id === selectedDeptId);
    if (currentDept && currentDept.tracks.length > 0) {
      if (!selectedTrackId || !currentDept.tracks.some((t) => t.id === selectedTrackId)) {
        setSelectedTrackId(currentDept.tracks[0].id);
      }
    }
  }, [defaultDepartment, selectedDeptId, isOpen]);

  // Anti-Copy & Anti-Inspection Keydown Handlers
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modal on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Block Ctrl/Cmd + C, P, S, U, A inside modal
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'c' || key === 'p' || key === 's' || key === 'u' || key === 'a') {
          e.preventDefault();
          toast.error('Test material is strictly protected. Copying & printing are prohibited.', {
            id: 'security-toast'
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDept = WRITING_TEST_DEPARTMENTS.find((d) => d.id === selectedDeptId) || WRITING_TEST_DEPARTMENTS[0];
  const currentTrack: TrackTest | undefined =
    currentDept.tracks.find((t) => t.id === selectedTrackId) || currentDept.tracks[0];

  const handleAgreeAndContinue = () => {
    if (!agreeChecked) return;
    setHasAgreed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('180dc_writing_test_agreed', 'true');
    }
  };

  const handlePreventCopy = (e: React.SyntheticEvent) => {
    e.preventDefault();
    toast.error('Copying test content is strictly prohibited.', { id: 'copy-blocked' });
  };

  const trackingId = userName
    ? `${userName.toUpperCase()} • ${userEmail || 'AUTHENTICATED'}`
    : `CANDIDATE SESSION • ${userEmail || 'TRACKED'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-fade-in select-none writing-test-reader-root"
      onContextMenu={(e) => {
        e.preventDefault();
        toast.error('Right-click context menu is disabled for test security.', { id: 'no-context' });
      }}
      onCopy={handlePreventCopy}
      onCut={handlePreventCopy}
      onDragStart={handlePreventCopy}
      style={{
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* Print security stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .writing-test-reader-root {
              display: none !important;
            }
            body {
              display: none !important;
            }
          }
        `
      }} />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0d0f12] border border-white/15 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-10 text-[#ededed]">

        {/* Dynamic Watermark Background (Anti-screen capture deterrence) */}
        <div
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-[0.035] flex flex-wrap gap-12 items-center justify-center p-8 select-none rotate-[-12deg]"
          aria-hidden="true"
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="text-xs font-mono tracking-widest text-white whitespace-nowrap">
              CONFIDENTIAL • 180DC UB • {trackingId}
            </div>
          ))}
        </div>

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Writing Test Materials
              </h2>
              <p className="text-xs text-white/50 hidden sm:block">
                Recruitment Stage 2 • 180 Degrees Consulting Universitas Brawijaya
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            title="Close viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conditional View: Disclaimer Gate vs Test Reader */}
        {!hasAgreed ? (
          /* ========================================================= */
          /* DISCLAIMER GATE                                           */
          /* ========================================================= */
          <div className="p-6 sm:p-10 md:p-12 overflow-y-auto flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto space-y-6 z-30">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-amber-400">
                Security & Integrity Notice
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Writing Test Agreement
              </h3>
            </div>

            {/* Exact Required Disclaimer Text */}
            <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-6 sm:p-7 text-left space-y-4 shadow-inner">
              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                This platform utilizes advanced automated tracking technology capable of detecting screen captures, screen recordings, and unauthorized distribution of test content.
              </p>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
                Each test session contains unique digital identifiers linked directly to your account. Any attempt to capture, copy, or share test materials will be logged immediately and will result in instant disqualification and permanent suspension.
              </p>
            </div>

            {/* Checkbox "I agree" */}
            <label className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/25 cursor-pointer transition-all w-full max-w-md justify-center">
              <input
                type="checkbox"
                checked={agreeChecked}
                onChange={(e) => setAgreeChecked(e.target.checked)}
                className="w-5 h-5 rounded border-white/30 bg-black/40 text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0 transition cursor-pointer accent-[var(--color-primary)]"
              />
              <span className="text-sm sm:text-base font-semibold text-white select-none">
                I agree
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-3 px-6 rounded-full border border-white/15 text-sm font-semibold text-white/70 hover:text-white hover:border-white/30 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreeChecked}
                onClick={handleAgreeAndContinue}
                className="w-full sm:w-1/2 py-3 px-6 rounded-full bg-[var(--color-primary)] text-black text-sm font-bold hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(140,198,63,0.3)] flex items-center justify-center gap-2"
              >
                <span>Read The Test</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* TEST CONTENT READER                                       */
          /* ========================================================= */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden z-30">

            {/* Left Sidebar: Department Selection */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 flex md:flex-col shrink-0 overflow-x-auto md:overflow-y-auto p-2 sm:p-3 gap-1.5 scrollbar-thin">
              <div className="hidden md:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Departments
              </div>

              {WRITING_TEST_DEPARTMENTS.map((dept) => {
                const isActive = dept.id === selectedDeptId;
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      setSelectedTrackId(dept.tracks[0]?.id || '');
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all shrink-0 md:w-full ${
                      isActive
                        ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-white font-semibold shadow-sm'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="relative w-7 h-7 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-0.5">
                      <Image
                        src={dept.logo}
                        alt={dept.name}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div className="truncate text-xs sm:text-sm">
                      <div className="truncate">{dept.name}</div>
                      {dept.isComingSoon && (
                        <span className="text-[10px] text-amber-400 font-mono">Coming Soon</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Pane: Tracks & Test Details */}
            <div className="flex-1 flex flex-col overflow-hidden bg-black/20">

              {/* Department Header & Sub-track Tabs */}
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.015] shrink-0">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-black/60 border border-white/15 p-1.5 shrink-0 flex items-center justify-center shadow-md">
                    <Image
                      src={currentDept.logo}
                      alt={currentDept.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {currentDept.name}
                    </h3>
                    <p className="text-xs text-white/50">
                      {currentDept.tracks.length > 1
                        ? `Select a division/role below to view the corresponding prompt.`
                        : `Department Writing Assessment`}
                    </p>
                  </div>
                </div>

                {/* Sub-track Tabs (If department has multiple roles e.g. Marketing, S&G, L&F, CA) */}
                {currentDept.tracks.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                    {currentDept.tracks.map((track, idx) => {
                      const isTrackActive = (currentTrack?.id === track.id);
                      return (
                        <button
                          key={track.id}
                          onClick={() => setSelectedTrackId(track.id)}
                          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                            isTrackActive
                              ? 'bg-white text-black shadow-md'
                              : 'bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <span className="text-[11px] opacity-60 font-mono">
                            {idx + 1}.
                          </span>
                          <span>{track.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Scrollable Content Body */}
              <div
                className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8 scrollbar-thin test-reader-content"
                style={{
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                {/* Coming Soon Notice if track or dept is marked coming soon */}
                {currentTrack?.isComingSoon ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-bold text-white">Coming Soon</h4>
                      <p className="text-sm text-white/60 font-light">
                        The writing test prompt for {currentDept.name} is currently in preparation. Please check back soon!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: Test Description */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                        <h4 className="text-lg font-bold text-white tracking-wide uppercase">
                          1. Test Description
                        </h4>
                      </div>
                      <div className="space-y-3 text-sm sm:text-base text-white/80 font-light leading-relaxed bg-white/[0.02] border border-white/10 p-5 rounded-2xl">
                        {currentTrack?.testDescription.map((p, i) => (
                          <p key={i} className="leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>
                    </section>

                    {/* SECTION 2: Test Mechanism */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                        <h4 className="text-lg font-bold text-white tracking-wide uppercase">
                          2. Test Mechanism
                        </h4>
                      </div>
                      <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl space-y-4">
                        <div className="space-y-2.5 text-sm sm:text-base text-white/80 font-light leading-relaxed">
                          {currentTrack?.testMechanism.points.map((pt, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="text-[var(--color-primary)] font-bold shrink-0 mt-0.5">•</span>
                              <span className={pt.startsWith('Important Rules') ? 'font-bold text-amber-400 mt-2 block' : ''}>
                                {pt}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Resource Links if any */}
                        {currentTrack?.testMechanism.links && currentTrack.testMechanism.links.length > 0 && (
                          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3">
                            {currentTrack.testMechanism.links.map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[var(--color-primary)] text-white hover:text-black font-semibold text-xs sm:text-sm transition-all border border-white/15 shadow-sm"
                              >
                                <span>{link.label}</span>
                                {link.badge && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-white font-mono">
                                    {link.badge}
                                  </span>
                                )}
                                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* SECTION 3: Writing Test Detail */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                        <h4 className="text-lg font-bold text-white tracking-wide uppercase">
                          3. Writing Test Detail
                        </h4>
                      </div>
                      <div className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl space-y-4">
                        <div className="space-y-2.5 text-sm sm:text-base text-white/80 font-light leading-relaxed">
                          {currentTrack?.writingTestDetail.points.map((detail, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <span className="text-[var(--color-primary)] font-bold shrink-0 mt-0.5">•</span>
                              <span className={detail.includes('strictly PROHIBITED') ? 'text-amber-300 font-medium' : ''}>
                                {detail}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Questions list if available (e.g. S&G Product/Program) */}
                        {currentTrack?.writingTestDetail.questions && (
                          <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                            <h5 className="font-bold text-sm text-[var(--color-primary)] uppercase tracking-wider">
                              Assessment Questions
                            </h5>
                            <div className="space-y-4">
                              {currentTrack.writingTestDetail.questions.map((q, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2"
                                >
                                  {q.title && (
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider block font-mono">
                                      {q.title}
                                    </span>
                                  )}
                                  {q.prompt && (
                                    <p className="text-sm text-white font-medium">
                                      {q.prompt}
                                    </p>
                                  )}
                                  {q.options && q.options.length > 0 && (
                                    <div className="space-y-1.5 pl-3 pt-1">
                                      {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="text-xs sm:text-sm text-white/70">
                                          {opt}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Extra Links if available (e.g. Case Study document) */}
                        {currentTrack?.writingTestDetail.links && currentTrack.writingTestDetail.links.length > 0 && (
                          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3">
                            {currentTrack.writingTestDetail.links.map((link, i) => (
                              <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs sm:text-sm hover:bg-white transition-all shadow-sm"
                              >
                                <span>{link.label}</span>
                                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Contact Person Footer Card */}
                    {Boolean(currentTrack?.contactPersons?.length || currentTrack?.contactPerson) && (
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs text-white/50 uppercase font-mono tracking-wider">
                              Questions or Difficulties?
                            </div>
                            <div className="text-sm font-bold text-white">
                              {currentTrack?.contactPersons && currentTrack.contactPersons.length > 0 ? (
                                <span>
                                  Contact: {currentTrack.contactPersons.map((cp: ContactPerson) => `${cp.name} (${cp.phone})`).join(' / ')}
                                </span>
                              ) : (
                                <span>
                                  Contact: {currentTrack?.contactPerson?.name} ({currentTrack?.contactPerson?.phone})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {(currentTrack?.contactPersons && currentTrack.contactPersons.length > 0
                            ? currentTrack.contactPersons
                            : currentTrack?.contactPerson
                            ? [currentTrack.contactPerson]
                            : []
                          ).map((cp: ContactPerson, idx: number) => (
                            <a
                              key={idx}
                              href={`https://wa.me/${cp.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-black font-semibold text-xs text-white transition-all shrink-0 inline-flex items-center gap-1.5"
                            >
                              <span>WhatsApp ({cp.name})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs text-white/50 z-30">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Anti-copy protection active. Unauthorized recording or distribution is strictly prohibited.</span>
          </div>
          {hasAgreed && (
            <button
              onClick={() => setHasAgreed(false)}
              className="text-xs text-white/40 hover:text-white underline transition-colors"
            >
              Review Agreement & Disclaimer
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
