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
  RefreshCw,
  FileText,
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
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>AI-Assisted Natural Language Profile Extraction</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-mono">
                Experimental Layer
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Type your profile in plain English. AI extracts demographic fields into structured data for your review.
            </p>
          </div>
        </div>

        {/* Disclaimer Badge */}
        <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Rules Engine Makes Final Decision
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleExtract} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">
            Describe your demographics in your own words:
          </label>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., I'm a 21-year-old student living in Punjab with an annual family income of ₹2.5 lakh..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        {/* Sample Prompt Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-slate-400 font-medium">Try Sample Prompt:</span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition text-[11px] truncate max-w-[280px] cursor-pointer"
            >
              "{prompt.slice(0, 35)}..."
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Extracting Profile...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Extract Profile with AI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Profile Review & Confirm Box (Requirement #11) */}
      {extractedData && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Review Extracted Profile (Provider: {extractedData.ai_provider_used})
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Extracted {extractedData.extracted_fields_count} fields
            </span>
          </div>

          {/* Transparent Confidence & Unresolved Fields Summary */}
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {extractedData.confidence_notes}
          </p>

          {/* Extracted Fields Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Parsed Values to be Transferred to Form:
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(extractedData.extracted_profile).map(([key, val]) => {
                if (val === null || val === undefined) return null;
                return (
                  <span
                    key={key}
                    className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span className="font-bold text-white">
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : typeof val === 'number' && key.includes('income') ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                    </span>
                  </span>
                );
              })}

              {/* Unresolved / Missing fields badges */}
              {extractedData.unresolved_fields.map((miss, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] flex items-center gap-1.5"
                >
                  <HelpCircle className="h-3 w-3 text-amber-400" />
                  <span>Missing: {miss}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action to Apply to Form */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              onClick={handleConfirmAndApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center space-x-2"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Populate & Review Fields in Form Below</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
