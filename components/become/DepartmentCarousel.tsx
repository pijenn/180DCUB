'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, CheckCircle2, Award, Briefcase, Sparkles } from 'lucide-react';

interface SubSection {
  title?: string;
  items: string[];
}

interface Department {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  accentColor: string;
  glowColor: string;
  description: string;
  responsibilities: SubSection[];
  qualifications: SubSection[];
}

const DEPARTMENTS: Department[] = [
  {
    id: 'hr',
    name: 'Human Resources',
    shortName: 'HR',
    logo: '/assets/logodept/hr.png',
    accentColor: '#8CC63F',
    glowColor: 'rgba(140, 198, 63, 0.45)',
    description:
      'Human Resources (HR) Department is responsible for managing the internal well-being, tracking performances, and connecting all members at 180 Degrees Consulting Universitas Brawijaya. We strive to ensure that each member thrives both professionally and personally during their journey in the organization.',
    responsibilities: [
      {
        items: [
          'Prepare individual and departmental performance reports in a structured framework',
          'Manage management by objective (MBO)',
          'Support Human Resources Programs',
        ],
      },
    ],
    qualifications: [
      {
        items: [
          'Strong analytical skills with the ability to process, validate, and interpret performance data',
          'Detail-oriented and highly organized, especially in handling reports and documentation',
          'Comfortable working with tracking systems, spreadsheets, and reporting tools',
          'Able to work objectively and consistently in monitoring performance and quality standards',
        ],
      },
    ],
  },
  {
    id: 'lnf',
    name: 'Legal and Finance',
    shortName: 'L&F',
    logo: '/assets/logodept/lnf.png',
    accentColor: '#8CC63F',
    glowColor: 'rgba(140, 198, 63, 0.45)',
    description:
      "The Legal Department safeguards the organization's legal interests through contract administration, regulatory compliance, policy development, and governance. The Finance Department manages financial operations through budgeting, financial reporting, cash flow administration, reimbursement processes, and internal financial control.",
    responsibilities: [
      {
        title: 'Legal',
        items: [
          'Support the preparation and organization of legal documents, including MoUs, agreements, and partnership files',
          "Assist in maintaining legal documentation, compliance records, and department document archive",
          'Conduct preliminary reviews of legal documents for formatting consistency and completeness',
          'Monitor the validity and completeness of legal and administrative documents',
          'Collaborate in legal research, policy updates, and governance initiatives',
        ],
      },
      {
        title: 'Finance',
        items: [
          'Support daily financial operations, including reimbursements, budgeting, and expense records',
          'Prepare financial data and supporting documents for periodic financial reports',
          'Assist in maintaining accurate financial records and organizing accounting documentation',
          'Monitor budget utilization and help reconcile financial transactions',
          'Collaborate in financial planning, internal control activities, and process improvement',
        ],
      },
    ],
    qualifications: [
      {
        title: 'Legal',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya (Law students preferred)',
          'Strong attention to detail in reviewing documents and managing administrative records',
          'Basic proficiency in Google Workspace; familiarity with legal documentation tools is a plus',
          'Interest in legal compliance, contract administration, and organizational governance',
          'Effective communication, collaborative mindset, and high confidentiality standards',
        ],
      },
      {
        title: 'Finance',
        items: [
          'Active student (Batch 2025–2026) (Business, Accounting, Finance, Statistics, Actuarial preferred)',
          'Basic proficiency in Microsoft Excel and Google Sheets for financial administration',
          'Strong numerical, analytical, and problem-solving skills',
          'Interest in financial management, budgeting, and financial reporting',
          'High accuracy, accountability, and integrity in handling financial information',
        ],
      },
    ],
  },
  {
    id: 'mkt',
    name: 'Marketing',
    shortName: 'Marketing',
    logo: '/assets/logodept/mkt.png',
    accentColor: '#8CC63F',
    glowColor: 'rgba(140, 198, 63, 0.45)',
    description:
      'Marketing plays a key role in shaping and strengthening the organization’s brand as a student-led consulting organization. Through consistent and strategic branding, marketing elevates 180DC UB’s professional image and expands audience engagement through dynamic social media presence.',
    responsibilities: [
      {
        title: 'Creative (Graphic Design & Motion)',
        items: [
          'Graphic Design: Produce designs for social media and promotional materials aligned with brand identity',
          'Motion: Create high-quality video content for Instagram Reels and TikTok platforms',
          'Collaborate with Brand & Communication to conceptualize, storyboard, shoot, and edit visual content',
        ],
      },
      {
        title: 'Brand Communication',
        items: [
          'Maintain 180DC’s brand identity consistently across all digital platforms',
          'Develop and organize content calendars to ensure clear and regular communication',
          'Track audience engagement and analyze social media metrics',
          'Create compelling copywriting for social media feeds and promotional campaigns',
        ],
      },
    ],
    qualifications: [
      {
        title: 'Creative (Design & Motion)',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Graphic: Proficiency in Figma (required), Adobe Photoshop or Illustrator is preferred',
          'Motion: Proficiency in CapCut (required), VN, Adobe Premiere, or mobile editing tools',
          'Updated on TikTok/Reels trends, viral challenges, and creative storytelling',
          'Portfolio submission showcasing past creative works',
        ],
      },
      {
        title: 'Brand Communication',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Strong copywriting, storytelling, and digital marketing capabilities',
          'Ability to analyze audience metrics and social media performance',
          'Proactive, creative, and collaborative team player',
        ],
      },
    ],
  },
  {
    id: 'cons',
    name: 'Consulting',
    shortName: 'Consulting',
    logo: '/assets/logodept/cons.png',
    accentColor: '#8CC63F',
    glowColor: 'rgba(140, 198, 63, 0.45)',
    description:
      'The Consulting Department delivers strategic consulting services to startups, SMEs, non-profit organizations, and corporate clients. As a Junior Analyst, you will work within a project team to conduct research, formulate data-driven recommendations, and deliver impactful solutions for real-world clients.',
    responsibilities: [
      {
        items: [
          'Support consulting projects through structured business analysis and research',
          'Conduct comprehensive market research, benchmarking, and data collection',
          'Assist in preparing professional client presentations and final deliverables',
          'Support problem-solving by extracting insights and analyzing data',
          'Collaborate actively in internal team meetings, problem-solving sessions, and client presentations',
        ],
      },
    ],
    qualifications: [
      {
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Strong analytical, logical, and structured problem-solving skills',
          'Attention to detail in quantitative and qualitative data analysis',
          'Ability to collaborate effectively in fast-paced project teams',
          'Eagerness to learn consulting frameworks and adapt to diverse client industries',
          '(Preferred) Experience in business case competitions, research, or project initiatives',
        ],
      },
    ],
  },
  {
    id: 'ca',
    name: 'Client Acquisition',
    shortName: 'Client Acquisition',
    logo: '/assets/logodept/ca.png',
    accentColor: '#8CC63F',
    glowColor: 'rgba(140, 198, 63, 0.45)',
    description:
      'Client Acquisition Department is responsible for building strategic partnerships, maintaining strong client relationships, and promoting knowledge development. The department secures high-impact consulting clients and delivers industry research publications and business insights.',
    responsibilities: [
      {
        title: 'Knowledge Team',
        items: [
          'Conduct deep-dive research on economic, industry, and strategic business developments',
          'Analyze and synthesize insights into biweekly research publications',
          'Develop monthly business newspapers and verify credibility of research sources',
          'Present structured findings to drive knowledge sharing across the organization',
        ],
      },
      {
        title: 'Client Relation',
        items: [
          'Identify and approach potential clients for consulting engagements and partnerships',
          'Build, manage, and sustain long-term client and partner relationships',
          'Pitch and negotiate partnership opportunities with external organizations',
          'Ensure seamless client communications and coordination across project lifecycles',
        ],
      },
    ],
    qualifications: [
      {
        title: 'Knowledge Team',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Strong analytical and research synthesis capabilities with credible sourcing',
          'Excellent written communication for engaging, clear publications',
          'High curiosity in business, macroeconomics, and consulting trends',
          'Previous writing, academic research, or case competition experience is a plus',
        ],
      },
      {
        title: 'Client Relation',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Strong communication, interpersonal, and negotiation capabilities',
          'Confidence in pitching proposals and engaging external stakeholders',
          'Proactive, goal-oriented, and comfortable reaching out to partners',
          'Intermediate to fluent in English; BD/sales experience is a plus',
        ],
      },
    ],
  },
  {
    id: 'sng',
    name: 'Strategy and Growth',
    shortName: 'Strategy & Growth',
    logo: '/assets/logodept/sng.png',
    accentColor: '#8CC63F',
    glowColor: 'rgba(140, 198, 63, 0.45)',
    description:
      'The Strategy and Growth Department is responsible for designing, developing, and scaling impactful programs and commercial products within the organization. S&G translates market opportunities and user needs into structured initiatives, frameworks, and strategic products that drive long-term growth.',
    responsibilities: [
      {
        title: 'Program',
        items: [
          'Analyze strategic goals across Consulting, Career, and Social Impact initiatives',
          'Structure program timelines, manpower allocations, dependencies, budgets, and risk mitigation',
          'Coordinate cross-functionally with HR, Marketing, Finance & Legal',
          'Track and analyze program performance, engagement metrics, and impact indicators',
        ],
      },
      {
        title: 'Product',
        items: [
          'Drive product development by translating user requirements into actionable product features',
          'Create high-standard presentation decks, product guidelines, and casebook materials',
          'Execute quality control and manage mentor/professional outsourcing operations',
          'Monitor product sales, marketing feedback, and iterate product features',
        ],
      },
    ],
    qualifications: [
      {
        title: 'Program',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Strong interest in program architecture, strategy, and organizational growth',
          'Proficiency with structured frameworks, planning tools, and data tracking',
          'Clear communicator in English and Bahasa Indonesia',
        ],
      },
      {
        title: 'Product',
        items: [
          'Active student (Batch 2025–2026) at Universitas Brawijaya from any major',
          'Strong analytical mindset to productize user needs into market solutions',
          'High curiosity for consulting tools, casebooks, and digital product planning',
          'Comfortable with ambiguity and building products from 0 to 1',
        ],
      },
    ],
  },
];

