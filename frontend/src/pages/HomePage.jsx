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
  UserCheck, 
  Cpu, 
  Layers, 
  FileCheck,
  Building2,
  Lock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-6 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deterministic Multi-Attribute Eligibility Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Discover Government Schemes tailored to your <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">exact profile</span>.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            An explainable, uncertainty-aware system designed for Indian citizens. Evaluates age, income, state residency, occupation, education, and special categories with transparent rule evaluation and official government portal links.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/recommendations"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 flex items-center space-x-2 transition cursor-pointer"
            >
              <span>Get Recommendations</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/schemes"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center space-x-2 transition cursor-pointer"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span>Browse All Schemes</span>
            </Link>
          </div>

          {/* Quick System Stats */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-800 text-xs font-mono text-slate-400">
            <div>
              <span className="text-xl font-bold text-white font-sans block">15+</span>
              <span>Authoritative Schemes</span>
            </div>
            <div>
              <span className="text-xl font-bold text-emerald-400 font-sans block">100%</span>
              <span>Deterministic Logic</span>
            </div>
            <div>
              <span className="text-xl font-bold text-indigo-400 font-sans block">3-Tier</span>
              <span>Uncertainty Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            How The System Works
          </h2>
          <p className="text-slate-400 text-sm">
            Three simple steps to evaluate eligibility without black-box AI approximations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-bold">
              1
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Fill User Profile</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enter demographic details such as age, state residency, annual household income, occupation, and educational status.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg font-bold">
              2
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Deterministic Evaluation</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              The eligibility engine runs strict mathematical boundary and rule tests against verified scheme criteria stored in MongoDB Atlas.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
              3
            </div>
            <h3 className="font-semibold text-slate-100 text-base">Ranked & Explained Results</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Receive ranked recommendations categorized into 3 eligibility states, complete with transparent rule explanations and document requirements.
            </p>
          </div>
        </div>
      </section>

      {/* The 3 Eligibility States Highlight (Requirement #1) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Core Research Innovation</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            The Three Deterministic Eligibility States
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
            Unlike probabilistic systems that generate arbitrary percentages, our system models missing profile data as explicit uncertainty:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* State 1: Eligible */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="font-bold text-base text-emerald-300">1. ELIGIBLE</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All required scheme eligibility criteria are satisfied by your profile. A deterministic match score is computed for transparent ranking.
            </p>
            <div className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 p-2 rounded border border-emerald-500/20">
              Outcome: Tier 1 Recommendation (Score: Calculated)
            </div>
          </div>

          {/* State 2: Insufficient Information */}
          <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <HelpCircle className="h-6 w-6" />
              <h3 className="font-bold text-base text-amber-300">2. INSUFFICIENT INFO</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              One or more required fields (e.g. income or age) are missing from your profile. Prevents misleading false positives.
            </p>
            <div className="text-[11px] font-mono text-amber-400/80 bg-amber-950/40 p-2 rounded border border-amber-500/20">
              Outcome: Tier 2 Alert (match_score = null)
            </div>
          </div>

          {/* State 3: Not Eligible */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <XCircle className="h-6 w-6" />
              <h3 className="font-bold text-base text-rose-300">3. NOT ELIGIBLE</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              At least one mandatory condition (such as state restriction or income limit) failed. Failed conditions are clearly explained.
            </p>
            <div className="text-[11px] font-mono text-rose-400/80 bg-rose-950/40 p-2 rounded border border-rose-500/20">
              Outcome: Tier 3 (Never presented as recommendation)
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-white">Ready to check your scheme eligibility?</h3>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
          Create an account or test instantly as a guest to find government welfare benefits, scholarships, and financial assistance.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/recommendations"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/30"
          >
            Start Eligibility Check
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
