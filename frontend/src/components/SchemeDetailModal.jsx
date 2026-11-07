import React from 'react';
import { 
  X, 
  Building2, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Award, 
  Globe, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  DollarSign, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';

export default function SchemeDetailModal({ scheme, onClose }) {
  if (!scheme) return null;

  const {
    name,
    description,
    category = [],
    government = {},
    eligibility = {},
    benefits = [],
    documents = [],
    application = {},
    source = {},
    status = 'active',
  } = scheme;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl shadow-xl overflow-hidden my-8 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAECE4] dark:border-[#2D3A32] bg-[#F7F7F2] dark:bg-[#151B18] flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                government.level === 'central'
                  ? 'bg-[#245B48]/10 text-[#245B48] dark:bg-emerald-500/10 dark:text-emerald-400 border border-[#245B48]/20 dark:border-emerald-500/20'
                  : 'bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37] border border-[#C49A50]/30'
              }`}>
                {government.level || 'Central'} Scheme
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'active' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-[#ECEEE6] dark:bg-[#151B18] text-[#556960] dark:text-[#A1B0A6] border border-[#D8DBD0] dark:border-[#2D3A32]'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#202C27] dark:text-[#F3F0E7] tracking-tight">
              {name}
            </h2>

            {government.department && (
              <p className="text-xs text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-[#88988E]" />
                {government.department}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#556960] hover:text-[#202C27] dark:text-[#A1B0A6] dark:hover:text-white hover:bg-[#EAECE4] dark:hover:bg-[#2A362E] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-[#202C27] dark:text-[#F3F0E7]">
          {/* Category Badges */}
          {category.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {category.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F7F2] dark:bg-[#151B18] border border-[#E3E5DC] dark:border-[#2D3A32] text-[#556960] dark:text-[#A1B0A6] text-xs font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#556960] dark:text-[#A1B0A6]">
              Overview & Objectives
            </h3>
            <p className="leading-relaxed bg-[#F7F7F2] dark:bg-[#151B18] p-4 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] text-xs sm:text-sm text-[#202C27] dark:text-[#F3F0E7]">
              {description}
            </p>
          </div>

          {/* Eligibility Requirements Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> Standardized Eligibility Rules
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Age */}
              <div className="p-3 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-[#245B48] dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px]">Age Limit</p>
                  <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                    {eligibility.age?.min != null || eligibility.age?.max != null
                      ? `${eligibility.age?.min ?? 'Min 0'} - ${eligibility.age?.max ?? 'No Max'} years`
                      : 'No specific age limit'}
                  </p>
                </div>
              </div>

              {/* Income */}
              <div className="p-3 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-[#245B48] dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px]">Annual Income Limit</p>
                  <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                    {eligibility.income?.max != null
                      ? `Up to ₹${Number(eligibility.income.max).toLocaleString('en-IN')} / year`
                      : 'No income ceiling specified'}
                  </p>
                </div>
              </div>

              {/* States */}
              <div className="p-3 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#C49A50] flex-shrink-0" />
                <div>
                  <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px]">Applicable States</p>
                  <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                    {Array.isArray(eligibility.states) && eligibility.states.length > 0
                      ? eligibility.states.join(', ')
                      : 'All States & UTs (Pan-India)'}
                  </p>
                </div>
              </div>

              {/* Occupations */}
              <div className="p-3 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-[#8E6E32] dark:text-[#D4AF37] flex-shrink-0" />
                <div>
                  <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px]">Target Occupations</p>
                  <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                    {Array.isArray(eligibility.occupations) && eligibility.occupations.length > 0
                      ? eligibility.occupations.join(', ')
                      : 'Any occupation'}
                  </p>
                </div>
              </div>

              {/* Education */}
              <div className="p-3 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-[#245B48] dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px]">Education Qualification</p>
                  <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                    {Array.isArray(eligibility.education) && eligibility.education.length > 0
                      ? eligibility.education.join(', ')
                      : 'Any education level'}
                  </p>
                </div>
              </div>

              {/* Special Flags */}
              <div className="p-3 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-3">
                <Award className="h-4 w-4 text-[#C49A50] flex-shrink-0" />
                <div>
                  <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px]">Special Criteria</p>
                  <p className="font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                    {[
                      eligibility.is_student_required ? 'Students Only' : null,
                      eligibility.is_farmer_required ? 'Farmers Only' : null,
                      eligibility.is_disabled_required ? 'PWD / Disabled' : null,
                    ].filter(Boolean).join(', ') || 'Standard citizen profile'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          {Array.isArray(benefits) && benefits.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> Scheme Benefits
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm bg-[#F7F7F2] dark:bg-[#151B18] p-2.5 rounded-lg border border-[#E3E5DC] dark:border-[#2D3A32]">
                    <CheckCircle2 className="h-4 w-4 text-[#245B48] dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[#202C27] dark:text-[#F3F0E7]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Documents */}
          {Array.isArray(documents) && documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> Required Documents Checklist
              </h3>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F2] dark:bg-[#151B18] border border-[#E3E5DC] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs font-mono"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#245B48] dark:text-emerald-400" />
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Instructions */}
          {application && (application.method || (application.steps && application.steps.length > 0)) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> Application Method & Steps ({application.method || 'Online'})
              </h3>
              {application.steps && application.steps.length > 0 ? (
                <ol className="space-y-2">
                  {application.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs bg-[#F7F7F2] dark:bg-[#151B18] p-3 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32]">
                      <span className="h-5 w-5 rounded-full bg-[#245B48]/15 dark:bg-emerald-500/20 text-[#245B48] dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-[#202C27] dark:text-[#F3F0E7] pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-[#556960] dark:text-[#A1B0A6] italic">Follow instructions on the official portal.</p>
              )}
            </div>
          )}

          {/* Authoritative Source Information */}
          <div className="p-4 bg-[#F7F7F2] dark:bg-[#151B18] rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> Authoritative Source & Verification
              </p>
              <p className="text-[#202C27] dark:text-[#F3F0E7] font-mono text-[11px]">
                Department: {source.department || government.department || 'Government of India'}
              </p>
              {source.last_verified && (
                <p className="text-[#556960] dark:text-[#A1B0A6] text-[11px] flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3 text-[#88988E]" /> Last Verified: {source.last_verified}
                </p>
              )}
            </div>

            {application.official_url && (
              <a
                href={application.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <span>Official Application Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 border-t border-[#EAECE4] dark:border-[#2D3A32] bg-[#F7F7F2] dark:bg-[#151B18] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#202923] hover:bg-[#ECEEE6] dark:hover:bg-[#2A362E] text-[#202C27] dark:text-[#F3F0E7] border border-[#D8DBD0] dark:border-[#2D3A32] text-xs font-medium transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
