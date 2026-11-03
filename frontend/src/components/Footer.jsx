import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, Activity, ExternalLink } from 'lucide-react';

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
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-200 text-sm">GovScheme Rec</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              An explainable and uncertainty-aware personalized government scheme discovery platform powered by a 
              deterministic multi-attribute rule engine.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-800">
                <Activity className={`h-3 w-3 ${
                  healthStatus === 'online' ? 'text-emerald-400 animate-pulse' :
                  healthStatus === 'checking' ? 'text-amber-400 animate-spin' : 'text-rose-400'
                }`} />
                <span className="text-slate-300">
                  Engine Status: {healthStatus === 'online' ? 'Operational' : healthStatus === 'checking' ? 'Connecting...' : 'Offline'}
                </span>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-blue-400 transition">Scheme Explorer</Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-blue-400 transition">Recommendations Dashboard</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-blue-400 transition">User Profile</Link>
              </li>
            </ul>
          </div>

          {/* Verification & Portals */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Authoritative Portals</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition inline-flex items-center gap-1"
                >
                  myScheme Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition inline-flex items-center gap-1"
                >
                  National Portal of India <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition inline-flex items-center gap-1"
                >
                  National Scholarship Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <div>
            Academic Research Project &copy; 2026. Designed with deterministic eligibility scoring.
          </div>
          <div className="flex items-center space-x-4">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React Frontend</span>
            <span>•</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
