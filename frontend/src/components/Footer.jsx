import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, Activity, ExternalLink, Award, FileText } from 'lucide-react';

export default function Footer() {
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    api.get('/health')
      .then((res) => {
        if (res.data?.status === 'ok') setHealthStatus('online');
        else setHealthStatus('degraded');
      })
      .catch(() => setHealthStatus('offline'));
  }, []);

  return (
    <footer className="border-t border-[#E3E5DC] dark:border-[#2D3A32] bg-white dark:bg-[#151B18] text-[#5A6B62] dark:text-[#9EACA3] text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#245B48] flex items-center justify-center text-white shadow-2xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-[#202C27] dark:text-[#F3F0E7] text-sm tracking-tight">
                GovScheme Rec
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F7F7F2] dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32] text-[#245B48] dark:text-[#D5AD62]">
                GovTech v2.4
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md text-[#5A6B62] dark:text-[#9EACA3]">
              A deterministic, explainable government welfare discovery platform designed for Indian citizens. 
              Evaluates demographic attributes against verified ministry guidelines with transparent rule verification.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F7F7F2] dark:bg-[#202923] border border-[#E3E5DC] dark:border-[#2D3A32]">
                <Activity className={`h-3 w-3 ${
                  healthStatus === 'online' ? 'text-emerald-600 dark:text-emerald-400' :
                  healthStatus === 'checking' ? 'text-amber-500 animate-spin' : 'text-rose-500'
                }`} />
                <span className="text-[#202C27] dark:text-[#F3F0E7] font-semibold">
                  System Status: {healthStatus === 'online' ? 'Operational' : healthStatus === 'checking' ? 'Connecting...' : 'Degraded'}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-bold text-[#202C27] dark:text-[#F3F0E7] mb-3 uppercase tracking-wider text-[11px]">
              Platform Navigation
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link to="/" className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition">Home Overview</Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition">Scheme Catalog Explorer</Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition">Eligibility Recommendations</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition">Citizen Profile Manager</Link>
              </li>
            </ul>
          </div>

          {/* Authoritative Resources */}
          <div>
            <h4 className="font-bold text-[#202C27] dark:text-[#F3F0E7] mb-3 uppercase tracking-wider text-[11px]">
              Authoritative Portals
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition inline-flex items-center gap-1"
                >
                  myScheme Portal <ExternalLink className="h-3 w-3 text-[#7B8B82]" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition inline-flex items-center gap-1"
                >
                  PM-KISAN Samman Nidhi <ExternalLink className="h-3 w-3 text-[#7B8B82]" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition inline-flex items-center gap-1"
                >
                  Ayushman Bharat PM-JAY <ExternalLink className="h-3 w-3 text-[#7B8B82]" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#245B48] dark:hover:text-[#D5AD62] transition inline-flex items-center gap-1"
                >
                  National Scholarship Portal <ExternalLink className="h-3 w-3 text-[#7B8B82]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright / policy bar */}
        <div className="pt-6 border-t border-[#E3E5DC] dark:border-[#2D3A32] flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#7B8B82] dark:text-[#7C8B82]">
          <p>© {new Date().getFullYear()} GovScheme Rec. Designed for transparent citizen welfare access.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-[#C49A50]" /> Verified Government Criteria
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-[#245B48] dark:text-[#57D68D]" /> Explainable Rule Outputs
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
