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
  Key,
  KeyRound,
  Users,
  LogOut,
  BarChart3,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import turagLogo from '../assets/images/turag_logo.png';

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
  totalLogsCount?: number;
  currentTheme?: 'light' | 'dark' | 'system';
  onSelectTheme?: (theme: 'light' | 'dark' | 'system') => void;
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
  totalLogsCount = 0,
  currentTheme = 'light',
  onSelectTheme,
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="h-[58px] px-3 sm:px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 z-30 shadow-xs font-sans overflow-x-auto no-scrollbar">
      {/* Zone 1: Company Logo, Wordmark & Dataset Switcher (Left) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a 
          href="/" 
          className="flex items-center gap-2 text-slate-900 dark:text-slate-100 whitespace-nowrap group"
        >
          {/* Company Logo Image */}
          <div className="h-8 px-2 py-0.5 bg-white rounded border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
            <img
              src={turagLogo}
              alt="TURAG Logo"
              className="h-5.5 w-auto max-w-[95px] object-contain block"
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-slate-100 block">
              Turag Garments & Hosiery Ltd.
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Organogram & Operations
            </span>
          </div>
        </a>

        {/* Dataset Switcher Dropdown (Visible on all screens at 100% zoom) */}
        <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <select
            value={currentDataset.id}
            onChange={(e) => onSelectDataset(e.target.value)}
            aria-label="Select organization structure"
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-hidden max-w-[135px] md:max-w-[170px] truncate"
            title={`Active Dataset: ${currentDataset.name}`}
          >
            {allDatasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Navigation Tabs (All 5 visible at a glance at 100% zoom) */}
      <nav className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
        {/* Dashboard / Manpower Summary Tab */}
        <button
          type="button"
          onClick={() => onChangeView('manpower')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'manpower'
              ? 'bg-red-700 text-white shadow-2xs'
              : 'text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400'
          }`}
          title="Consolidated Manpower & Operations Dashboard"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        {/* Interactive Tree Tab */}
        <button
          type="button"
          onClick={() => onChangeView('tree')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'tree'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Interactive Hierarchical Organogram Tree"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Tree</span>
        </button>

        {/* JD Management Tab (Admin Only) */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onChangeView('jd_management')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'jd_management'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Job Description (JD) Management & 7-Tier Distribution (Admin Only)"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>JD Mgt</span>
          </button>
        )}

        {/* Department Matrix Tab (Visible at 100% zoom) */}
        <button
          type="button"
          onClick={() => onChangeView('departments')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'departments'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Department Matrix Grid View"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Matrix</span>
        </button>

        {/* Roster Table Tab (Visible at 100% zoom) */}
        <button
          type="button"
          onClick={() => onChangeView('table')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'table'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Complete Personnel Roster Table"
        >
          <Table className="w-3.5 h-3.5" />
          <span>Roster</span>
        </button>
      </nav>

      {/* Zone 3: Admin Tools, Theme Selector & User Controls (Right) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Security Audit Logs (ADMIN ONLY) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
            title="View Security & Operational Audit Log - Tracking all logins, changes, and access"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Audit Logs</span>
            {totalLogsCount > 0 && (
              <span className="px-1 py-0.2 rounded-full text-[10px] font-mono font-bold bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100">
                {totalLogsCount}
              </span>
            )}
            {unauthorizedAttemptsCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" title={`${unauthorizedAttemptsCount} blocked attempts`} />
            )}
          </button>
        )}

        {/* User ID & Password Library (ADMIN ONLY - Visible at 100% zoom) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenUserLibrary}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded hover:bg-indigo-100 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            title="Manage User ID and Password Library (Admin Only)"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Passwords</span>
          </button>
        )}

        {/* Upload File (Admin only - Visible at 100% zoom) */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            title="Upload PDF or Visio file"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
            <span>Upload</span>
          </button>
        )}

        {/* Export CSV (Always accessible) */}
        <button
          type="button"
          onClick={onExportCsv}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Export CSV Roster"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Reset Org to Default */}
        {isAdmin && (
          <button
            type="button"
            onClick={onResetOrg}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Reset to authentic default organogram structure"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* INTERACTIVE THEME SELECTOR (White / Light, Dark, System) */}
        <div 
          className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0"
          title="Theme Selector: Select Light (White), Dark, or System mode"
        >
          <button
            type="button"
            onClick={() => onSelectTheme?.('light')}
            className={`p-1 rounded transition-all cursor-pointer ${
              currentTheme === 'light'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Light Theme (White)"
            aria-label="Light Theme"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSelectTheme?.('dark')}
            className={`p-1 rounded transition-all cursor-pointer ${
              currentTheme === 'dark'
                ? 'bg-white dark:bg-slate-900 text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Dark Theme"
            aria-label="Dark Theme"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSelectTheme?.('system')}
            className={`p-1 rounded transition-all cursor-pointer ${
              currentTheme === 'system'
                ? 'bg-white dark:bg-slate-900 text-sky-500 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Follow System Theme"
            aria-label="System Theme"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Account Controls: Profile, Change Password, Logout */}
        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 dark:border-slate-800 shrink-0">
          {/* User Profile Chip */}
          <button
            type="button"
            onClick={onOpenLogin}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded transition-all border shrink-0 cursor-pointer ${
              isAdmin
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : currentUser.role === 'manager'
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
            title={`Active session: ${currentUser.name} (${currentUser.role.toUpperCase()}) - Click to switch user`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : currentUser.role === 'manager' ? (
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="font-mono text-[11px] truncate max-w-[65px]">
              {currentUser.userId}
            </span>
          </button>

          {/* Change My Password Button */}
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
            title="Change My Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          {/* Explicit Logout Button */}
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 rounded transition-colors cursor-pointer shrink-0"
            title="Sign Out to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
