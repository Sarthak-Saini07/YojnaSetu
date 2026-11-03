import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Save, AlertCircle, CheckCircle2, Loader2, Building2, Globe, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminSchemeFormModal({ scheme, onClose, onSaveSuccess }) {
  const isEditing = Boolean(scheme);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    category: '',
    level: 'central',
    department: '',
    age_min: '',
    age_max: '',
    income_max: '',
    states: '',
    occupations: '',
    education: '',
    is_student_required: false,
    is_farmer_required: false,
    is_disabled_required: false,
    benefits: '',
    documents: '',
    app_method: 'online',
    app_steps: '',
    official_url: '',
    source_department: '',
    source_url: '',
    last_verified: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (scheme) {
      setFormData({
        name: scheme.name || '',
        slug: scheme.slug || '',
        description: scheme.description || '',
        status: scheme.status || 'active',
        category: (scheme.category || []).join(', '),
        level: scheme.government?.level || 'central',
        department: scheme.government?.department || '',
        age_min: scheme.eligibility?.age?.min ?? '',
        age_max: scheme.eligibility?.age?.max ?? '',
        income_max: scheme.eligibility?.income?.max ?? '',
        states: (scheme.eligibility?.states || []).join(', '),
        occupations: (scheme.eligibility?.occupations || []).join(', '),
        education: (scheme.eligibility?.education || []).join(', '),
        is_student_required: !!scheme.eligibility?.is_student_required,
        is_farmer_required: !!scheme.eligibility?.is_farmer_required,
        is_disabled_required: !!scheme.eligibility?.is_disabled_required,
        benefits: (scheme.benefits || []).join('\n'),
        documents: (scheme.documents || []).join('\n'),
        app_method: scheme.application?.method || 'online',
        app_steps: (scheme.application?.steps || []).join('\n'),
        official_url: scheme.application?.official_url || '',
        source_department: scheme.source?.department || scheme.government?.department || '',
        source_url: scheme.source?.source_url || scheme.application?.official_url || '',
        last_verified: scheme.source?.last_verified || new Date().toISOString().split('T')[0],
      });
    }
  }, [scheme]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Auto-generate slug from name if creating new scheme
      if (!isEditing && name === 'name') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.slug.trim() || !formData.description.trim()) {
      setError('Scheme Name, Slug, and Description are required.');
      return;
    }

    setLoading(true);

    // Build payload matching SchemeCreate / SchemeUpdate Pydantic schema
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      status: formData.status,
      category: formData.category ? formData.category.split(',').map((s) => s.trim()).filter(Boolean) : [],
      government: {
        level: formData.level,
        department: formData.department.trim(),
      },
      eligibility: {
        age: {
          min: formData.age_min !== '' ? intValue(formData.age_min) : null,
          max: formData.age_max !== '' ? intValue(formData.age_max) : null,
        },
        income: {
          max: formData.income_max !== '' ? floatValue(formData.income_max) : null,
        },
        states: formData.states ? formData.states.split(',').map((s) => s.trim()).filter(Boolean) : [],
        occupations: formData.occupations ? formData.occupations.split(',').map((s) => s.trim()).filter(Boolean) : [],
        education: formData.education ? formData.education.split(',').map((s) => s.trim()).filter(Boolean) : [],
        is_student_required: formData.is_student_required,
        is_farmer_required: formData.is_farmer_required,
        is_disabled_required: formData.is_disabled_required,
      },
      benefits: formData.benefits ? formData.benefits.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      documents: formData.documents ? formData.documents.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      application: {
        method: formData.app_method,
        steps: formData.app_steps ? formData.app_steps.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        official_url: formData.official_url.trim(),
      },
      source: {
        department: formData.source_department.trim() || formData.department.trim(),
        source_url: formData.source_url.trim() || formData.official_url.trim(),
        last_verified: formData.last_verified,
      },
    };

    try {
      if (isEditing) {
        await api.put(`/schemes/${scheme.id || scheme.slug}`, payload);
        setSuccess('Scheme updated successfully!');
      } else {
        await api.post('/schemes', payload);
        setSuccess('Scheme created successfully!');
      }

      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save scheme:', err);
      setError(err.response?.data?.detail || 'Failed to save scheme. Check admin privileges and input parameters.');
    } finally {
      setLoading(false);
    }
  };

  const intValue = (val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? None : parsed;
  };

  const floatValue = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? None : parsed;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              <span>{isEditing ? 'Edit Government Scheme' : 'Create New Government Scheme'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Admin management interface. Changes take effect immediately in the eligibility engine.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          {/* Section 1: Scheme Identification */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] text-blue-400">
              1. Basic Identification & Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-200">Scheme Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Post Matric Scholarship for SC Students"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Slug (URL Keyword) *</label>
                <input
                  type="text"
                  name="slug"
                  required
                  placeholder="e.g. post-matric-scholarship-sc"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-200">Categories (Comma separated)</label>
                <input
                  type="text"
                  name="category"
                  placeholder="education, scholarship, sc"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-slate-200">Overview Description *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Provide authoritative description of objectives and target recipients..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Government & Authority */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] text-emerald-400">
              2. Government Authority & Level
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Government Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="central">Central Government</option>
                  <option value="state">State Government</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Department / Ministry</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Ministry of Social Justice and Empowerment"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Standardized Eligibility Rules */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] text-amber-400 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-amber-400" /> 3. Standardized Eligibility Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Min Age (Years)</label>
                <input
                  type="number"
                  name="age_min"
                  placeholder="e.g. 18"
                  value={formData.age_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Max Age (Years)</label>
                <input
                  type="number"
                  name="age_max"
                  placeholder="e.g. 35"
                  value={formData.age_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Max Income Limit (₹)</label>
                <input
                  type="number"
                  name="income_max"
                  placeholder="e.g. 250000"
                  value={formData.income_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-slate-200">Applicable States (Comma separated, empty = Pan-India)</label>
                <input
                  type="text"
                  name="states"
                  placeholder="Punjab, Haryana (or leave empty for all states)"
                  value={formData.states}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-slate-200">Occupations (Comma separated)</label>
                <input
                  type="text"
                  name="occupations"
                  placeholder="student, farmer"
                  value={formData.occupations}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="font-semibold text-slate-200">Education Levels (Comma separated)</label>
                <input
                  type="text"
                  name="education"
                  placeholder="undergraduate, secondary"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_student_required"
                  checked={formData.is_student_required}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Requires Student Status</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_farmer_required"
                  checked={formData.is_farmer_required}
                  onChange={handleChange}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>Requires Farmer Status</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_disabled_required"
                  checked={formData.is_disabled_required}
                  onChange={handleChange}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>Requires Disability Status (PWD)</span>
              </label>
            </div>
          </div>

          {/* Section 4: Benefits & Documents */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] text-purple-400">
              4. Benefits & Required Documents (One item per line)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Scheme Benefits (One per line)</label>
                <textarea
                  name="benefits"
                  rows={3}
                  placeholder="Full tuition fee waiver&#10;Maintenance allowance ₹12,000/year"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Required Documents (One per line)</label>
                <textarea
                  name="documents"
                  rows={3}
                  placeholder="Aadhaar Card&#10;Income Certificate&#10;Caste Certificate"
                  value={formData.documents}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Application & Authoritative Source */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] text-sky-400 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-sky-400" /> 5. Application & Authoritative Source Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-200">Official Portal URL *</label>
                <input
                  type="url"
                  name="official_url"
                  required
                  placeholder="https://scholarships.gov.in"
                  value={formData.official_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Application Method</label>
                <select
                  name="app_method"
                  value={formData.app_method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="online">Online Portal</option>
                  <option value="offline">Offline / District Office</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Last Verified Date *</label>
                <input
                  type="date"
                  name="last_verified"
                  required
                  value={formData.last_verified}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-200">Step-by-step Application Guide (One step per line)</label>
                <textarea
                  name="app_steps"
                  rows={3}
                  placeholder="1. Visit the National Scholarship Portal&#10;2. Register using Aadhaar and mobile number&#10;3. Submit income certificate and college details"
                  value={formData.app_steps}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isEditing ? 'Save Changes' : 'Create Scheme'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
