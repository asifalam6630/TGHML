/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole } from '../types/organogram';
import { X, ShieldCheck, Eye, Check } from 'lucide-react';

interface LoginRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const LoginRoleModal: React.FC<LoginRoleModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Role-Based Access Control (RBAC)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your operating mode. Admins have complete control to upload diagrams, edit reporting structures in real-time, and reassign personnel. Public previewers have read-only access.
          </p>

          <div className="space-y-3">
            {/* Admin Option */}
            <div
              onClick={() => {
                onSelectRole('admin');
                onClose();
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                currentRole === 'admin'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Admin & Manager Mode</span>
                    {currentRole === 'admin' && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-indigo-600 text-white rounded font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Upload PDF / Visio, drag-to-reassign reporting managers, edit headcount, add sub-departments, and delete roles.
                  </p>
                </div>
              </div>
              {currentRole === 'admin' && <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />}
            </div>

            {/* Public Viewer Option */}
            <div
              onClick={() => {
                onSelectRole('public_viewer');
                onClose();
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                currentRole === 'public_viewer'
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Public Preview (Viewer Mode)</span>
                    {currentRole === 'public_viewer' && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-600 text-white rounded font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Explore interactive hierarchy tree, expand/collapse branches, search roles, view department breakdowns, and review source PDF diagrams.
                  </p>
                </div>
              </div>
              {currentRole === 'public_viewer' && (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
