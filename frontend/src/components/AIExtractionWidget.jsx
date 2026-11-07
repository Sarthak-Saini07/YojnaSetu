import React, { useState } from 'react';
import api from '../api/axios';
import { 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Edit3 
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  "I'm 21 years old, live in Punjab, studying BTech and my family income is 2.5 lakh.",
  "I am a 25 year old farmer living in Haryana with annual income of 1.5 lakh.",
  "I am 30 years old, living in Delhi, unemployed with no formal education."
];

export default function AIExtractionWidget({ onProfileExtracted }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const handleExtract = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || text.trim().length < 3) {
      setError('Please enter a natural-language description of at least 3 characters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/parse-profile', { text: text.trim() });
      setExtractedData(res.data);
    } catch (err) {
      console.error('AI Profile Extraction failed:', err);
      setError(err.response?.data?.detail || 'AI Extraction Service unavailable. Please fill profile fields manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySample = (sample) => {
    setText(sample);
  };

  const handleConfirmAndApply = () => {
    if (extractedData?.extracted_profile && onProfileExtracted) {
      onProfileExtracted(extractedData.extracted_profile);
    }
  };

  return (
    <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#EAECE4] dark:border-[#2D3A32]">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#245B48]/10 dark:bg-emerald-500/10 text-[#245B48] dark:text-emerald-400 border border-[#245B48]/20 dark:border-emerald-500/20 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[#202C27] dark:text-[#F3F0E7] text-sm flex items-center gap-2">
              <span>AI-Assisted Natural Language Profile Extraction</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#C49A50]/15 text-[#8E6E32] dark:text-[#D4AF37] font-medium border border-[#C49A50]/30">
                Optional Assistant
              </span>
            </h3>
            <p className="text-[11px] text-[#556960] dark:text-[#A1B0A6]">
              Type your profile in plain English. AI extracts demographic fields into structured data for your review.
            </p>
          </div>
        </div>

        {/* Disclaimer Badge */}
        <span className="text-[11px] text-[#556960] dark:text-[#A1B0A6] bg-[#F7F7F2] dark:bg-[#151B18] px-2.5 py-1 rounded-md border border-[#E3E5DC] dark:border-[#2D3A32] flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-[#245B48] dark:text-emerald-400" />
          Deterministic Rules Make Final Decision
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleExtract} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#202C27] dark:text-[#F3F0E7]">
            Describe your demographics in your own words:
          </label>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., I'm a 21-year-old student living in Punjab with an annual family income of ₹2.5 lakh..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition resize-none placeholder:text-[#88988E] dark:placeholder:text-[#68776D]"
          />
        </div>

        {/* Sample Prompt Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-[#556960] dark:text-[#A1B0A6] font-medium">Try Sample:</span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(prompt)}
              className="px-2.5 py-1 rounded-lg bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] transition text-[11px] truncate max-w-[280px] cursor-pointer"
            >
              "{prompt.slice(0, 36)}..."
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-4 py-2 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Extracting Profile...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                <span>Extract Profile with AI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Profile Review & Confirm Box */}
      {extractedData && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] space-y-3.5 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E5DC] dark:border-[#2D3A32]">
            <h4 className="font-semibold text-xs text-[#245B48] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Review Extracted Profile (Provider: {extractedData.ai_provider_used})
            </h4>
            <span className="text-[11px] text-[#556960] dark:text-[#A1B0A6]">
              Extracted {extractedData.extracted_fields_count} fields
            </span>
          </div>

          {/* Transparent Confidence & Unresolved Fields Summary */}
          <p className="text-xs text-[#556960] dark:text-[#A1B0A6] leading-relaxed bg-white dark:bg-[#202923] p-3 rounded-lg border border-[#E3E5DC] dark:border-[#2D3A32]">
            {extractedData.confidence_notes}
          </p>

          {/* Extracted Fields Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#556960] dark:text-[#A1B0A6] block uppercase tracking-wider">
              Parsed Values to be Transferred to Form:
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(extractedData.extracted_profile).map(([key, val]) => {
                if (val === null || val === undefined) return null;
                return (
                  <span
                    key={key}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 font-medium"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span className="font-semibold text-[#202C27] dark:text-white">
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : typeof val === 'number' && key.includes('income') ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                    </span>
                  </span>
                );
              })}

              {/* Unresolved / Missing fields badges */}
              {(extractedData.unresolved_fields || []).map((miss, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5 font-medium"
                >
                  <HelpCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span>Missing: {miss}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action to Apply to Form */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#E3E5DC] dark:border-[#2D3A32]">
            <button
              onClick={handleConfirmAndApply}
              className="px-4 py-2 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm cursor-pointer flex items-center space-x-2"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Apply to Evaluation Form Below</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
