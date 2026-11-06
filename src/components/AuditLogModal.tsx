/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SystemAuditLog, AuditActionType } from '../types/organogram';
import { exportAuditLogsToCsv } from '../data/auditLog';
import { 
  X, 
  ShieldAlert, 
  Search, 
  Download, 
  Trash2, 
  LogIn, 
  LogOut, 
  Edit3, 
  Trash, 
  KeyRound, 
  Eye, 
  AlertTriangle,
  Clock,
  FileText,
  FileCheck2,
  UploadCloud,
  Layers,
  Users,
  CheckCircle2
} from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SystemAuditLog[];
  onClearLogs: () => void;
  isAdmin: boolean;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  isAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | 'AUTH' | 'CHANGES' | 'HIERARCHY' | 'JD' | 'SECURITY'>('ALL');

  if (!isOpen) return null;

  // Security guard: restricted strictly to Administrator
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-red-300 dark:border-red-800 text-center max-w-sm">
          <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Access Denied</h3>
          <p className="text-xs text-slate-500 mt-1">The Security & Audit Log is strictly restricted to the Administrator Panel.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter logs by search query and category
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.userId.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.entityType && log.entityType.toLowerCase().includes(q)) ||
        (log.entityId && log.entityId.toLowerCase().includes(q));

      const isAuthAction = log.action === 'LOGIN' || log.action === 'LOGOUT';
      const isHierarchyAction = log.action === 'EDIT' || log.action === 'CREATE' || log.action === 'DELETE';
      const isJDAction = 
        log.action === 'JD_UPLOAD' || 
        log.action === 'JD_ASSIGN' || 
        log.action === 'JD_UPDATE' || 
        log.action === 'JD_DELETE';
      const isSecurityAction = 
        log.action === 'UNAUTHORIZED_ATTEMPT' || 
        log.action === 'PASSWORD_CHANGE' || 
        log.action === 'USER_MANAGEMENT';

      const isChangeAction = 
        isHierarchyAction || 
        isJDAction || 
        log.action === 'PASSWORD_CHANGE' || 
        log.action === 'USER_MANAGEMENT';

      let matchAction = true;
      if (actionFilter === 'AUTH') {
        matchAction = isAuthAction;
      } else if (actionFilter === 'CHANGES') {
        matchAction = isChangeAction;
      } else if (actionFilter === 'HIERARCHY') {
        matchAction = isHierarchyAction;
      } else if (actionFilter === 'JD') {
        matchAction = isJDAction;
      } else if (actionFilter === 'SECURITY') {
        matchAction = isSecurityAction;
      }

      return matchSearch && matchAction;
    });
  }, [logs, searchQuery, actionFilter]);

  // Aggregate stats
  const loginsCount = useMemo(() => logs.filter((l) => l.action === 'LOGIN').length, [logs]);
  const changesCount = useMemo(() => logs.filter((l) => 
    l.action === 'EDIT' || 
    l.action === 'CREATE' || 
    l.action === 'DELETE' || 
    l.action === 'JD_UPLOAD' || 
    l.action === 'JD_ASSIGN' || 
    l.action === 'JD_UPDATE' || 
    l.action === 'JD_DELETE' || 
    l.action === 'USER_MANAGEMENT' || 
    l.action === 'PASSWORD_CHANGE'
  ).length, [logs]);
  const unauthorizedCount = useMemo(() => logs.filter((l) => l.action === 'UNAUTHORIZED_ATTEMPT').length, [logs]);

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
            <LogIn className="w-3 h-3" />
            <span>LOGIN</span>
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
            <LogOut className="w-3 h-3" />
            <span>LOGOUT</span>
          </span>
        );
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
            <Edit3 className="w-3 h-3" />
            <span>ROLE ADDED</span>
          </span>
        );
      case 'EDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
            <Edit3 className="w-3 h-3" />
            <span>MODIFIED</span>
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200">
            <Trash className="w-3 h-3" />
            <span>DELETED</span>
          </span>
        );
      case 'JD_UPLOAD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
            <UploadCloud className="w-3 h-3" />
            <span>JD UPLOAD</span>
          </span>
        );
      case 'JD_ASSIGN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200">
            <FileCheck2 className="w-3 h-3" />
            <span>JD ASSIGNED</span>
          </span>
        );
      case 'JD_UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
            <FileText className="w-3 h-3" />
            <span>JD MODIFIED</span>
          </span>
        );
      case 'JD_DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200">
            <Trash className="w-3 h-3" />
            <span>JD DELETED</span>
          </span>
        );
      case 'USER_MANAGEMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
            <Users className="w-3 h-3" />
            <span>USER LIB</span>
          </span>
        );
      case 'PASSWORD_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
            <KeyRound className="w-3 h-3" />
            <span>PASSWORD</span>
          </span>
        );
      case 'UNAUTHORIZED_ATTEMPT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>BLOCKED ATTEMPT</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Eye className="w-3 h-3" />
            <span>{action}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Security & Activity Audit Log
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                  Admin Panel Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited repository tracking all authentication events, user logins/logouts, interface modifications, and security exceptions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportAuditLogsToCsv(logs)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download audit records as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close Audit Log"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live KPI Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Recorded Events</span>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {logs.length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Logins Recorded</span>
            <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
              {loginsCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-sky-600 font-semibold uppercase tracking-wider">Interface Changes</span>
            <div className="text-base font-bold text-sky-700 dark:text-sky-300 font-mono mt-0.5">
              {changesCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">Blocked / Security Alerts</span>
            <div className="text-base font-bold text-rose-700 dark:text-rose-300 font-mono mt-0.5">
              {unauthorizedCount}
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user ID, action, details, entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            {/* Comprehensive Action Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActionFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  actionFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All Events ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('AUTH')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  actionFilter === 'AUTH'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Logins & Access ({loginsCount})
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('CHANGES')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  actionFilter === 'CHANGES'
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="All changes made to roles, reporting lines, JDs, or passwords"
              >
                Interface Changes ({changesCount})
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('HIERARCHY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  actionFilter === 'HIERARCHY'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Hierarchy Edits
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('JD')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  actionFilter === 'JD'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                JD Operations
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('SECURITY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  actionFilter === 'SECURITY'
                    ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Security & Passwords
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Showing {filteredLogs.length} of {logs.length}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the audit log history? This action cannot be undone.')) {
                  onClearLogs();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer transition-colors"
              title="Clear log history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                No matching audit logs found
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search keywords or switching filter categories above.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-4">User Account</th>
                  <th className="py-2.5 px-4">Details & Event Description</th>
                  <th className="py-2.5 px-4 text-right">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      log.action === 'UNAUTHORIZED_ATTEMPT' ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* User */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {log.userName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {log.userId} · <span className="uppercase font-semibold">{log.userRole}</span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      {log.details}
                    </td>

                    {/* Entity */}
                    <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.entityId ? (
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-semibold">
                          {log.entityId}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {log.entityType || 'SYSTEM'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
