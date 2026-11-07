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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
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

  // Form Profile state
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

  const [showProfileForm, setShowProfileForm] = useState(true);

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
      // Re-run recommendations using authenticated profile
      runRecommendations();
    }
  }, [user]);

  // Run Recommendations Function
  const runRecommendations = useCallback(async (customProfile = null) => {
    setLoading(true);
    setError('');
    try {
      if (isAuthenticated && !customProfile) {
        // Authenticated user: retrieve recommendations evaluated from saved profile
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

  const handleInputChange = (e) => {
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
    setShowProfileForm(true);
  };

  // Grouped results from API response
  const allResults = recommendations?.results || [];
  const grouped = recommendations?.grouped || {};

  // Extract items for each category tier, preferring structured grouped lists from API
  const eligibleItems = (Array.isArray(grouped.eligible) && grouped.eligible.length > 0)
    ? grouped.eligible
    : allResults.filter(
        (r) => r.status === 'ELIGIBLE' || r.eligibility_status === 'ELIGIBLE' || r.eligible
      );

  const insufficientItems = (Array.isArray(grouped.insufficient_information) && grouped.insufficient_information.length > 0)
    ? grouped.insufficient_information
    : allResults.filter(
        (r) => r.status === 'INSUFFICIENT INFORMATION' || r.eligibility_status === 'INSUFFICIENT_INFORMATION' || r.is_insufficient_info
      );

  const ineligibleItems = (Array.isArray(grouped.not_eligible) && grouped.not_eligible.length > 0)
    ? grouped.not_eligible
    : allResults.filter(
        (r) => r.status === 'NOT ELIGIBLE' || r.eligibility_status === 'NOT_ELIGIBLE' || (!r.eligible && !r.is_insufficient_info)
      );

  // Authoritative total counts across entire evaluated database
  const totalEvaluated = recommendations?.total_evaluated ?? (allResults.length || 0);
  const eligibleCount = recommendations?.eligible_count ?? eligibleItems.length;
  const insufficientCount = recommendations?.insufficient_info_count ?? insufficientItems.length;
  const ineligibleCount = recommendations?.not_eligible_count ?? ineligibleItems.length;

  // Filter items based on active tab
  let displayedItems = [];
  if (activeTab === 'ALL') {
    const combinedFromGroups = [...eligibleItems, ...insufficientItems, ...ineligibleItems];
    displayedItems = combinedFromGroups.length > 0 ? combinedFromGroups : allResults;
  } else if (activeTab === 'ELIGIBLE') {
    displayedItems = eligibleItems;
  } else if (activeTab === 'INSUFFICIENT_INFORMATION') {
    displayedItems = insufficientItems;
  } else if (activeTab === 'NOT_ELIGIBLE') {
    displayedItems = ineligibleItems;
  }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 whenever active tab or recommendations change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, recommendations]);

  const totalItems = displayedItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = displayedItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 pb-16">
      {/* 1. Page Heading and Description with Right-Aligned Profile Form Visibility Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#E3E5DC] dark:border-[#2D3A32]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#245B48]/10 dark:bg-emerald-500/10 text-[#245B48] dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#C49A50]" />
            <span>Deterministic GovTech Recommendation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202C27] dark:text-[#F3F0E7]">
            Personalized Scheme Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-[#556960] dark:text-[#A1B0A6]">
            Evaluating your demographic profile against official eligibility rules across central and state schemes.
          </p>
        </div>

        {/* Right-aligned profile form visibility toggle */}
        <button
          onClick={() => setShowProfileForm(!showProfileForm)}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#202923] hover:bg-[#F0F2EB] dark:hover:bg-[#2A362E] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs font-semibold flex items-center space-x-2 transition shadow-sm cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#245B48] dark:text-emerald-400" />
          <span>{showProfileForm ? 'Hide Evaluation Parameters' : 'Edit Evaluation Parameters'}</span>
        </button>
      </div>

      {/* 2. Compact Saved Profile Summary Card (For Logged-in User) */}
      {isAuthenticated && user && (
        <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#245B48]/10 dark:bg-emerald-500/10 border border-[#245B48]/20 dark:border-emerald-500/20 text-[#245B48] dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#202C27] dark:text-[#F3F0E7]">
                  {user.name || user.full_name || 'Citizen User'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                  Saved Account Profile
                </span>
              </div>
              <p className="text-xs text-[#556960] dark:text-[#A1B0A6] mt-0.5">
                Residency: <span className="text-[#202C27] dark:text-[#F3F0E7] font-medium">{user.profile?.state || 'Not specified'}</span> • Age: <span className="text-[#202C27] dark:text-[#F3F0E7] font-medium">{user.profile?.age ?? 'Not specified'}</span> • Income: <span className="text-[#202C27] dark:text-[#F3F0E7] font-medium">{user.profile?.annual_income ? `₹${user.profile.annual_income.toLocaleString('en-IN')}` : 'Not specified'}</span> • Occupation: <span className="text-[#202C27] dark:text-[#F3F0E7] font-medium">{user.profile?.occupation || 'Not specified'}</span>
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-3.5 py-1.5 rounded-xl bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#245B48] dark:text-emerald-400" />
            <span>Update Profile</span>
          </Link>
        </div>
      )}

      {/* 3. Secondary AI-Assisted Natural-Language Extraction Panel */}
      <AIExtractionWidget onProfileExtracted={handleAIProfileExtracted} />

      {/* 4. Evaluation Profile Parameters Form & 5. Primary Evaluation Action */}
      {showProfileForm && (
        <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm transition-colors">
          <div className="flex justify-between items-center pb-3 border-b border-[#EAECE4] dark:border-[#2D3A32]">
            <div>
              <h2 className="text-sm font-bold text-[#202C27] dark:text-[#F3F0E7] flex items-center gap-2">
                <User className="h-4 w-4 text-[#245B48] dark:text-emerald-400" /> Evaluation Profile Parameters
              </h2>
              <p className="text-xs text-[#556960] dark:text-[#A1B0A6]">
                {isAuthenticated 
                  ? 'Adjust values here to evaluate "what-if" eligibility without modifying your permanently saved account profile.'
                  : 'Enter your demographic details below to evaluate eligibility against all schemes.'}
              </p>
            </div>
            {isAuthenticated && (
              <Link
                to="/profile"
                className="text-xs text-[#245B48] dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Saved Profile
              </Link>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Responsive Two-Column / Four-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-[#202C27] dark:text-[#F3F0E7] font-medium">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  placeholder="e.g. 28"
                  min="0"
                  max="120"
                  value={guestProfile.age}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
                />
              </div>

              {/* State Residency */}
              <div className="space-y-1.5">
                <label className="text-[#202C27] dark:text-[#F3F0E7] font-medium">State Residency</label>
                <select
                  name="state"
                  value={guestProfile.state}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
                >
                  <option value="">Select State (or All India)</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Annual Income */}
              <div className="space-y-1.5">
                <label className="text-[#202C27] dark:text-[#F3F0E7] font-medium">Annual Income (₹)</label>
                <input
                  type="number"
                  name="annual_income"
                  placeholder="e.g. 180000"
                  min="0"
                  value={guestProfile.annual_income}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-[#202C27] dark:text-[#F3F0E7] font-medium">Occupation</label>
                <select
                  name="occupation"
                  value={guestProfile.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] focus:outline-none focus:border-[#245B48] dark:focus:border-emerald-500 transition"
                >
                  <option value="">Select Occupation</option>
                  <option value="student">Student</option>
                  <option value="farmer">Farmer</option>
                  <option value="employed">Employed (Salaried)</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="self_employed">Self Employed / Business</option>
                  <option value="artisan">Artisan / Weaver</option>
                  <option value="laborer">Daily Wage Laborer</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <label className="flex items-center space-x-2 text-[#202C27] dark:text-[#F3F0E7] cursor-pointer">
                <input
                  type="checkbox"
                  name="is_student"
                  checked={guestProfile.is_student}
                  onChange={handleInputChange}
                  className="rounded text-[#245B48] focus:ring-[#245B48] h-4 w-4"
                />
                <span>Is Student</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202C27] dark:text-[#F3F0E7] cursor-pointer">
                <input
                  type="checkbox"
                  name="is_farmer"
                  checked={guestProfile.is_farmer}
                  onChange={handleInputChange}
                  className="rounded text-[#245B48] focus:ring-[#245B48] h-4 w-4"
                />
                <span>Is Farmer / Agriculturalist</span>
              </label>

              <label className="flex items-center space-x-2 text-[#202C27] dark:text-[#F3F0E7] cursor-pointer">
                <input
                  type="checkbox"
                  name="is_disabled"
                  checked={guestProfile.is_disabled}
                  onChange={handleInputChange}
                  className="rounded text-[#245B48] focus:ring-[#245B48] h-4 w-4"
                />
                <span>Person with Disability (PwD)</span>
              </label>
            </div>

            {/* 5. Primary Evaluation Action */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center space-x-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#D4AF37]" />}
                <span>Evaluate Recommendations</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center text-[#556960] dark:text-[#A1B0A6] space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#245B48] dark:text-emerald-400 mx-auto" />
          <p className="text-sm font-medium">Evaluating profile against deterministic government eligibility criteria...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 6. Recommendation Results with Consistent Scheme Cards */}
      {!loading && !error && recommendations && (
        <div className="space-y-6">
          {/* Summary Badges & Tab Navigation Bar */}
          <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="text-xs text-[#556960] dark:text-[#A1B0A6]">
              Evaluated <span className="text-[#202C27] dark:text-[#F3F0E7] font-bold">{totalEvaluated.toLocaleString()}</span> active government schemes
            </div>

            {/* Tier Tabs with Status Badges and Counts */}
            <div className="flex flex-wrap gap-1.5 bg-[#F7F7F2] dark:bg-[#151B18] p-1.5 rounded-xl border border-[#E3E5DC] dark:border-[#2D3A32] text-xs font-semibold">
              {/* All */}
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-white dark:bg-[#202923] text-[#202C27] dark:text-[#F3F0E7] shadow-sm border border-[#D8DBD0] dark:border-[#2D3A32]'
                    : 'text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27] dark:hover:text-[#F3F0E7]'
                }`}
              >
                All ({(totalEvaluated || 0).toLocaleString()})
              </button>

              {/* Eligible */}
              <button
                onClick={() => setActiveTab('ELIGIBLE')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'ELIGIBLE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Eligible ({(eligibleCount || 0).toLocaleString()})</span>
              </button>

              {/* Info Needed */}
              <button
                onClick={() => setActiveTab('INSUFFICIENT_INFORMATION')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'INSUFFICIENT_INFORMATION'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-sm'
                    : 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Info Needed ({(insufficientCount || 0).toLocaleString()})</span>
              </button>

              {/* Ineligible */}
              <button
                onClick={() => setActiveTab('NOT_ELIGIBLE')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'NOT_ELIGIBLE'
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 shadow-sm'
                    : 'text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Ineligible ({(ineligibleCount || 0).toLocaleString()})</span>
              </button>
            </div>
          </div>

          {/* Scheme Cards Grid / List */}
          {displayedItems.length === 0 ? (
            <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-12 text-center text-[#556960] dark:text-[#A1B0A6] text-xs">
              {activeTab === 'INSUFFICIENT_INFORMATION' ? (
                <div className="space-y-1.5">
                  <HelpCircle className="h-6 w-6 text-amber-500 mx-auto opacity-80 mb-2" />
                  <p className="font-semibold text-sm text-[#202C27] dark:text-[#F3F0E7]">
                    No Schemes Require Additional Information
                  </p>
                  <p className="max-w-md mx-auto">
                    All required demographic criteria have been completely evaluated for your profile. Please check the <span className="font-medium text-emerald-600 dark:text-emerald-400">Eligible</span> or <span className="font-medium text-rose-600 dark:text-rose-400">Ineligible</span> tabs.
                  </p>
                </div>
              ) : activeTab === 'NOT_ELIGIBLE' ? (
                <div className="space-y-1.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto opacity-80 mb-2" />
                  <p className="font-semibold text-sm text-[#202C27] dark:text-[#F3F0E7]">
                    No Ineligible Schemes Found
                  </p>
                  <p className="max-w-md mx-auto">
                    You meet the criteria or potentially qualify for all evaluated schemes under your selected parameters.
                  </p>
                </div>
              ) : activeTab === 'ELIGIBLE' ? (
                <div className="space-y-1.5">
                  <AlertCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80 mb-2" />
                  <p className="font-semibold text-sm text-[#202C27] dark:text-[#F3F0E7]">
                    No Directly Eligible Schemes Found
                  </p>
                  <p className="max-w-md mx-auto">
                    Try adjusting your evaluation parameters above (such as state, income, or occupation) to see schemes matching your profile.
                  </p>
                </div>
              ) : (
                <p>No schemes found for the current evaluation.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(paginatedItems) ? paginatedItems : []).map((rec, itemIdx) => {
                if (!rec) return null;
                const {
                  rank,
                  scheme_id,
                  scheme_name,
                  scheme_slug,
                  eligibility_status,
                  status: itemStatus,
                  match_score,
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
                    className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-5 sm:p-6 transition-all duration-200 space-y-4 shadow-sm hover:shadow-md"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-3">
                        {/* Rank Badge */}
                        <div className={`h-8 w-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                          isEligible
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : isInsufficient
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          #{rank || itemIdx + 1}
                        </div>

                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-[#202C27] dark:text-[#F3F0E7]">
                            {scheme_name || schemeData.name || 'Government Scheme'}
                          </h3>
                          {schemeData.government?.department && (
                            <p className="text-xs text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3 text-[#88988E]" />
                              {schemeData.government.department}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Explicit Text Badges for Eligibility States */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isEligible && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ELIGIBLE
                          </span>
                        )}

                        {isInsufficient && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            INSUFFICIENT INFO
                          </span>
                        )}

                        {isIneligible && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 flex items-center gap-1.5">
                            <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            NOT ELIGIBLE
                          </span>
                        )}

                        {/* Match Score */}
                        {match_score !== null && match_score !== undefined ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F7F7F2] dark:bg-[#151B18] text-[#202C27] dark:text-[#F3F0E7] border border-[#D8DBD0] dark:border-[#2D3A32]">
                            Match: <span className="font-semibold text-[#245B48] dark:text-emerald-400">{match_score}%</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs text-[#556960] dark:text-[#A1B0A6] bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32]">
                            Data Needed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Insufficient Information Missing Parameters Alert */}
                    {isInsufficient && Array.isArray(missing_information) && missing_information.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold flex items-center gap-1.5">
                            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            Required Information Needed to Verify:
                          </p>
                          <button
                            onClick={() => setShowProfileForm(true)}
                            className="text-amber-800 dark:text-amber-300 underline hover:text-[#202C27] font-semibold text-[11px] cursor-pointer"
                          >
                            Provide in Parameters Form Above
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {missing_information.map((miss, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202923] border border-amber-200 dark:border-amber-800/60 font-medium text-[11px] text-amber-900 dark:text-amber-200"
                            >
                              Missing: {typeof miss === 'object' ? (miss.field || miss.description || JSON.stringify(miss)) : miss}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendation Explanation Bullet Points */}
                    {displayExplanations.length > 0 && (
                      <div className="space-y-1.5 text-xs">
                        <h4 className="font-semibold text-[#556960] dark:text-[#A1B0A6] uppercase tracking-wider text-[11px]">
                          Evaluation Details
                        </h4>
                        <ul className="space-y-1">
                          {displayExplanations.map((exp, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[#202C27] dark:text-[#F3F0E7]">
                              <span className="text-[#245B48] dark:text-emerald-400 font-bold">•</span>
                              <span>{typeof exp === 'object' ? (exp.message || JSON.stringify(exp)) : exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Benefits Preview */}
                    {Array.isArray(schemeData.benefits) && schemeData.benefits.length > 0 && (
                      <div className="pt-2 border-t border-[#EAECE4] dark:border-[#2D3A32] text-xs space-y-1">
                        <p className="font-semibold text-[#556960] dark:text-[#A1B0A6] text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-[#C49A50]" /> Benefits Summary
                        </p>
                        <p className="text-[#202C27] dark:text-[#F3F0E7] line-clamp-2">
                          {schemeData.benefits.join(' • ')}
                        </p>
                      </div>
                    )}

                    {/* Footer Row Actions */}
                    <div className="pt-3 border-t border-[#EAECE4] dark:border-[#2D3A32] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {Array.isArray(schemeData.documents) && schemeData.documents.length > 0 && (
                          <span className="text-[#556960] dark:text-[#A1B0A6] flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-[#245B48] dark:text-emerald-400" />
                            {schemeData.documents.length} Required Documents
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                          onClick={() => setSelectedScheme(schemeData)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#F7F7F2] hover:bg-[#ECEEE6] dark:bg-[#151B18] dark:hover:bg-[#202923] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] text-xs font-semibold transition cursor-pointer flex-1 sm:flex-initial text-center"
                        >
                          View Full Details & Steps
                        </button>

                        {/* Apply on Official Portal button */}
                        {isEligible && schemeData.application?.official_url && (
                          <a
                            href={schemeData.application.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-[#245B48] hover:bg-[#1B4637] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer flex-1 sm:flex-initial"
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

          {/* Pagination Controls */}
          {displayedItems.length > 0 && totalPages > 1 && (
            <div className="bg-white dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <div className="text-[#556960] dark:text-[#A1B0A6] flex items-center gap-2">
                <span>
                  Showing <span className="text-[#202C27] dark:text-[#F3F0E7] font-bold">{(currentPage - 1) * pageSize + 1}</span>–
                  <span className="text-[#202C27] dark:text-[#F3F0E7] font-bold">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
                  <span className="text-[#202C27] dark:text-[#F3F0E7] font-bold">{totalItems}</span> schemes
                </span>
                {totalItems < (activeTab === 'ELIGIBLE' ? eligibleCount : activeTab === 'INSUFFICIENT_INFORMATION' ? insufficientCount : activeTab === 'NOT_ELIGIBLE' ? ineligibleCount : totalEvaluated) && (
                  <span className="text-[11px] text-[#88988E] dark:text-[#68776D] hidden md:inline">
                    (Top {totalItems} ranked displayed)
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] hover:bg-[#ECEEE6] dark:hover:bg-[#202923] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .reduce((acc, page, idx, arr) => {
                      if (idx > 0 && page - arr[idx - 1] > 1) {
                        acc.push(-1 * idx);
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) => {
                      if (item < 0) {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-1 text-[#88988E] select-none">
                            …
                          </span>
                        );
                      }
                      return (
                        <button
                          key={item}
                          onClick={() => {
                            setCurrentPage(item);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                            currentPage === item
                              ? 'bg-[#245B48] text-white shadow-sm dark:bg-emerald-600'
                              : 'bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#556960] dark:text-[#A1B0A6] hover:text-[#202C27] dark:hover:text-[#F3F0E7]'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F7F2] dark:bg-[#151B18] border border-[#D8DBD0] dark:border-[#2D3A32] text-[#202C27] dark:text-[#F3F0E7] hover:bg-[#ECEEE6] dark:hover:bg-[#202923] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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
