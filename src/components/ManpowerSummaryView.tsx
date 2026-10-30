/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { OrgNodeData, EmployeeBand } from '../types/organogram';
import { calculateManpowerSummaries } from '../utils/manpowerCalculator';
import { BAND_COLORS } from '../data/afwlOrgData';
import { 
  Users, 
  Briefcase, 
  Layers, 
  TrendingUp, 
  Building2, 
  Phone, 
  Download, 
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';

interface ManpowerSummaryViewProps {
  nodes: OrgNodeData[];
  onSelectDepartmentInTree: (deptName: string) => void;
  isAdmin: boolean;
}

export const ManpowerSummaryView: React.FC<ManpowerSummaryViewProps> = ({
  nodes,
  onSelectDepartmentInTree,
  isAdmin,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const {
    areaSummaries,
    totalMin,
    totalMax,
    totalRoles,
    bandTotals,
    managementTotal,
    operationalTotal,
  } = useMemo(() => calculateManpowerSummaries(nodes), [nodes]);

  const filteredAreas = useMemo(() => {
    if (!searchFilter.trim()) return areaSummaries;
    const query = searchFilter.toLowerCase();
    return areaSummaries.filter(
      (a) =>
        a.department.toLowerCase().includes(query) ||
        (a.keyLeader && a.keyLeader.toLowerCase().includes(query)) ||
        a.subDepartments.some((s) => s.toLowerCase().includes(query))
    );
  }, [areaSummaries, searchFilter]);

  const handleExportSummaryCsv = () => {
    const headers = [
      'Department / Area',
      'Key Leader',
      'Contact',
      'Total Roles',
      'Headcount (Min)',
      'Headcount (Max)',
      'GM Band',
      'Manager Band',
      'Executive Band',
      'Officer Band',
      'Operator Band',
      '% of Total Force',
    ];

    const rows = areaSummaries.map((area) => {
      const pct = ((area.totalHeadcountMax / (totalMax || 1)) * 100).toFixed(1);
      return [
        `"${area.department}"`,
        `"${area.keyLeader || ''}"`,
        `"${area.phone || ''}"`,
        area.rolesCount,
        area.totalHeadcountMin,
        area.totalHeadcountMax,
        area.gmCount,
        area.managerCount,
        area.execCount,
        area.officerCount,
        area.operatorCount,
        `"${pct}%"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Turag_Manpower_Structure_Summary.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-[calc(100vh-68px)] overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Company Header with Logo */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-14 px-3 py-1 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
              <img
                src="/assets/aistudio/image_bfec73ab.png"
                alt="Turag Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                  Turag Garments And Hosiery Limited
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    Admin Mode Active
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Area-wise Manpower Structure & Headcount Summary
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Consolidated headcount strength across all 15 operational departments and management wings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportSummaryCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Manpower CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Factory Workforce */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Manpower Strength
              </span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {totalMin === totalMax ? totalMax : `${totalMin} - ${totalMax}`}
              </span>
              <span className="text-xs text-slate-500">Personnel</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Across <strong className="font-mono text-slate-700 dark:text-slate-300">{totalRoles}</strong> distinct hierarchy roles
            </div>
          </div>

          {/* Card 2: Production / Floor Operators */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Floor Operations & Labor
              </span>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {operationalTotal.min === operationalTotal.max
                  ? operationalTotal.max
                  : `${operationalTotal.min} - ${operationalTotal.max}`}
              </span>
              <span className="text-xs text-slate-500">Operators & Assistants</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              <strong className="text-slate-700 dark:text-slate-300 font-mono">
                {totalMax > 0 ? ((operationalTotal.max / totalMax) * 100).toFixed(0) : 0}%
              </strong> of total factory workforce
            </div>
          </div>

          {/* Card 3: Management & Supervisory Staff */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Staff & Supervision
              </span>
              <div className="p-2 bg-sky-50 dark:bg-sky-950/60 rounded-lg text-sky-600 dark:text-sky-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {managementTotal.min === managementTotal.max
                  ? managementTotal.max
                  : `${managementTotal.min} - ${managementTotal.max}`}
              </span>
              <span className="text-xs text-slate-500">Staff Members</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              GM, Managers, Executives & Officers
            </div>
          </div>

          {/* Card 4: Operating Units */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Functional Departments
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                {areaSummaries.length}
              </span>
              <span className="text-xs text-slate-500">Operational Areas</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Sewing, Cutting, Quality, Maintenance...
            </div>
          </div>
        </div>

        {/* Employee Band Breakdown Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Manpower Breakdown by Employee Band
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              100% Factory Allocation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['GM Band', 'Manager Band', 'Executive Band', 'Officer Band', 'Operator Band'] as EmployeeBand[]).map(
              (band) => {
                const bStyle = BAND_COLORS[band];
                const count = bandTotals[band];
                const pct = totalMax > 0 ? ((count.max / totalMax) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={band}
                    className={`p-3 rounded-lg border ${bStyle.border} ${bStyle.bg} flex flex-col justify-between`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-600 dark:text-slate-300">
                        {band}
                      </span>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
                        {count.min === count.max ? count.max : `${count.min}-${count.max}`}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-inherit flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Ratio</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Area-by-Area Manpower Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter area by department, leader..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-56 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono tabular-nums">
              Showing {filteredAreas.length} of {areaSummaries.length} Areas
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-3 px-4">Area / Department</th>
                  <th className="py-3 px-4">Department Leader</th>
                  <th className="py-3 px-4 text-center">Roles</th>
                  <th className="py-3 px-3 text-center">GM</th>
                  <th className="py-3 px-3 text-center">Manager</th>
                  <th className="py-3 px-3 text-center">Executive</th>
                  <th className="py-3 px-3 text-center">Officer</th>
                  <th className="py-3 px-3 text-center">Operator</th>
                  <th className="py-3 px-4 text-right">Total Manpower</th>
                  <th className="py-3 px-4 text-right">% Factory</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAreas.map((area) => {
                  const pct = totalMax > 0 ? ((area.totalHeadcountMax / totalMax) * 100).toFixed(1) : '0';

                  return (
                    <tr
                      key={area.department}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Department Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {area.department}
                        </div>
                        {area.subDepartments.length > 0 && (
                          <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                            {area.subDepartments.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Leader */}
                      <td className="py-3 px-4">
                        {area.keyLeader ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {area.keyLeader}
                            </div>
                            {area.phone && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{area.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not Assigned</span>
                        )}
                      </td>

                      {/* Roles */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {area.rolesCount}
                      </td>

                      {/* GM */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-amber-700 dark:text-amber-300 font-semibold">
                        {area.gmCount || '-'}
                      </td>

                      {/* Manager */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-orange-700 dark:text-orange-300 font-semibold">
                        {area.managerCount || '-'}
                      </td>

                      {/* Executive */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-sky-700 dark:text-sky-300 font-semibold">
                        {area.execCount || '-'}
                      </td>

                      {/* Officer */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-emerald-700 dark:text-emerald-300 font-semibold">
                        {area.officerCount || '-'}
                      </td>

                      {/* Operator */}
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                        {area.operatorCount || '-'}
                      </td>

                      {/* Total Headcount */}
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 text-sm">
                        {area.totalHeadcountMin === area.totalHeadcountMax
                          ? area.totalHeadcountMax
                          : `${area.totalHeadcountMin} - ${area.totalHeadcountMax}`}
                      </td>

                      {/* % Force */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {pct}%
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectDepartmentInTree(area.department)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>View Tree</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
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
