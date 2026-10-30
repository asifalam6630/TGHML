/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  OrgNodeData, 
  UserRole, 
  JobDescription, 
  JDResolutionResult 
} from '../types/organogram';
import { BAND_COLORS } from '../data/afwlOrgData';
import { resolveApplicableJD } from '../data/jobDescriptions';
import { 
  X, 
  Edit3, 
  Plus, 
  Trash2, 
  Phone, 
  Users, 
  GitCommit, 
  ChevronRight, 
  Building2,
  Layers,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  User,
  ShieldAlert,
  Briefcase
} from 'lucide-react';

interface NodeDetailDrawerProps {
  node: OrgNodeData | null;
  allNodes: OrgNodeData[];
  allJDs: JobDescription[];
  userRole: UserRole;
  onClose: () => void;
  onEdit: (node: OrgNodeData) => void;
  onAddChild: (node: OrgNodeData) => void;
  onDelete: (nodeId: string) => void;
  onSelectAnotherNode: (node: OrgNodeData) => void;
  onOpenJDPdf: (jd: JobDescription, resolution: JDResolutionResult, node: OrgNodeData) => void;
  onAssignJD?: (node: OrgNodeData) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  allNodes,
  allJDs,
  userRole,
  onClose,
  onEdit,
  onAddChild,
  onDelete,
  onSelectAnotherNode,
  onOpenJDPdf,
  onAssignJD,
}) => {
  if (!node) return null;

  const isAdmin = userRole === 'admin';
  const bandStyle = BAND_COLORS[node.band] || BAND_COLORS['Officer Band'];

  // Calculate reporting chain (breadcrumbs from top to current)
  const reportingChain: OrgNodeData[] = [];
  const nodeMap = new Map<string, OrgNodeData>();
  allNodes.forEach((n) => nodeMap.set(n.id, n));

  let curr: OrgNodeData | undefined = node;
  while (curr) {
    reportingChain.unshift(curr);
    curr = curr.reportsTo ? nodeMap.get(curr.reportsTo) : undefined;
  }

  // Direct manager (parent)
  const directManager = node.reportsTo ? nodeMap.get(node.reportsTo) : null;

  // Find direct subordinates
  const directSubordinates = allNodes.filter((n) => n.reportsTo === node.id);

  // 7-Tier JD Priority Hierarchy Resolution
  const jdResolution: JDResolutionResult = resolveApplicableJD(node, allJDs);
  const assignedJD = jdResolution.assignedJD;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200 font-sans">
      
      {/* Drawer Header with Employee Brand & Title */}
      <div className={`p-6 border-b border-inherit ${bandStyle.headerBg}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${bandStyle.badge}`}>
                {node.band} · Level {node.levelNumber}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/10 text-slate-800 dark:text-slate-200">
                ID: {node.id}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {node.title}
            </h2>
            {node.name && (
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{node.name}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
        
        {/* Core Profile Information Grid: ID, Name, Title, Department, Brand, Manager */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Employee ID
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {node.id}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Brand / Business Entity
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {node.brand || 'Turag Activewear'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Department
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {node.department}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Sub-Department / Wing
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {node.subDepartment || 'General Operations'}
            </span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Direct Reporting Manager
            </span>
            {directManager ? (
              <button
                type="button"
                onClick={() => onSelectAnotherNode(directManager)}
                className="text-left font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between w-full"
              >
                <span>{directManager.title} {directManager.name ? `· ${directManager.name}` : ''}</span>
                <span className="text-[10px] font-mono text-slate-400">Level {directManager.levelNumber}</span>
              </button>
            ) : (
              <span className="text-slate-500 italic">None (Supreme Governance / Root Node)</span>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Headcount Strength
            </span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
              {node.headcount || '1 Person'}
            </span>
          </div>

          {node.phone && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Direct Contact
              </span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {node.phone}
              </span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* DEDICATED JOB DESCRIPTION (JD) MANAGEMENT SECTION             */}
        {/* ============================================================== */}
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-700 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-600/30 text-red-400 border border-red-500/40">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Job Description (JD) Module
                </span>
                <span className="text-[10px] text-slate-400">
                  7-Tier Priority Distribution Engine
                </span>
              </div>
            </div>

            {assignedJD && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                jdResolution.isConflict
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {jdResolution.priorityLabel.split(':')[0]}
              </span>
            )}
          </div>

          {/* Assigned JD Details or Empty Notice */}
          {assignedJD ? (
            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-red-400">
                    {assignedJD.code}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Ver {assignedJD.currentVersion}
                  </span>
                </div>
                <div className="font-bold text-slate-100 text-xs leading-snug">
                  {assignedJD.title}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {assignedJD.summary}
                </p>

                {/* Priority Rule Explanation */}
                <div className="mt-2.5 pt-2 border-t border-slate-700/80 flex items-start gap-1.5 text-[10px]">
                  {jdResolution.isConflict ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-slate-300">
                    <strong>{jdResolution.priorityLabel}:</strong> {jdResolution.ruleDescription}
                  </span>
                </div>
              </div>

              {/* Dedicated View JD Button */}
              <button
                type="button"
                onClick={() => onOpenJDPdf(assignedJD, jdResolution, node)}
                className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-red-200 group-hover:scale-110 transition-transform" />
                <span>View Job Description (JD) PDF</span>
                <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700 text-center space-y-2">
              <FileQuestion className="w-6 h-6 text-slate-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-300">
                  No Job Description Assigned
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                  No matching JD found across Individual, Brand, Department, or Designation tiers.
                </p>
              </div>

              {isAdmin && onAssignJD && (
                <button
                  type="button"
                  onClick={() => onAssignJD(node)}
                  className="mt-1 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload / Assign JD</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reporting Line Hierarchy Chain */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Reporting Hierarchy Lineage
          </span>
          <div className="space-y-1.5 border-l-2 border-indigo-200 dark:border-indigo-800 ml-2 pl-3">
            {reportingChain.map((item) => {
              const isCurrent = item.id === node.id;
              return (
                <div
                  key={item.id}
                  onClick={() => !isCurrent && onSelectAnotherNode(item)}
                  className={`text-xs flex items-center justify-between py-1 px-2 rounded transition-colors ${
                    isCurrent
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="truncate max-w-[240px]">
                    {item.title} {item.name ? `· ${item.name}` : ''}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    L{item.levelNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Subordinates List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Direct Subordinates ({directSubordinates.length})
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => onAddChild(node)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Subordinate</span>
              </button>
            )}
          </div>

          {directSubordinates.length > 0 ? (
            <div className="space-y-1.5">
              {directSubordinates.map((sub) => {
                const subBandStyle = BAND_COLORS[sub.band] || BAND_COLORS['Officer Band'];
                return (
                  <div
                    key={sub.id}
                    onClick={() => onSelectAnotherNode(sub)}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {sub.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sub.name || sub.subDepartment || sub.department}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${subBandStyle.badge}`}>
                        {sub.headcount || '1'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No direct reports configured under this role.
            </p>
          )}
        </div>

        {/* Notes */}
        {node.notes && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Operational Notes
            </span>
            <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              {node.notes}
            </p>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions (Admin Only) */}
      {isAdmin && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              onClick={() => onAddChild(node)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Subordinate</span>
            </button>
          </div>

          {node.reportsTo && (
            <button
              type="button"
              onClick={() => {
                onDelete(node.id);
                onClose();
              }}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
              title="Delete Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
