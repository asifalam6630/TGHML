/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { OrgNodeData, UserRole, EmployeeBand } from '../types/organogram';
import { BAND_COLORS } from '../data/afwlOrgData';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Plus, 
  Phone, 
  CornerDownRight, 
  Building2,
  ExternalLink
} from 'lucide-react';

interface RosterTableViewProps {
  nodes: OrgNodeData[];
  userRole: UserRole;
  onEditNode: (node: OrgNodeData) => void;
  onAddChild: (parentNode: OrgNodeData) => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: OrgNodeData) => void;
  onFocusInTree: (node: OrgNodeData) => void;
}

export const RosterTableView: React.FC<RosterTableViewProps> = ({
  nodes,
  userRole,
  onEditNode,
  onAddChild,
  onDeleteNode,
  onSelectNode,
  onFocusInTree,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [bandFilter, setBandFilter] = useState('all');

  const isAdmin = userRole === 'admin';

  // Distinct departments
  const departments = useMemo(() => {
    return Array.from(new Set(nodes.map((n) => n.department))).sort();
  }, [nodes]);

  // Lookup map for parent manager names
  const nodeMap = useMemo(() => {
    const map = new Map<string, OrgNodeData>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return nodes.filter((n) => {
      const matchQuery =
        !query ||
        n.title.toLowerCase().includes(query) ||
        (n.name && n.name.toLowerCase().includes(query)) ||
        n.department.toLowerCase().includes(query) ||
        (n.phone && n.phone.includes(query)) ||
        (n.subDepartment && n.subDepartment.toLowerCase().includes(query));

      const matchDept = deptFilter === 'all' || n.department === deptFilter;
      const matchBand = bandFilter === 'all' || n.band === bandFilter;

      return matchQuery && matchDept && matchBand;
    });
  }, [nodes, searchQuery, deptFilter, bandFilter]);

  return (
    <div className="w-full h-[calc(100vh-68px)] overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Controls Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Band Filter */}
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Bands</option>
              <option value="GM Band">GM Band</option>
              <option value="Manager Band">Manager Band</option>
              <option value="Executive Band">Executive Band</option>
              <option value="Officer Band">Officer Band</option>
              <option value="Operator Band">Operator Band</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Showing {filteredNodes.length} of {nodes.length} records
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3 px-4">Role / Title</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Department & Wing</th>
                  <th className="py-3 px-4">Band & Level</th>
                  <th className="py-3 px-4 text-center">Headcount</th>
                  <th className="py-3 px-4">Reporting Manager</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredNodes.map((node) => {
                  const parent = node.reportsTo ? nodeMap.get(node.reportsTo) : null;
                  const bandStyle = BAND_COLORS[node.band] || BAND_COLORS['Officer Band'];

                  return (
                    <tr
                      key={node.id}
                      onClick={() => onSelectNode(node)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Title */}
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {node.title}
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                        {node.name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {node.department}
                        </span>
                        {node.subDepartment && (
                          <span className="block text-[10px] text-slate-500">
                            {node.subDepartment}
                          </span>
                        )}
                      </td>

                      {/* Band */}
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${bandStyle.badge}`}>
                          {node.band} (L{node.levelNumber})
                        </span>
                      </td>

                      {/* Headcount */}
                      <td className="py-2.5 px-4 text-center font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300">
                        {node.headcount || '1'}
                      </td>

                      {/* Reporting Manager */}
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {parent ? (
                          <div className="flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {parent.title} {parent.name ? `(${parent.name})` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Root Node (Top)</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {node.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{node.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onFocusInTree(node)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Focus in Hierarchy Tree"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => onAddChild(node)}
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                title="Add direct report"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onEditNode(node)}
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                                title="Edit role"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {node.reportsTo && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteNode(node.id)}
                                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Delete role"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
