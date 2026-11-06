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
  Users
} from 'lucide-react';
import garmentBg from '../assets/images/garment_factory_bg_1793817389611.jpg';
import turagLogo from '../assets/images/turag_logo.png';

interface LoginPageProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onGuestAccess: () => void;
  onFailedLogin?: (attemptedUserId: string, reason: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  onLogin,
  onGuestAccess,
  onFailedLogin,
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
      setErrorMsg('Invalid User ID or Password. Please verify your credentials or contact System Administration.');
      onFailedLogin?.(userIdInput.trim(), 'Failed login attempt with incorrect credentials');
      return;
    }

    if (!matched.isActive) {
      setErrorMsg('This user account is currently suspended. Please contact HR Administration.');
      onFailedLogin?.(userIdInput.trim(), 'Blocked login attempt on suspended account');
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

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans selection:bg-red-500 selection:text-white overflow-hidden">
      {/* Animated Garment Manufacturing Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <img
          src={garmentBg}
          alt="Garment Manufacturing Facility Background"
          className="w-full h-full object-cover animate-kenburns will-change-transform scale-105"
        />
        {/* Multi-layered darkening gradient overlay for high contrast and readability */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />
        <div className="absolute inset-0 bg-dot-slate opacity-25" />
      </div>

      {/* Top Banner */}
      <header className="h-16 px-6 border-b border-white/10 bg-slate-950/50 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 px-3 py-1 bg-white rounded-lg border border-white/20 flex items-center justify-center shadow-md shrink-0">
            <img
              src={turagLogo}
              alt="Turag Logo"
              className="h-6 w-auto max-w-[120px] object-contain block"
            />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white leading-none block drop-shadow-xs">
              Turag Garments And Hosiery Limited
            </span>
            <span className="text-[10px] text-slate-300 font-medium mt-0.5 block">
              Factory Organogram & Manpower Operations Portal
            </span>
          </div>
        </div>

        {/* Guest Preview Button in Header */}
        <button
          type="button"
          onClick={onGuestAccess}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors backdrop-blur-xs cursor-pointer shadow-xs"
        >
          <Users className="w-3.5 h-3.5 text-slate-300" />
          <span>Explore as Public Guest</span>
        </button>
      </header>

      {/* Main Login Card Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Brand Header */}
          <div className="p-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="inline-block bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs mb-3">
              <img
                src={turagLogo}
                alt="Turag Garments And Hosiery Limited"
                className="h-10 w-auto max-w-[160px] object-contain mx-auto block"
              />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your corporate credentials to access your assigned interface.
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
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-red-600 transition-all">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Enter User ID"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                  autoComplete="username"
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
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-red-600 transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-red-700 focus:ring-red-600 h-3.5 w-3.5"
                />
                <span>Remember on this device</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer active:scale-[0.99]"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Guest Access & Security Notice */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={onGuestAccess}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Continue as Public Guest (Read-Only Preview)</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Authorized personnel only. Access is monitored and audited.</span>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 border-t border-white/10 bg-slate-950/60 backdrop-blur-md flex items-center justify-center text-xs text-slate-400 z-10 text-center">
        <div>
          © 2026 <strong className="text-slate-300">Turag Garments And Hosiery Limited</strong> · Garments Operating System (GOS)
        </div>
      </footer>
    </div>
  );
};
