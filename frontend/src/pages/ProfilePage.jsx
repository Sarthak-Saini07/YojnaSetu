import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  Award,
  Phone,
  Calendar,
  Heart,
  Users,
  Check
} from 'lucide-react';

const INDIAN_STATES = [
  'Punjab', 'Haryana', 'Delhi', 'Maharashtra', 'Karnataka', 
  'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan', 
  'Gujarat', 'Kerala', 'Madhya Pradesh', 'Odisha', 'Andhra Pradesh', 
  'Telangana', 'Assam', 'Himachal Pradesh', 'Jharkhand', 'Chhattisgarh', 
  'Uttarakhand', 'Goa', 'Jammu and Kashmir', 'Ladakh'
];

const OCCUPATIONS = [
  { value: 'student', label: 'Student' },
  { value: 'farmer', label: 'Farmer / Agriculturalist' },
  { value: 'employed', label: 'Employed / Salaried' },
  { value: 'self_employed', label: 'Self Employed / Entrepreneur' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'artisan', label: 'Artisan / Craftsman' },
  { value: 'worker', label: 'Laborer / Daily Wage Worker' },
];

const EDUCATION_LEVELS = [
  { value: 'none', label: 'Below Primary / No Formal Education' },
  { value: 'primary', label: 'Primary School (Class 1-5)' },
  { value: 'secondary', label: 'Secondary / High School (Class 6-10)' },
  { value: 'higher_secondary', label: 'Higher Secondary (Class 11-12 / Diploma)' },
  { value: 'undergraduate', label: 'Undergraduate (Bachelor Degree)' },
  { value: 'postgraduate', label: 'Postgraduate (Master Degree)' },
  { value: 'doctorate', label: 'Doctorate / PhD' },
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Divorced'];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [profile, setProfile] = useState({
    date_of_birth: '',
    age: '',
    gender: '',
    state: '',
    district: '',
    annual_income: '',
    occupation: '',
    education: '',
    category: '',
    marital_status: '',
    family_members: '',
    disability_status: '',
    employment_status: '',
    is_student: false,
    is_farmer: false,
    is_disabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Populate profile from current user on load / update
  useEffect(() => {
    if (user) {
      setName(user.name || user.full_name || '');
      setPhone(user.phone || '');
      if (user.profile) {
        setProfile({
          date_of_birth: user.profile.date_of_birth || '',
          age: user.profile.age !== null && user.profile.age !== undefined ? user.profile.age : '',
          gender: user.profile.gender || '',
          state: user.profile.state || '',
          district: user.profile.district || '',
          annual_income: user.profile.annual_income !== null && user.profile.annual_income !== undefined ? user.profile.annual_income : '',
          occupation: user.profile.occupation || '',
          education: user.profile.education || '',
          category: user.profile.category || '',
          marital_status: user.profile.marital_status || '',
          family_members: user.profile.family_members !== null && user.profile.family_members !== undefined ? user.profile.family_members : '',
          disability_status: user.profile.disability_status || '',
          employment_status: user.profile.employment_status || '',
          is_student: !!user.profile.is_student,
          is_farmer: !!user.profile.is_farmer,
          is_disabled: !!user.profile.is_disabled,
        });
      }
    }
  }, [user]);

  // Calculate age from DOB helper
  const calculateAgeFromDOB = (dobStr) => {
    if (!dobStr) return '';
    try {
      const birthDate = new Date(dobStr);
      if (isNaN(birthDate.getTime())) return '';
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : '';
    } catch {
      return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Auto compute age if date of birth changed
      if (name === 'date_of_birth') {
        const calc = calculateAgeFromDOB(value);
        if (calc !== '') {
          updated.age = calc;
        }
      }

      // Auto toggle boolean status flags based on occupation
      if (name === 'occupation') {
        if (value === 'student') updated.is_student = true;
        if (value === 'farmer') updated.is_farmer = true;
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Build typed payload
      const payload = {
        name: name.trim() || null,
        phone: phone.trim() || null,
        profile: {
          date_of_birth: profile.date_of_birth || null,
          age: profile.age !== '' ? parseInt(profile.age, 10) : null,
          gender: profile.gender || null,
          state: profile.state || null,
          district: profile.district || null,
          annual_income: profile.annual_income !== '' ? parseFloat(profile.annual_income) : null,
          occupation: profile.occupation || null,
          education: profile.education || null,
          category: profile.category || null,
          marital_status: profile.marital_status || null,
          family_members: profile.family_members !== '' ? parseInt(profile.family_members, 10) : null,
          disability_status: profile.disability_status || null,
          employment_status: profile.employment_status || null,
          is_student: Boolean(profile.is_student),
          is_farmer: Boolean(profile.is_farmer),
          is_disabled: Boolean(profile.is_disabled),
        },
      };

      await updateProfile(payload);
      setSuccess('Demographic profile successfully saved to MongoDB database!');
      return true;
    } catch (err) {
      console.error('Failed to update profile in MongoDB:', err);
      setError(err.response?.data?.detail || 'Failed to save profile. Please verify your inputs.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndRecommend = async (e) => {
    const ok = await handleSave(e);
    if (ok) {
      navigate('/recommendations');
    }
  };

  // Identify missing key parameters for eligibility
  const missingFields = [];
  if (profile.age === '' || profile.age === null) missingFields.push('Age / Date of Birth');
  if (!profile.state) missingFields.push('State Residency');
  if (profile.annual_income === '' || profile.annual_income === null) missingFields.push('Annual Income');
  if (!profile.occupation) missingFields.push('Occupation');
  if (!profile.education) missingFields.push('Education');
  if (!profile.category) missingFields.push('Social Category');

  // Completion calculation
  const coreFields = [profile.age, profile.gender, profile.state, profile.district, profile.annual_income, profile.occupation, profile.education, profile.category];
  const filledCount = coreFields.filter(f => f !== '' && f !== null && f !== undefined).length;
  const completionPercentage = Math.round((filledCount / coreFields.length) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Citizen Demographic Profile</h1>
          </div>
          <p className="text-xs text-slate-400">
            Account: <span className="text-slate-200 font-semibold">{user?.email}</span> ({name || user?.email}) • Stored in <span className="text-emerald-400 font-semibold">MongoDB</span>
          </p>
        </div>

        <button
          onClick={handleSaveAndRecommend}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Save & View Recommendations</span>
        </button>
      </div>

      {/* Profile Completion Indicator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-400" />
            <span className="font-semibold text-slate-200">Profile Completion Status</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
            completionPercentage >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            completionPercentage >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-slate-800 text-slate-400'
          }`}>
            {completionPercentage}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Higher profile completion enables the deterministic engine to verify exact eligibility criteria without triggering <span className="text-amber-300 font-mono">INSUFFICIENT INFORMATION</span>.
        </p>
      </div>

      {/* Missing Information Alert */}
      {missingFields.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-amber-200">
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span>Missing Demographic Information ({missingFields.length})</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Schemes requiring <span className="font-semibold text-amber-300">{missingFields.join(', ')}</span> will result in <span className="font-mono text-amber-400 font-semibold">INSUFFICIENT INFORMATION</span> with <span className="font-mono text-amber-400 font-semibold">match_score = null</span> until these fields are provided.
          </p>
        </div>
      )}

      {/* Success / Error Toast */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Account & Contact */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" /> 1. Account & Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                placeholder="Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Location Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" /> 2. Personal & Location Demographics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-400" /> Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={profile.date_of_birth}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex justify-between">
                <span>Age (Years)</span>
                {profile.date_of_birth && <span className="text-emerald-400 text-[11px]">Auto-calculated</span>}
              </label>
              <input
                type="number"
                name="age"
                min="0"
                max="120"
                placeholder="e.g. 24"
                value={profile.age}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Transgender</option>
              </select>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">State of Residence</label>
              <select
                name="state"
                value={profile.state}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">District</label>
              <input
                type="text"
                name="district"
                placeholder="e.g. Jalandhar, Amritsar"
                value={profile.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Social Category */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Social Category (Caste)</label>
              <select
                name="category"
                value={profile.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Socio-Economic & Family */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-blue-400 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-400" /> 3. Economic, Family & Education
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Annual Income */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Annual Family Income (₹ INR)</label>
              <input
                type="number"
                name="annual_income"
                min="0"
                step="1000"
                placeholder="e.g. 250000"
                value={profile.annual_income}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Primary Occupation</label>
              <select
                name="occupation"
                value={profile.occupation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select Occupation</option>
                {OCCUPATIONS.map((occ) => (
                  <option key={occ.value} value={occ.value}>{occ.label}</option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Education Level</label>
              <select
                name="education"
                value={profile.education}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select Education Level</option>
                {EDUCATION_LEVELS.map((edu) => (
                  <option key={edu.value} value={edu.value}>{edu.label}</option>
                ))}
              </select>
            </div>

            {/* Marital Status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-400" /> Marital Status
              </label>
              <select
                name="marital_status"
                value={profile.marital_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select Marital Status</option>
                {MARITAL_STATUSES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Family Members */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-indigo-400" /> Number of Family Members
              </label>
              <input
                type="number"
                name="family_members"
                min="1"
                max="50"
                placeholder="e.g. 4"
                value={profile.family_members}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Disability Status */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Disability Details (Optional)</label>
              <input
                type="text"
                name="disability_status"
                placeholder="e.g. Locomotor / Visual (≥40%)"
                value={profile.disability_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                name="is_student"
                checked={profile.is_student}
                onChange={handleChange}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-xs text-slate-200 font-medium">Currently an Active Student</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                name="is_farmer"
                checked={profile.is_farmer}
                onChange={handleChange}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-xs text-slate-200 font-medium">Practicing Farmer / Landholder</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                name="is_disabled"
                checked={profile.is_disabled}
                onChange={handleChange}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-xs text-slate-200 font-medium">Person with Disability (PwD)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-blue-400" />}
            <span>Save to MongoDB</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndRecommend}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Save & View Recommendations</span>
          </button>
        </div>
      </form>
    </div>
  );
}
