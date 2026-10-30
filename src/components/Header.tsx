/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserAccount, UserRole, OrgDataset } from '../types/organogram';
import { 
  ShieldCheck, 
  Shield,
  ShieldAlert,
  Eye, 
  UploadCloud, 
  FileText, 
  GitFork, 
  Grid, 
  Table, 
  Download,
  RotateCcw,
  HardDrive,
  Key,
  KeyRound,
  Users,
  LogOut,
  BarChart3
} from 'lucide-react';

interface HeaderProps {
  currentDataset: OrgDataset;
  allDatasets: OrgDataset[];
  onSelectDataset: (datasetId: string) => void;
  activeView: 'tree' | 'departments' | 'table' | 'manpower' | 'jd_management';
  onChangeView: (view: 'tree' | 'departments' | 'table' | 'manpower' | 'jd_management') => void;
  currentUser: UserAccount;
  onOpenLogin: () => void;
  onSignOut: () => void;
  onOpenUserLibrary: () => void;
  onOpenAuditLogs: () => void;
  onOpenChangePassword: () => void;
  onOpenGoogleDrive: () => void;
  onOpenUpload: () => void;
  onOpenPdfViewer: () => void;
  onExportCsv: () => void;
  onResetOrg: () => void;
  unauthorizedAttemptsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  allDatasets,
  onSelectDataset,
  activeView,
  onChangeView,
  currentUser,
  onOpenLogin,
  onSignOut,
  onOpenUserLibrary,
  onOpenAuditLogs,
  onOpenChangePassword,
  onOpenGoogleDrive,
  onOpenUpload,
  onOpenPdfViewer,
  onExportCsv,
  onResetOrg,
  unauthorizedAttemptsCount = 0,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="h-[68px] px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 z-30 shadow-xs font-sans">
      {/* Zone 1: Company Logo & Wordmark (Top Bar Contract Zone 1) */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="/" 
          className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 whitespace-nowrap group"
        >
          {/* Company Logo Image */}
          <div className="h-8 px-2 py-0.5 bg-white rounded border border-slate-200 flex items-center justify-center shadow-2xs">
            <img
              src="/assets/aistudio/image_bfec73ab.png"
              alt="TURAG Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
              Turag Garments & Hosiery Ltd.
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Organogram & Manpower Portal
            </span>
          </div>
        </a>

        {/* Dataset Switcher Dropdown */}
        <div className="hidden xl:flex items-center pl-3 border-l border-slate-200 dark:border-slate-800">
          <select
            value={currentDataset.id}
            onChange={(e) => onSelectDataset(e.target.value)}
            aria-label="Select organization structure"
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md px-2 py-1 border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-hidden max-w-[220px] truncate"
          >
            {allDatasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Single-line controls) */}
      <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {/* Manpower Summary Tab - Accessible to BOTH panels */}
        <button
          type="button"
          onClick={() => onChangeView('manpower')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'manpower'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400'
          }`}
          title="Consolidated Manpower Structure & Headcounts across all areas"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Manpower Summary</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('tree')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'tree'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Interactive Tree</span>
        </button>

        {/* Centralized JD Management Tab */}
        <button
          type="button"
          onClick={() => onChangeView('jd_management')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'jd_management'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Job Description (JD) Management, 7-Tier Distribution & PDF Governance"
        >
          <FileText className="w-3.5 h-3.5 text-red-500" />
          <span>JD Management</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('departments')}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'departments'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Department Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('table')}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'table'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Roster Table</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Login / Admin Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Security Audit Logs (ADMIN ONLY) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
            title="View Security & Operational Audit Log (Admin Only)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Audit Logs</span>
            {unauthorizedAttemptsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            )}
          </button>
        )}

        {/* User ID & Password Library (ADMIN ONLY) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenUserLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            title="Manage User ID and Password Library (Admin Only)"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Password Library</span>
          </button>
        )}

        {/* Google Drive File Location Loader (ADMIN ONLY) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenGoogleDrive}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
            title="Connect & load organogram file from Google Drive (Admin Only)"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Google Drive</span>
          </button>
        )}

        {/* PDF Reference Viewer (ADMIN ONLY) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenPdfViewer}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            title="Inspect source PDF attachments (Admin Only)"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span>Source PDF</span>
          </button>
        )}

        {/* Upload File (Admin only) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenUpload}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            title="Upload PDF or Visio file"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload</span>
          </button>
        )}

        {/* Export CSV */}
        <button
          type="button"
          onClick={onExportCsv}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Export CSV Roster"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Reset Org to Default */}
        {isAdmin && (
          <button
            type="button"
            onClick={onResetOrg}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset to original structure"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* User Account Controls: Profile, Change Password, Logout */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
          {/* User Profile Chip */}
          <button
            type="button"
            onClick={onOpenLogin}
            className={`flex items-center gap-2 pl-2.5 pr-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              isAdmin
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : currentUser.role === 'manager'
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
            title="Switch User Account"
          >
            {isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : currentUser.role === 'manager' ? (
              <Shield className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <Users className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="truncate max-w-[80px] font-mono">
              {currentUser.userId}
            </span>
          </button>

          {/* Change My Password Button (For ALL Users) */}
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Change My Password"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* Explicit Logout Button with Text on desktop */}
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 rounded-lg transition-colors cursor-pointer"
            title="Sign Out / Logout to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