const AUTOPLAY_DURATION = 15000; // 15 seconds

export function DepartmentCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentDept = DEPARTMENTS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DEPARTMENTS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DEPARTMENTS.length) % DEPARTMENTS.length);
    setProgress(0);
  };

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  // Progress and Autoplay timer
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const stepMs = 100;
    const increment = (stepMs / AUTOPLAY_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, AUTOPLAY_DURATION);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  return (
    <section
      className="relative w-full py-28 px-4 sm:px-6 lg:px-8 bg-background border-t border-white/10 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-20 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: currentDept.accentColor }}
      />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs md:text-sm tracking-[0.3em] uppercase font-bold text-[var(--color-primary)]">
                Our Department
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              Explore Our Divisions.
            </h2>
            <p className="text-base md:text-lg text-white/50 font-light mt-3 max-w-2xl">
              Discover the distinct roles, responsibilities, and key competencies across our 6 departments.
            </p>
          </div>

          {/* Controls: Navigation Buttons & Pause Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title={isPaused ? "Resume Auto-cycle" : "Pause Auto-cycle"}
              aria-label={isPaused ? "Resume Auto-cycle" : "Pause Auto-cycle"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrev}
              className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white hover:text-[var(--color-primary)] transition-all hover:scale-105"
              aria-label="Previous Department"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white hover:text-[var(--color-primary)] transition-all hover:scale-105"
              aria-label="Next Department"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Department Selection Tabs & Progress Bar */}
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {DEPARTMENTS.map((dept, index) => {
              const isSelected = index === currentIndex;
              return (
                <button
                  key={dept.id}
                  onClick={() => handleSelect(index)}
                  className={`relative px-4 py-3.5 rounded-2xl text-left transition-all duration-300 border overflow-hidden group ${isSelected
                      ? 'bg-white/10 border-[var(--color-primary)]/60 text-white shadow-[0_0_20px_rgba(140,198,63,0.15)]'
                      : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider truncate">
                      {dept.shortName}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[var(--color-primary)] transition-all duration-100 ease-linear"
                      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Display Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card/40 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* Left Column: Logo & Department Title Banner */}
              <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 lg:border-r lg:border-white/10 lg:pr-8">

                {/* Logo with Glow Effect */}
                <div className="relative group w-44 h-44 sm:w-56 sm:h-56 rounded-3xl flex items-center justify-center p-6 bg-black/40 border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  {/* Atmospheric radial glow */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-70 blur-2xl transition-all duration-700 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${currentDept.glowColor} 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative w-full h-full flex items-center justify-center z-10 transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={currentDept.logo}
                      alt={currentDept.name}
                      width={200}
                      height={200}
                      className="object-contain max-h-full max-w-full drop-shadow-[0_0_25px_rgba(140,198,63,0.5)]"
                      priority
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {currentDept.name}
                  </h3>
                </div>

                <div className="w-full pt-4 border-t border-white/10 text-xs text-white/40 flex items-center justify-between">
                </div>
              </div>

              {/* Right Column: Description, Responsibilities & Qualifications */}
              <div className="lg:col-span-8 flex flex-col space-y-8">

                {/* Department Description */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-7">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 block">
                    Description
                  </span>
                  <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed whitespace-pre-line">
                    {currentDept.description}
                  </p>
                </div>

                {/* Grid for Responsibility and Qualification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

                  {/* Responsibilities Column */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                      <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        Responsibilities
                      </h4>
                    </div>

                    <div className="space-y-5 text-sm text-white/70 font-light leading-relaxed">
                      {currentDept.responsibilities.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2.5">
                          {sub.title && (
                            <span className="inline-block text-xs font-bold tracking-wider text-white uppercase bg-white/10 px-2.5 py-1 rounded-md">
                              {sub.title}
                            </span>
                          )}
                          <ul className="space-y-2.5">
                            {sub.items.map((item, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications Column */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                      <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        Qualifications
                      </h4>
                    </div>

                    <div className="space-y-5 text-sm text-white/70 font-light leading-relaxed">
                      {currentDept.qualifications.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-2.5">
                          {sub.title && (
                            <span className="inline-block text-xs font-bold tracking-wider text-white uppercase bg-white/10 px-2.5 py-1 rounded-md">
                              {sub.title}
                            </span>
                          )}
                          <ul className="space-y-2.5">
                            {sub.items.map((item, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
