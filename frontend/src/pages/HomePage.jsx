import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  ArrowRight, 
  Layers, 
  FileCheck,
  Building2,
  Lock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 py-6 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] p-6 sm:p-12 shadow-sm transition-colors">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245B48]/10 dark:bg-emerald-500/10 text-[#245B48] dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#C49A50]" />
            <span>Deterministic Multi-Attribute Eligibility Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#202C27] dark:text-[#F3F0E7] tracking-tight leading-tight">
            Discover Government Schemes tailored to your <span className="text-[#245B48] dark:text-emerald-400">exact citizen profile</span>.
          </h1>

          <p className="text-[#556960] dark:text-[#A1B0A6] text-sm sm:text-base leading-relaxed">
            An explainable, uncertainty-aware GovTech recommendation platform for Indian citizens. Evaluates age, income, state residency, occupation, education, and social categories against verified central and state schemes with transparent rule evaluation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/recommendations"
              className="px-6 py-3 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm flex items-center space-x-2 transition cursor-pointer"
            >
              <span>Get Recommendations</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/schemes"
              className="px-6 py-3 rounded-xl bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] border border-[#D8DBD0] dark:border-[#2D3A32] font-semibold text-sm flex items-center space-x-2 transition cursor-pointer"
            >
              <Search className="h-4 w-4 text-[#88988E]" />
              <span>Browse All Schemes</span>
            </Link>
          </div>

          {/* Quick System Stats */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#EAECE4] dark:border-[#2D3A32] text-xs font-medium text-[#556960] dark:text-[#A1B0A6]">
            <div>
              <span className="text-2xl font-bold text-[#202C27] dark:text-[#F3F0E7] block">4,700+</span>
              <span>Authoritative Schemes</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#245B48] dark:text-emerald-400 block">100%</span>
              <span>Deterministic Rules</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#C49A50] block">3-Tier</span>
              <span>Uncertainty Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202C27] dark:text-[#F3F0E7] tracking-tight">
            How The System Works
          </h2>
          <p className="text-[#556960] dark:text-[#A1B0A6] text-sm">
            Three simple steps to evaluate eligibility without black-box approximations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-6 space-y-3.5 shadow-sm transition">
            <div className="h-10 w-10 rounded-xl bg-[#245B48]/10 text-[#245B48] dark:text-emerald-400 flex items-center justify-center text-base font-bold">
              1
            </div>
            <h3 className="font-bold text-[#202C27] dark:text-[#F3F0E7] text-base">Provide Citizen Profile</h3>
            <p className="text-[#556960] dark:text-[#A1B0A6] text-xs leading-relaxed">
              Enter demographic details such as age, state residency, annual household income, occupation, and educational status.
            </p>
          </div>

          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-6 space-y-3.5 shadow-sm transition">
            <div className="h-10 w-10 rounded-xl bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37] flex items-center justify-center text-base font-bold">
              2
            </div>
            <h3 className="font-bold text-[#202C27] dark:text-[#F3F0E7] text-base">Deterministic Evaluation</h3>
            <p className="text-[#556960] dark:text-[#A1B0A6] text-xs leading-relaxed">
              The eligibility engine runs strict mathematical boundary and rule tests against verified scheme criteria stored in MongoDB.
            </p>
          </div>

          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-6 space-y-3.5 shadow-sm transition">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-base font-bold">
              3
            </div>
            <h3 className="font-bold text-[#202C27] dark:text-[#F3F0E7] text-base">Ranked & Explained Results</h3>
            <p className="text-[#556960] dark:text-[#A1B0A6] text-xs leading-relaxed">
              Receive ranked recommendations categorized into 3 eligibility states, complete with transparent explanations and direct portal links.
            </p>
          </div>
        </div>
      </section>

      {/* The 3 Eligibility States Highlight */}
      <section className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#245B48] dark:text-emerald-400">Core Evaluation Model</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202C27] dark:text-[#F3F0E7] tracking-tight">
            The Three Deterministic Eligibility States
          </h2>
          <p className="text-[#556960] dark:text-[#A1B0A6] text-xs sm:text-sm max-w-3xl">
            Unlike probabilistic systems that generate arbitrary percentages, our system models missing profile data as explicit uncertainty:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* State 1: Eligible */}
          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base">1. ELIGIBLE</h3>
            </div>
            <p className="text-xs text-[#556960] dark:text-[#A1B0A6] leading-relaxed">
              All required scheme eligibility criteria are satisfied by your profile. A deterministic match score is computed for transparent ranking.
            </p>
            <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-white dark:bg-[#151B18] p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              Outcome: Tier 1 (Score: Calculated)
            </div>
          </div>

          {/* State 2: Insufficient Information */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
              <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-base">2. INSUFFICIENT INFO</h3>
            </div>
            <p className="text-xs text-[#556960] dark:text-[#A1B0A6] leading-relaxed">
              One or more required fields (e.g. income or age) are missing from your profile. Prevents misleading false positives.
            </p>
            <div className="text-[11px] font-mono text-amber-800 dark:text-amber-300 bg-white dark:bg-[#151B18] p-2 rounded-lg border border-amber-200 dark:border-amber-800/50">
              Outcome: Tier 2 (Score: Data Needed)
            </div>
          </div>

          {/* State 3: Not Eligible */}
          <div className="p-5 sm:p-6 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-3">
            <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300">
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-base">3. NOT ELIGIBLE</h3>
            </div>
            <p className="text-xs text-[#556960] dark:text-[#A1B0A6] leading-relaxed">
              At least one mandatory condition (such as state restriction or income limit) failed. Failed conditions are clearly explained.
            </p>
            <div className="text-[11px] font-mono text-rose-800 dark:text-rose-300 bg-white dark:bg-[#151B18] p-2 rounded-lg border border-rose-200 dark:border-rose-800/50">
              Outcome: Tier 3 (Ineligible)
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-3xl bg-[#245B48] text-white p-6 sm:p-10 text-center space-y-4 shadow-sm">
        <h3 className="text-xl sm:text-2xl font-bold">Ready to check your scheme eligibility?</h3>
        <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto">
          Create an account or test instantly as a guest to find government welfare benefits, scholarships, and financial assistance.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            to="/recommendations"
            className="px-6 py-2.5 rounded-xl bg-white text-[#245B48] hover:bg-[#F7F7F2] font-semibold text-xs transition shadow-sm"
          >
            Start Eligibility Check
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl bg-[#1B4637] hover:bg-[#14352a] text-white border border-white/20 font-semibold text-xs transition"
          >
            Create Citizen Account
          </Link>
        </div>
      </section>
    </div>
  );
}
