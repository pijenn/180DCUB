"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  CalendarCheck, 
  Clock, 
  Calendar, 
  Building2, 
  Users, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RotateCcw, 
  X,
  Phone,
  Ticket,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  DEPARTMENTS, 
  INTERVIEW_DATES, 
  TIME_SLOTS, 
  generateWhatsAppLink,
  type DepartmentConfig 
} from "@/lib/interviewConstants";
import { 
  verifyCandidateEligibility, 
  fetchAvailableSlots, 
  bookInterviewSlot, 
  cancelCandidateBooking 
} from "./actions";

// Confetti burst on successful booking
const triggerCelebration = () => {
  if (typeof window === "undefined") return;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.2, y: 0.6 },
    colors: ["#8cc63f", "#25D366", "#facc15", "#38bdf8", "#ffffff"],
  });
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.8, y: 0.6 },
    colors: ["#8cc63f", "#25D366", "#facc15", "#38bdf8", "#ffffff"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#8cc63f", "#34d399", "#fbbf24", "#ffffff"],
    });
  }, 250);
};

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
  </svg>
);

function InterviewScheduleContent() {
  const searchParams = useSearchParams();

  // Step indicator: 1 = Verify, 2 = Dept/Div, 3 = Seating Slots, 4 = Booked/Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Candidate identity
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // Existing booking (if candidate already has one)
  const [existingBooking, setExistingBooking] = useState<any | null>(null);

  // Department & Division choice
  const [selectedDept, setSelectedDept] = useState<DepartmentConfig | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  // Seating Ticket Schedule
  const [selectedDateStr, setSelectedDateStr] = useState<string>(INTERVIEW_DATES[0].dateStr);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [agreedCheckbox, setAgreedCheckbox] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Cancel Booking Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingInProgress, setCancellingInProgress] = useState(false);

  // Pre-fill from query params if coming from Announcement check
  useEffect(() => {
    const qNim = searchParams.get("nim");
    const qEmail = searchParams.get("email");
    if (qNim) setNim(qNim);
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  // STEP 1: Verify Candidate
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || !email) return;

    setVerifying(true);
    setVerificationError("");

    try {
      const res = await verifyCandidateEligibility(nim, email);
      if (res.success && res.candidate) {
        setCandidateName(res.candidate.name);

        if (res.existingBooking) {
          // Candidate already has an active booking! Jump directly to Confirmed Ticket screen
          setExistingBooking(res.existingBooking);
          setCurrentStep(4);
        } else {
          // Proceed to Dept & Division selection
          setCurrentStep(2);
        }
      } else {
        setVerificationError(res.error || "Eligibility verification failed.");
      }
    } catch {
      setVerificationError("An unexpected error occurred. Please check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  // When Department is picked
  const handleSelectDepartment = (dept: DepartmentConfig) => {
    setSelectedDept(dept);
    if (dept.divisions.length === 0) {
      setSelectedDivision("");
    } else {
      setSelectedDivision(dept.divisions[0]);
    }
  };

  // STEP 2 -> STEP 3: Load available slots for chosen dept & division
  const handleProceedToSlots = async () => {
    if (!selectedDept) {
      toast.error("Please select your department");
      return;
    }

    setLoadingSlots(true);
    setSelectedSlot(null);
    setCurrentStep(3);

    try {
      const res = await fetchAvailableSlots(selectedDept.name, selectedDivision || null);
      if (res.success) {
        setAvailableSlots(res.data || []);
      } else {
        toast.error("Failed to load interview slots. Please try again.");
      }
    } catch {
      toast.error("Network error while loading slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Refresh slots when returning or changing dates
  const reloadSlots = async () => {
    if (!selectedDept) return;
    setLoadingSlots(true);
    try {
      const res = await fetchAvailableSlots(selectedDept.name, selectedDivision || null);
      if (res.success) {
        setAvailableSlots(res.data || []);
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  // Group available slots by date & time
  // Filter for the currently selected date tab
  const dateSlots = useMemo(() => {
    return availableSlots.filter((s) => s.slot_date === selectedDateStr);
  }, [availableSlots, selectedDateStr]);

  // Open confirmation modal for selected slot
  const handleInitiateBooking = () => {
    if (!selectedSlot) {
      toast.error("Please choose an available interview slot first.");
      return;
    }
    setAgreedCheckbox(false);
    setIsConfirmModalOpen(true);
  };

  // Submit final booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !agreedCheckbox) return;

    setBookingInProgress(true);
    try {
      const res = await bookInterviewSlot({
        slotId: selectedSlot.id,
        nim,
        email,
        name: candidateName,
      });

      if (res.success && res.booking) {
        setExistingBooking(res.booking);
        setIsConfirmModalOpen(false);
        setCurrentStep(4);
        setTimeout(() => {
          triggerCelebration();
        }, 150);
        toast.success("Interview schedule confirmed successfully!");
      } else {
        toast.error(res.error || "Failed to book slot. Please try another one.");
        reloadSlots();
        setIsConfirmModalOpen(false);
      }
    } catch {
      toast.error("Booking error occurred. Please try again.");
    } finally {
      setBookingInProgress(false);
    }
  };

  // Candidate cancels their booking
  const handleCancelBooking = async () => {
    if (!existingBooking) return;
    setCancellingInProgress(true);
    try {
      const res = await cancelCandidateBooking(existingBooking.id, nim);
      if (res.success) {
        toast.success("Your interview appointment has been cancelled. You may now pick a new schedule.");
        setExistingBooking(null);
        setSelectedSlot(null);
        setIsCancelModalOpen(false);
        setCurrentStep(2); // return to dept selection / slots
      } else {
        toast.error(res.error || "Failed to cancel booking.");
      }
    } catch {
      toast.error("Network error while cancelling.");
    } finally {
      setCancellingInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-[#ededed] font-sans selection:bg-[var(--color-primary)] selection:text-black flex flex-col items-center justify-center relative overflow-hidden py-14 px-4 sm:px-6 lg:px-8">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/180dc1.webp"
          alt="Become 180"
          fill
          className="object-cover object-center opacity-20 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/85 to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Top Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(140,198,63,0.15)]"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Batch 1 • Interview Schedule</span>
        </motion.div>

        {/* Step Progress Bar (Only during steps 1, 2, 3) */}
        {currentStep !== 4 && (
          <div className="flex items-center gap-3 mb-8 text-xs font-semibold">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 1
                  ? "bg-white text-black font-bold shadow-md"
                  : currentStep > 1
                  ? "text-primary bg-primary/15"
                  : "text-white/40"
              }`}
            >
              <span>1. Verify</span>
            </span>
            <span className="text-white/30">&rarr;</span>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 2
                  ? "bg-white text-black font-bold shadow-md"
                  : currentStep > 2
                  ? "text-primary bg-primary/15"
                  : "text-white/40"
              }`}
            >
              <span>2. Department</span>
            </span>
            <span className="text-white/30">&rarr;</span>
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                currentStep === 3
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/40"
              }`}
            >
              <span>3. Seating Ticket</span>
            </span>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 1: ELIGIBILITY VERIFICATION (Email & NIM)                   */}
        {/* ================================================================ */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-[var(--color-primary)] opacity-30 blur-xl" />

            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                Interview Schedule
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Exclusively for candidates who have passed the Batch 1 selection process. Please enter your NIM and Email to proceed.
              </p>
            </div>

            {verificationError && (
              <div className="mb-5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                  Student ID Number (NIM)
                </label>
                <input
                  type="text"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="e.g. 215150200111001"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] font-mono text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@student.ub.ac.id"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full mt-2 bg-[var(--color-primary)] text-black font-extrabold py-3.5 px-4 rounded-xl hover:bg-white transition-all shadow-[0_0_25px_rgba(140,198,63,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {verifying ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Verifying Eligibility...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Department Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/become"
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                &larr; Back to Become 180 Timeline
              </Link>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* STEP 2: DEPARTMENT & DIVISION SELECTION                          */}
        {/* ================================================================ */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl relative shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                  Candidate: <span className="text-white font-bold">{candidateName}</span> ({nim})
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  Select Your Department & Division
                </h2>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change ID</span>
              </button>
            </div>

            <p className="text-xs text-white/60 mb-6">
              Choose the department you applied for. If your department has specialized tracks/divisions, pick your assigned track below.
            </p>

            {/* Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept?.id === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectDepartment(dept)}
                    className={`relative text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)] shadow-[0_0_20px_rgba(140,198,63,0.25)]"
                        : "bg-black/30 border-white/10 hover:border-white/30 hover:bg-black/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="relative w-10 h-10 rounded-xl bg-white/5 p-1.5 flex items-center justify-center overflow-hidden border border-white/10">
                        <Image
                          src={dept.logo}
                          alt={dept.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">{dept.name}</h4>
                      <p className="text-[11px] text-white/50 mt-1">
                        {dept.divisions.length === 0
                          ? "General Track"
                          : `${dept.divisions.length} Divisions Available`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Division Picker (If selected dept has divisions) */}
            {selectedDept && selectedDept.divisions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/15"
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2.5">
                  Select Division for {selectedDept.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedDept.divisions.map((div) => {
                    const isDivSelected = selectedDivision === div;
                    return (
                      <button
                        key={div}
                        type="button"
                        onClick={() => setSelectedDivision(div)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isDivSelected
                            ? "bg-white text-black shadow-lg shadow-white/10 scale-105"
                            : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                        }`}
                      >
                        {isDivSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{div}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* CTA Button */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToSlots}
                disabled={!selectedDept}
                className="bg-[var(--color-primary)] text-black font-extrabold px-6 py-3 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(140,198,63,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <span>View Interview Timeslots</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* STEP 3: SEATING TICKET INTERVIEW TIME SLOTS                     */}
        {/* ================================================================ */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl relative shadow-2xl"
          >
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] font-bold uppercase tracking-wider mb-1">
                  <span>{selectedDept?.name}</span>
                  {selectedDivision && (
                    <>
                      <span>•</span>
                      <span className="text-white">{selectedDivision}</span>
                    </>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Choose Your Interview Slot
                </h2>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs text-white/50 hover:text-white flex items-center gap-1 self-end sm:self-auto transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Department</span>
              </button>
            </div>

            {/* Cinema / Seating Ticket Visual Stage Banner */}
            <div className="relative mb-6 text-center">
              <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-[var(--color-primary)]/80 to-transparent rounded-full blur-sm" />
              <div className="w-1/2 mx-auto h-0.5 bg-gradient-to-r from-transparent via-white/70 to-transparent mb-2" />
              <p className="text-[11px] font-mono text-white/40 tracking-[0.25em] uppercase font-bold">
                180DC UB Interview Panel Stage
              </p>
            </div>

            {/* Date Tabs (Thu 17 Sep - Thu 24 Sep) */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {INTERVIEW_DATES.map((dateObj) => {
                  const isActive = selectedDateStr === dateObj.dateStr;
                  const countForDate = availableSlots.filter(
                    (s) => s.slot_date === dateObj.dateStr
                  ).length;

                  return (
                    <button
                      key={dateObj.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDateStr(dateObj.dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`px-4 py-3 rounded-2xl transition-all shrink-0 flex flex-col items-center border ${
                        isActive
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-black shadow-[0_0_20px_rgba(140,198,63,0.35)] scale-105 font-bold"
                          : "bg-black/40 border-white/10 text-white/70 hover:bg-black/60 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wider opacity-80">
                        {dateObj.dayLabel}
                      </span>
                      <span className="text-base font-extrabold font-mono mt-0.5">
                        {dateObj.formattedLabel}
                      </span>
                      <span
                        className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-full font-mono ${
                          isActive
                            ? "bg-black/20 text-black font-bold"
                            : countForDate > 0
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {countForDate} avail
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2.5 px-4 rounded-xl bg-black/40 border border-white/10 mb-6 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500/70" />
                <span>Available Slot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-[var(--color-primary)] border border-white shadow-[0_0_10px_rgba(140,198,63,0.8)]" />
                <span className="text-white font-semibold">Your Selection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-md bg-white/5 border border-white/10 opacity-40" />
                <span className="text-white/40">No Interviewer / Booked</span>
              </div>
            </div>

            {/* Seating Ticket Matrix */}
            {loadingSlots ? (
              <div className="py-20 text-center text-white/60 flex flex-col items-center gap-3">
                <RotateCcw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                <p className="text-sm">Loading available interview slots...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                {TIME_SLOTS.map((slotConfig) => {
                  // Find all available slots for this time slot on current date
                  const matchingSlots = dateSlots.filter(
                    (s) => s.start_time === slotConfig.startTime
                  );
                  const isAvailable = matchingSlots.length > 0;
                  // If selected, check if this slotConfig is the chosen one
                  const isSelected = selectedSlot?.start_time === slotConfig.startTime;
                  // First matching slot to select
                  const targetSlot = matchingSlots[0];

                  return (
                    <button
                      key={slotConfig.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable && targetSlot) {
                          setSelectedSlot(targetSlot);
                        }
                      }}
                      className={`relative p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[90px] ${
                        isSelected
                          ? "bg-[var(--color-primary)] text-black border-white shadow-[0_0_25px_rgba(140,198,63,0.5)] scale-105 z-10"
                          : isAvailable
                          ? "bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-950/40 text-white cursor-pointer group"
                          : "bg-black/20 border-white/5 text-white/20 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {/* Ticket notches aesthetic */}
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-mono text-xs font-bold tracking-tight">
                          {slotConfig.label}
                        </span>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isAvailable ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-white/10" />
                        )}
                      </div>

                      {/* Panelist name / status */}
                      <div className="mt-2 text-[11px] leading-tight">
                        {isAvailable ? (
                          <>
                            <div className={isSelected ? "font-bold text-black" : "font-medium text-emerald-400 group-hover:text-white"}>
                              Interviewer: {targetSlot.panelist?.name || "Assigned"}
                            </div>
                            <div className={isSelected ? "text-black/70 text-[10px]" : "text-white/40 text-[10px]"}>
                              {matchingSlots.length} panel available
                            </div>
                          </>
                        ) : (
                          <span className="text-white/30 text-[10px]">Unavailable</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Bottom Summary Bar & Action Button */}
            <div className="bg-black/50 border border-white/15 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                    Selected Interview Slot:
                  </p>
                  {selectedSlot ? (
                    <p className="text-sm font-bold text-white">
                      {selectedSlot.slot_date} at {selectedSlot.start_time} - {selectedSlot.end_time}
                      <span className="text-[var(--color-primary)] font-normal ml-2">
                        with {selectedSlot.panelist?.name}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-white/40 italic">
                      Please click on an available time slot above to select.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleInitiateBooking}
                disabled={!selectedSlot}
                className="w-full sm:w-auto bg-[var(--color-primary)] text-black font-black px-8 py-3.5 rounded-xl hover:bg-white transition-all shadow-[0_0_25px_rgba(140,198,63,0.35)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shrink-0"
              >
                <span>Book This Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* STEP 4: SUCCESS / CONFIRMED TICKET VIEW                          */}
        {/* ================================================================ */}
        {currentStep === 4 && existingBooking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-[var(--color-primary)]/40 p-6 sm:p-8 rounded-3xl relative shadow-[0_0_50px_rgba(140,198,63,0.2)] text-center"
          >
            {/* Ambient celebration aura */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-primary)]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)]/30 via-[var(--color-primary)]/20 to-emerald-400/30 mb-5 border-2 border-[var(--color-primary)] shadow-[0_0_35px_rgba(140,198,63,0.4)]">
              <Sparkles className="h-10 w-10 text-[var(--color-primary)]" />
            </div>

            <h3 className="text-3xl font-black text-white tracking-tight mb-2">
              Interview Schedule Confirmed!
            </h3>
            <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
              Your interview appointment has been successfully scheduled. Please review your details and confirm with your interviewer.
            </p>

            {/* Ticket Card Details */}
            <div className="bg-black/50 border border-white/15 rounded-2xl p-5 mb-6 text-left relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    180DC UB Interview Ticket
                  </p>
                  <p className="text-base font-bold text-white">
                    {existingBooking.booked_by_name || candidateName}
                  </p>
                </div>
                <div className="text-right font-mono text-xs text-[var(--color-primary)] font-bold">
                  NIM: {existingBooking.booked_by_nim || nim}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-white/40 block text-[11px]">Department:</span>
                  <span className="font-semibold text-white">
                    {existingBooking.panelist?.department || selectedDept?.name}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px]">Division:</span>
                  <span className="font-semibold text-[var(--color-primary)]">
                    {existingBooking.panelist?.division || selectedDivision || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px]">Date:</span>
                  <span className="font-mono font-bold text-white">
                    {existingBooking.slot_date}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px]">Time Slot:</span>
                  <span className="font-mono font-bold text-[var(--color-primary)]">
                    {existingBooking.start_time} - {existingBooking.end_time}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/10">
                  <span className="text-white/40 block text-[11px]">Interviewer (Panelist):</span>
                  <span className="font-bold text-white text-sm">
                    {existingBooking.panelist?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* MANDATORY PROMPT REQUIREMENT:
                "Terus ada tulisan diatas nya kamu harus mengkonfirmasi kepada panelis {nama}."
                "Setelah itu akan ada seperti tombol yang akan mengarahkan ke wa.me/{nomor hp}."
            */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-emerald-950/40 border border-emerald-500/40 text-center">
              <p className="text-sm font-bold text-emerald-400 mb-3">
                You must confirm to panelist {existingBooking.panelist?.name}.
              </p>

              <a
                href={generateWhatsAppLink(
                  existingBooking.panelist?.phone_number || "",
                  existingBooking.panelist?.name || "",
                  existingBooking.booked_by_name || candidateName,
                  existingBooking.booked_by_nim || nim,
                  existingBooking.panelist?.department || selectedDept?.name || "",
                  existingBooking.panelist?.division || selectedDivision || null,
                  existingBooking.slot_date,
                  `${existingBooking.start_time} - ${existingBooking.end_time}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] via-[#20ba5a] to-[#128C7E] text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(37,211,102,0.45)] transition-all cursor-pointer text-sm transform hover:scale-[1.02]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Confirm on WhatsApp with {existingBooking.panelist?.name}</span>
              </a>
            </div>

            {/* Option to Cancel / Reschedule appointment */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
              <Link
                href="/become"
                className="text-white/50 hover:text-white transition-colors"
              >
                &larr; Back to Timeline
              </Link>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-destructive/80 hover:text-destructive hover:underline transition-colors"
              >
                Need to reschedule? Cancel this booking
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ================================================================ */}
      {/* CONFIRMATION POP-UP MODAL                                        */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isConfirmModalOpen && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-center text-white mb-2">
                Confirm Interview Schedule
              </h3>
              
              <div className="bg-white/5 rounded-2xl p-4 space-y-2 text-xs mb-5 border border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/50">Candidate:</span>
                  <span className="font-semibold text-white">{candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Department:</span>
                  <span className="font-medium text-white">{selectedDept?.name}</span>
                </div>
                {selectedDivision && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Division:</span>
                    <span className="font-medium text-[var(--color-primary)]">{selectedDivision}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/50">Interviewer:</span>
                  <span className="font-semibold text-white">{selectedSlot.panelist?.name}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-mono">
                  <span className="text-white/50">Schedule:</span>
                  <span className="font-bold text-[var(--color-primary)]">
                    {selectedSlot.slot_date} ({selectedSlot.start_time} - {selectedSlot.end_time})
                  </span>
                </div>
              </div>

              {/* Warning Text as requested in prompt */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed mb-5">
                <strong>Notice:</strong> This schedule cannot be changed once confirmed, except directly through your interviewer. Please make sure you are available on this date and time.
              </div>

              {/* Checkbox agreement */}
              <label className="flex items-start gap-3 cursor-pointer text-xs text-white/80 select-none mb-6">
                <input
                  type="checkbox"
                  checked={agreedCheckbox}
                  onChange={(e) => setAgreedCheckbox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 text-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-black/50"
                />
                <span>
                  I understand and agree that this interview schedule is final and cannot be altered.
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={bookingInProgress}
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={!agreedCheckbox || bookingInProgress}
                  onClick={handleConfirmBooking}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-black bg-[var(--color-primary)] text-black hover:bg-white transition-all shadow-md shadow-[var(--color-primary)]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingInProgress ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Locking Slot...</span>
                    </>
                  ) : (
                    <span>Confirm & Lock</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* CANCEL BOOKING MODAL                                             */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isCancelModalOpen && existingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-destructive/30 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto mb-4 border border-destructive/30">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-center text-white mb-2">
                Cancel Interview Schedule?
              </h3>
              <p className="text-xs text-white/60 text-center mb-5">
                Cancelling will release your reserved slot ({existingBooking.slot_date} at {existingBooking.start_time} - {existingBooking.end_time}) so other candidates can book it. You will be able to select a new slot.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={cancellingInProgress}
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  disabled={cancellingInProgress}
                  onClick={handleCancelBooking}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-destructive text-destructive-foreground hover:opacity-90 transition-all shadow-md shadow-destructive/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancellingInProgress ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Slot</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InterviewSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-white/50">
          <RotateCcw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <InterviewScheduleContent />
    </Suspense>
  );
}
