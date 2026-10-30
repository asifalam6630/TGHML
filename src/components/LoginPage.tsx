/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from '../types/organogram';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Shield, 
  Users, 
  Key, 
  Sparkles,
  Building2,
  FileText,
  BarChart3
} from 'lucide-react';

interface LoginPageProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onGuestAccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  onLogin,
  onGuestAccess,
}) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedId = userIdInput.trim().toLowerCase();
    const matched = users.find(
      (u) =>
        u.userId.toLowerCase() === trimmedId &&
        u.password === passwordInput.trim()
    );

    if (!matched) {
      setErrorMsg('Invalid User ID or Password. Please check credentials or select a quick access role below.');
      return;
    }

    if (!matched.isActive) {
      setErrorMsg('This user account is currently suspended. Please contact HR Administration.');
      return;
    }

    const updated = {
      ...matched,
      lastLogin: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onLogin(updated);
  };

  const handleQuickSelect = (user: UserAccount) => {
    setUserIdInput(user.userId);
    setPasswordInput(user.password);
    setErrorMsg('');
    onLogin(user);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between font-sans selection:bg-red-100 selection:text-red-900 bg-dot-slate">
      {/* Top Banner */}
      <header className="h-16 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 px-2.5 py-1 bg-white rounded border border-slate-200 flex items-center justify-center shadow-2xs">
            <img
              src="/assets/aistudio/image_bfec73ab.png"
              alt="Turag Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 leading-none block">
              Turag Garments And Hosiery Limited
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Factory Organogram & Manpower Operations Portal
            </span>
          </div>
        </div>

        {/* Guest Preview Button in Header */}
        <button
          type="button"
          onClick={onGuestAccess}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>Explore as Public Guest</span>
        </button>
      </header>

      {/* Main Login Card Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Brand Header */}
          <div className="p-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="inline-block bg-white p-3 rounded-xl border border-slate-200 shadow-xs mb-3">
              <img
                src="/assets/aistudio/image_bfec73ab.png"
                alt="Turag Garments And Hosiery Limited"
                className="h-10 w-auto object-contain mx-auto"
              />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select or enter your credentials to open your assigned interface.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                User ID / Username
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or mgr_sewing"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Case sensitive
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer"
            >
              <span>Authenticate & Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick One-Click Credentials Library */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-500" />
                  <span>Quick Access Roles (From Password Library)</span>
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  Click to Test
                </span>
              </div>

              <div className="space-y-1.5">
                {/* Admin Quick Login */}
                <button
                  type="button"
                  onClick={() => {
                    const adminUser = users.find((u) => u.role === 'admin') || users[0];
                    handleQuickSelect(adminUser);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                        Chief Administrator (Admin Panel)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.2">
                        User: admin · Pass: admin2026! · Full Editing & User Library
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    Login
                  </span>
                </button>

                {/* Manager Quick Login */}
                <button
                  type="button"
                  onClick={() => {
                    const managerUser = users.find((u) => u.role === 'manager') || users[2];
                    handleQuickSelect(managerUser);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700">
                        Md. Arif Hossain (Sewing Dept Manager)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.2">
                        User: mgr_sewing · Pass: sewing2026 · Reporting Line Updates
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                    Login
                  </span>
                </button>

                {/* Public Viewer Quick Login */}
                <button
                  type="button"
                  onClick={() => {
                    const viewerUser = users.find((u) => u.role === 'public_viewer') || users[users.length - 1];
                    handleQuickSelect(viewerUser);
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700">
                        General Employee (Public Preview)
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.2">
                        User: viewer · Pass: viewer123 · Read-Only Hierarchy Explorer
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Login
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-center flex items-center justify-between text-xs text-slate-500">
        <div>
          © 2026 <strong>Turag Garments And Hosiery Limited</strong> · Garments Operating System (GOS)
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span>Learning Centre/Schedule-5Org.S</span>
          <span>•</span>
          <span>Approved by Board of Directors</span>
        </div>
      </footer>
    </div>
  );
};
