/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OrgNodeData, UserRole } from '../types/organogram';
import { BAND_COLORS } from '../data/afwlOrgData';
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
  ArrowRight
} from 'lucide-react';

interface NodeDetailDrawerProps {
  node: OrgNodeData | null;
  allNodes: OrgNodeData[];
  userRole: UserRole;
  onClose: () => void;
  onEdit: (node: OrgNodeData) => void;
  onAddChild: (node: OrgNodeData) => void;
  onDelete: (nodeId: string) => void;
  onSelectAnotherNode: (node: OrgNodeData) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  allNodes,
  userRole,
  onClose,
  onEdit,
  onAddChild,
  onDelete,
  onSelectAnotherNode,
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

  // Find direct subordinates
  const directSubordinates = allNodes.filter((n) => n.reportsTo === node.id);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className={`p-6 border-b border-inherit ${bandStyle.headerBg}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 ${bandStyle.badge}`}>
              {node.band} · Level {node.levelNumber}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {node.title}
            </h2>
            {node.name && (
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {node.name}
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
        {/* Department Info */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
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
              Sub-Department
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {node.subDepartment || 'General Wing'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Headcount Strength
            </span>
            <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {node.headcount || '1 Person'}
            </span>
          </div>
          {node.phone && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Direct Contact
              </span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {node.phone}
              </span>
            </div>
          )}
        </div>

        {/* Reporting Line Hierarchy Chain */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Reporting Hierarchy Lineage
          </span>
          <div className="space-y-1.5 border-l-2 border-indigo-200 dark:border-indigo-800 ml-2 pl-3">
            {reportingChain.map((item, idx) => {
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
