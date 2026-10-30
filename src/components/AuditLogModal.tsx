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
  Filter, 
  LogIn, 
  LogOut, 
  Edit3, 
  Trash, 
  KeyRound, 
  Eye, 
  AlertTriangle,
  Clock
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
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  // Security guard: if someone non-admin tries to open this, reject view
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
            className="mt-4 px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        log.userId.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);

      const matchAction =
        actionFilter === 'ALL' ||
        (actionFilter === 'AUTH' && (log.action === 'LOGIN' || log.action === 'LOGOUT')) ||
        (actionFilter === 'EDIT' && (log.action === 'EDIT' || log.action === 'CREATE')) ||
        (actionFilter === 'DELETE' && log.action === 'DELETE') ||
        (actionFilter === 'SECURITY' && (log.action === 'UNAUTHORIZED_ATTEMPT' || log.action === 'PASSWORD_CHANGE'));

      return matchSearch && matchAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const unauthorizedCount = logs.filter((l) => l.action === 'UNAUTHORIZED_ATTEMPT').length;
  const editsCount = logs.filter((l) => l.action === 'EDIT' || l.action === 'CREATE').length;
  const deletesCount = logs.filter((l) => l.action === 'DELETE').length;

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
      case 'EDIT':
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
            <Edit3 className="w-3 h-3" />
            <span>{action}</span>
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200">
            <Trash className="w-3 h-3" />
            <span>DELETE</span>
          </span>
        );
      case 'UNAUTHORIZED_ATTEMPT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>BLOCKED ATTEMPT</span>
          </span>
        );
      case 'PASSWORD_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
            <KeyRound className="w-3 h-3" />
            <span>PASSWORD</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
            <Eye className="w-3 h-3" />
            <span>{action}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center">
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
                Tracking all logins, logouts, reporting structure edits, role deletions, and unauthorized access attempts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportAuditLogsToCsv(logs)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 shrink-0 text-xs">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Events</span>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {logs.length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-sky-600 font-semibold uppercase">Hierarchy Edits</span>
            <div className="text-base font-bold text-sky-700 dark:text-sky-300 font-mono mt-0.5">
              {editsCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-red-600 font-semibold uppercase">Role Deletions</span>
            <div className="text-base font-bold text-red-700 dark:text-red-300 font-mono mt-0.5">
              {deletesCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-rose-600 font-semibold uppercase">Blocked Attempts</span>
            <div className="text-base font-bold text-rose-700 dark:text-rose-300 font-mono mt-0.5">
              {unauthorizedCount}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user ID, action, details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActionFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  actionFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('AUTH')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  actionFilter === 'AUTH'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Login / Logout
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('EDIT')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  actionFilter === 'EDIT'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Edits
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('DELETE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  actionFilter === 'DELETE'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Deletes
              </button>
              <button
                type="button"
                onClick={() => setActionFilter('SECURITY')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  actionFilter === 'SECURITY'
                    ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Security & Passwords
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Showing {filteredLogs.length} events
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the audit log history?')) {
                  onClearLogs();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded"
              title="Clear log history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto">
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
                    log.action === 'UNAUTHORIZED_ATTEMPT' ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
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
                      ID: {log.userId} · <span className="uppercase">{log.userRole}</span>
                    </div>
                  </td>

                  {/* Details */}
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {log.details}
                  </td>

                  {/* Entity */}
                  <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.entityId ? (
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {log.entityId}
                      </span>
                    ) : (
                      <span>{log.entityType || '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
