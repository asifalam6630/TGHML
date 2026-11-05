/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from '../types/organogram';
import { 
  X, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Users,
  Building2,
  Key
} from 'lucide-react';
import turagLogo from '../assets/images/turag_logo.png';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
  currentUser: UserAccount;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  currentUser,
}) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const matched = users.find(
      (u) =>
        u.userId.toLowerCase() === userIdInput.trim().toLowerCase() &&
        u.password === passwordInput.trim()
    );

    if (!matched) {
      setErrorMsg('Invalid User ID or Password. Check credentials with System Admin.');
      return;
    }

    if (!matched.isActive) {
      setErrorMsg('This user account is currently suspended. Please contact HR Administration.');
      return;
    }

    // Update last login
    const updated = {
      ...matched,
      lastLogin: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    onLoginSuccess(updated);
    onClose();
  };

  const handleQuickLogin = (user: UserAccount) => {
    setUserIdInput(user.userId);
    setPasswordInput(user.password);
    setErrorMsg('');
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Company Branding */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Turag Logo */}
          <div className="inline-block bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-xs mb-3">
            <img
              src={turagLogo}
              alt="Turag Garments And Hosiery Limited"
              className="h-10 w-auto max-w-[150px] object-contain mx-auto block"
            />
          </div>

          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Turag Garments And Hosiery Limited
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organogram & Manpower Management Portal
          </p>
        </div>

        {/* Login Form */}
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
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
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
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Test Logins */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Test Credentials (From Password Library)
            </span>
            <div className="space-y-1.5">
              {users.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="w-full text-left p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                        {u.name}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        User: {u.userId} · Pass: {u.password}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                    Auto-Fill
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
