import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SchemeDetailModal from '../components/SchemeDetailModal';
import AIExtractionWidget from '../components/AIExtractionWidget';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  ExternalLink, 
  User, 
  Edit3, 
  Loader2, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Award, 
  Building2, 
  Info,
  Filter,
  ArrowRight
} from 'lucide-react';


const INDIAN_STATES = [
  'Punjab', 'Haryana', 'Delhi', 'Maharashtra', 'Karnataka', 
  'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan', 
  'Gujarat', 'Kerala', 'Madhya Pradesh', 'Odisha', 'Andhra Pradesh', 
  'Telangana', 'Assam', 'Himachal Pradesh', 'Jharkhand', 'Chhattisgarh'
];

export default function RecommendationsPage() {
  const { user, isAuthenticated } = useAuth();

  // Recommendations API Response State
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active Tab: 'ALL' | 'ELIGIBLE' | 'INSUFFICIENT_INFORMATION' | 'NOT_ELIGIBLE'
  const [activeTab, setActiveTab] = useState('ALL');

  // Selected scheme for modal
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Guest / Custom Form Profile state
  const [guestProfile, setGuestProfile] = useState({
    age: '',
    gender: '',
    state: '',
    district: '',
    annual_income: '',
    occupation: '',
    education: '',
    category: '',
    is_student: false,
    is_farmer: false,
    is_disabled: false,
  });

  const [showGuestForm, setShowGuestForm] = useState(!isAuthenticated);

  // Initialize profile state from logged-in user if present
  useEffect(() => {
    if (user?.profile) {
      setGuestProfile({
        date_of_birth: user.profile.date_of_birth || '',
        age: user.profile.age !== null && user.profile.age !== undefined ? user.profile.age : '',
        gender: user.profile.gender || '',
        state: user.profile.state || '',
        district: user.profile.district || '',
        annual_income: user.profile.annual_income !== null && user.profile.annual_income !== undefined ? user.profile.annual_income : '',
        occupation: user.profile.occupation || '',
        education: user.profile.education || '',
        category: user.profile.category || '',
        is_student: !!user.profile.is_student,
        is_farmer: !!user.profile.is_farmer,
        is_disabled: !!user.profile.is_disabled,
      });
      // Re-run recommendations using authenticated profile from MongoDB
      runRecommendations();
    }
  }, [user]);

  // Run Recommendations Function
  const runRecommendations = useCallback(async (customProfile = null) => {
    setLoading(true);
    setError('');
    try {
      if (isAuthenticated && !customProfile) {
        // Authenticated user: retrieve recommendations evaluated from saved MongoDB profile
        const res = await api.get('/eligibility/me');
        setRecommendations(res.data);
      } else {
        const activeProf = customProfile || guestProfile;
        const payload = {
          profile: {
            date_of_birth: activeProf.date_of_birth || null,
            age: activeProf.age !== '' ? parseInt(activeProf.age, 10) : null,
            gender: activeProf.gender || null,
            state: activeProf.state || null,
            district: activeProf.district || null,
            annual_income: activeProf.annual_income !== '' ? parseFloat(activeProf.annual_income) : null,
            occupation: activeProf.occupation || null,
            education: activeProf.education || null,
            category: activeProf.category || null,
            is_student: Boolean(activeProf.is_student),
            is_farmer: Boolean(activeProf.is_farmer),
            is_disabled: Boolean(activeProf.is_disabled),
          },
        };

        const res = await api.post('/eligibility/recommend', payload);
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error('Recommendation API Error:', err);
      setError(err.response?.data?.detail || 'Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guestProfile]);

  // Auto-run on mount
  useEffect(() => {
    runRecommendations();
  }, []);

  const handleGuestInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuestProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runRecommendations();
  };

  const handleAIProfileExtracted = (extracted) => {
    setGuestProfile((prev) => ({
      ...prev,
      age: extracted.age !== null && extracted.age !== undefined ? extracted.age : prev.age,
      gender: extracted.gender || prev.gender,
      state: extracted.state || prev.state,
      district: extracted.district || prev.district,
      annual_income: extracted.annual_income !== null && extracted.annual_income !== undefined ? extracted.annual_income : prev.annual_income,
      occupation: extracted.occupation || prev.occupation,
      education: extracted.education || prev.education,
      category: extracted.category || prev.category,
      is_student: extracted.is_student !== null ? extracted.is_student : prev.is_student,
      is_farmer: extracted.is_farmer !== null ? extracted.is_farmer : prev.is_farmer,
      is_disabled: extracted.is_disabled !== null ? extracted.is_disabled : prev.is_disabled,
    }));
    setShowGuestForm(true);
  };

  // Grouped results from API response
  const allResults = recommendations?.results || [];
  const eligibleItems = recommendations?.eligible_recommendations || allResults.filter(
    (r) => r.status === 'ELIGIBLE' || r.eligibility_status === 'ELIGIBLE' || r.eligible
  );
  const insufficientItems = recommendations?.insufficient_information_recommendations || allResults.filter(
    (r) => r.status === 'INSUFFICIENT INFORMATION' || r.eligibility_status === 'INSUFFICIENT_INFORMATION' || r.is_insufficient_info
  );
  const ineligibleItems = recommendations?.ineligible_schemes || allResults.filter(
    (r) => r.status === 'NOT ELIGIBLE' || r.eligibility_status === 'NOT_ELIGIBLE' || (!r.eligible && !r.is_insufficient_info)
  );
  const totalEvaluated = recommendations?.total_evaluated ?? (allResults.length || 0);

  // Filter items based on active tab
  let displayedItems = [];
  if (activeTab === 'ALL') {
    displayedItems = allResults.length > 0 ? allResults : [...eligibleItems, ...insufficientItems, ...ineligibleItems];
  } else if (activeTab === 'ELIGIBLE') {
    displayedItems = eligibleItems;
  } else if (activeTab === 'INSUFFICIENT_INFORMATION') {
    displayedItems = insufficientItems;
  } else if (activeTab === 'NOT_ELIGIBLE') {
    displayedItems = ineligibleItems;
  }

  return (
    <div className="space-y-8 py-6 pb-16">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deterministic Ranking Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Personalized Scheme Recommendations
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Evaluating your demographic profile against verified government scheme eligibility rules.
          </p>
        </div>

        {/* Action button to toggle custom demographics form */}
        <button
          onClick={() => setShowGuestForm(!showGuestForm)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
        >
          <User className="h-4 w-4 text-blue-400" />
          <span>{showGuestForm ? 'Hide Demographics Form' : 'Edit Demographics Inputs'}</span>
        </button>
      </div>

      {/* Authenticated Persistent Profile Status Banner */}
      {isAuthenticated && user && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  {user.name || user.full_name || 'Citizen User'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                  Saved MongoDB Profile
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Residency: <span className="text-slate-200 font-medium">{user.profile?.state || 'Not specified'}</span> • Age: <span className="text-slate-200 font-medium">{user.profile?.age ?? 'Not specified'}</span> • Income: <span className="text-slate-200 font-medium">{user.profile?.annual_income ? `₹${user.profile.annual_income.toLocaleString('en-IN')}` : 'Not specified'}</span> • Occupation: <span className="text-slate-200 font-medium">{user.profile?.occupation || 'Not specified'}</span>
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Edit3 className="h-3.5 w-3.5 text-blue-400" />
            <span>Edit Profile</span>
          </Link>
        </div>
      )}

      {/* AI Natural Language Extraction Widget (Requirement #11 & #12) */}
      <AIExtractionWidget onProfileExtracted={handleAIProfileExtracted} />



      {/* Guest / Custom Profile Form */}
      {showGuestForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" /> Evaluation Profile Parameters
              </h2>
              <p className="text-[11px] text-slate-400">
                {isAuthenticated 
                  ? 'Modifying these fields here will evaluate recommendations without overwriting your saved account profile.'
                  : 'Testing as Guest: Enter demographic details below. No account required.'}
              </p>
            </div>
            {isAuthenticated && (
              <Link
                to="/profile"
                className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Saved Profile
              </Link>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Age */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  placeholder="e.g. 21"
                  value={guestProfile.age}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* State */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">State Residency</label>
                <select
                  name="state"
                  value={guestProfile.state}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Annual Income */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Annual Income (₹)</label>
                <input
                  type="number"
                  name="annual_income"
                  placeholder="e.g. 250000"
                  value={guestProfile.annual_income}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Occupation</label>
                <select
                  name="occupation"
                  value={guestProfile.occupation}
                  onChange={handleGuestInputChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Occupation</option>
                  <option value="student">Student</option>
                  <option value="farmer">Farmer</option>
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="self_employed">Self Employed</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_student"
                  checked={guestProfile.is_student}
                  onChange={handleGuestInputChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Is Student</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_farmer"
                  checked={guestProfile.is_farmer}
                  onChange={handleGuestInputChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Is Farmer</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_disabled"
                  checked={guestProfile.is_disabled}
                  onChange={handleGuestInputChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Is Disabled / PWD</span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Evaluate Recommendations</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-sm font-medium">Evaluating profile against government eligibility rules...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Grouped Recommendation Results */}
      {!loading && !error && recommendations && (
        <div className="space-y-6">
          {/* Summary Badges Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs font-mono text-slate-400">
              Evaluated <span className="text-slate-100 font-bold">{totalEvaluated}</span> active schemes
            </div>

            {/* Tier Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-slate-800 text-slate-100 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({totalEvaluated})
              </button>

              <button
                onClick={() => setActiveTab('ELIGIBLE')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'ELIGIBLE'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                    : 'text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Eligible ({eligibleItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('INSUFFICIENT_INFORMATION')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'INSUFFICIENT_INFORMATION'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Info Needed ({insufficientItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('NOT_ELIGIBLE')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'NOT_ELIGIBLE'
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Ineligible ({ineligibleItems.length})</span>
              </button>
            </div>
          </div>

          {/* Scheme Recommendation Cards */}
          {displayedItems.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
              No schemes in category tab <span className="font-bold text-slate-200">{activeTab}</span>.
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(displayedItems) ? displayedItems : []).map((rec, itemIdx) => {
                if (!rec) return null;
                const {
                  rank,
                  scheme_id,
                  scheme_name,
                  scheme_slug,
                  eligibility_status,
                  status: itemStatus,
                  match_score,
                  recommendation_tier,
                  explanations = [],
                  missing_information = [],
                  matched_conditions = [],
                  failed_conditions = [],
                  recommendation_reason,
                  scheme_details = {},
                  scheme = {},
                } = rec;

                const schemeData = (scheme && typeof scheme === 'object' && Object.keys(scheme).length > 0)
                  ? scheme
                  : (scheme_details && typeof scheme_details === 'object' ? scheme_details : {});
                const actualStatus = itemStatus || eligibility_status || '';
                const isEligible = actualStatus === 'ELIGIBLE' || Boolean(rec.eligible);
                const isInsufficient = actualStatus === 'INSUFFICIENT INFORMATION' || actualStatus === 'INSUFFICIENT_INFORMATION' || Boolean(rec.is_insufficient_info);
                const isIneligible = actualStatus === 'NOT ELIGIBLE' || actualStatus === 'NOT_ELIGIBLE' || (!isEligible && !isInsufficient);

                const displayExplanations = (Array.isArray(explanations) && explanations.length > 0)
                  ? explanations
                  : [
                      ...(Array.isArray(matched_conditions) ? matched_conditions : []),
                      ...(Array.isArray(failed_conditions) ? failed_conditions : []),
                      ...(recommendation_reason ? [recommendation_reason] : []),
                    ];

                return (
                  <div
                    key={scheme_id || schemeData._id || schemeData.slug || `rec-${itemIdx}`}
                    className={`bg-slate-900 border rounded-3xl p-6 transition-all duration-200 space-y-4 shadow-xl ${
                      isEligible
                        ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20'
                        : isInsufficient
                        ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20'
                        : 'border-slate-800 opacity-80'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-3">
                        {/* Rank Badge */}
                        <div className={`h-8 w-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                          isEligible
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isInsufficient
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{rank || itemIdx + 1}
                        </div>

                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-slate-100">
                            {scheme_name || schemeData.name || 'Government Scheme'}
                          </h3>
                          {schemeData.government?.department && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-500" />
                              {schemeData.government.department}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Eligibility Status Badge */}
                      <div className="flex items-center gap-2">
                        {isEligible && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ELIGIBLE (Tier 1)
                          </span>
                        )}

                        {isInsufficient && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                            <HelpCircle className="h-4 w-4 text-amber-400" />
                            INSUFFICIENT INFO (Tier 2)
                          </span>
                        )}

                        {isIneligible && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                            <XCircle className="h-4 w-4 text-rose-400" />
                            NOT ELIGIBLE (Tier 3)
                          </span>
                        )}

                        {/* Match Score */}
                        {match_score !== null && match_score !== undefined ? (
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            Match Score: {match_score}/100
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800">
                            Match Score: Data Needed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Insufficient Information Missing Parameters Alert */}
                    {isInsufficient && Array.isArray(missing_information) && missing_information.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold flex items-center gap-1.5">
                            <HelpCircle className="h-4 w-4 text-amber-400" />
                            Missing Information to Verify Eligibility:
                          </p>
                          <button
                            onClick={() => setShowGuestForm(true)}
                            className="text-amber-200 underline hover:text-white font-semibold text-[11px] cursor-pointer"
                          >
                            Update Parameters
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {missing_information.map((miss, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/30 font-mono text-[11px] text-amber-200"
                            >
                              Missing: {typeof miss === 'object' ? (miss.field || miss.description || JSON.stringify(miss)) : miss}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendation Explanation Bullet Points */}
                    {displayExplanations.length > 0 && (
                      <div className="space-y-2 text-xs">
                        <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                          Recommendation Explanation & Reasoning
                        </h4>
                        <ul className="space-y-1.5">
                          {displayExplanations.map((exp, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300">
                              <span className="text-blue-400 font-bold">•</span>
                              <span>{typeof exp === 'object' ? (exp.message || JSON.stringify(exp)) : exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Benefits Preview */}
                    {Array.isArray(schemeData.benefits) && schemeData.benefits.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5">
                        <p className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-emerald-400" /> Scheme Benefits
                        </p>
                        <p className="text-slate-300 line-clamp-2">
                          {schemeData.benefits.join(' • ')}
                        </p>
                      </div>
                    )}

                    {/* Footer Row Actions */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {Array.isArray(schemeData.documents) && schemeData.documents.length > 0 && (
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <FileText className="h-3.5 w-3.5 text-blue-400" />
                            {schemeData.documents.length} Required Documents
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                          onClick={() => setSelectedScheme(schemeData)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial text-center"
                        >
                          View Scheme Criteria & Steps
                        </button>

                        {/* Apply on Official Portal button */}
                        {isEligible && schemeData.application?.official_url && (
                          <a
                            href={schemeData.application.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/20 cursor-pointer flex-1 sm:flex-initial"
                          >
                            <span>Apply on Official Portal</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}
