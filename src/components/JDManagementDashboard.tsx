/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  JobDescription, 
  OrgNodeData, 
  UserRole, 
  JDScopeType,
  JDStatus
} from '../types/organogram';
import { 
  calculateJDStats, 
  getAffectedEmployeesCount, 
  resolveApplicableJD 
} from '../data/jobDescriptions';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Users, 
  Building2, 
  Briefcase, 
  Calendar, 
  Eye, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Download, 
  Grid, 
  Table as TableIcon,
  Sparkles,
  ArrowUpDown,
  Clock,
  Check,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface JDManagementDashboardProps {
  jds: JobDescription[];
  allNodes: OrgNodeData[];
  userRole: UserRole;
  onOpenUploadNew: () => void;
  onViewJDPdf: (jd: JobDescription) => void;
  onEditJD: (jd: JobDescription) => void;
  onDeleteJD: (jdId: string) => void;
  onSelectEmployeeInTree?: (node: OrgNodeData) => void;
}

export const JDManagementDashboard: React.FC<JDManagementDashboardProps> = ({
  jds,
  allNodes,
  userRole,
  onOpenUploadNew,
  onViewJDPdf,
  onEditJD,
  onDeleteJD,
  onSelectEmployeeInTree
}) => {
  const isAdmin = userRole === 'admin';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedScope, setSelectedScope] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('table');

  // Stats calculation
  const stats = useMemo(() => calculateJDStats(jds, allNodes), [jds, allNodes]);

  // Unique filter options
  const uniqueBrands = useMemo(() => {
    const set = new Set<string>();
    jds.forEach((j) => {
      if (j.brand) set.add(j.brand);
    });
    return Array.from(set);
  }, [jds]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    jds.forEach((j) => {
      if (j.department) set.add(j.department);
    });
    return Array.from(set).sort();
  }, [jds]);

  // Filtered JDs
  const filteredJDs = useMemo(() => {
    return jds.filter((jd) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = jd.title.toLowerCase().includes(q);
        const matchCode = jd.code.toLowerCase().includes(q);
        const matchDept = (jd.department || '').toLowerCase().includes(q);
        const matchEmpName = (jd.employeeName || '').toLowerCase().includes(q);
        const matchEmpId = (jd.employeeId || '').toLowerCase().includes(q);
        const matchDesig = (jd.designation || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDept && !matchEmpName && !matchEmpId && !matchDesig) {
          return false;
        }
      }

      // Brand
      if (selectedBrand !== 'ALL' && jd.brand && jd.brand !== selectedBrand && jd.brand !== 'All Brands') {
        return false;
      }

      // Department
      if (selectedDepartment !== 'ALL' && jd.department && jd.department !== selectedDepartment) {
        return false;
      }

      // Scope
      if (selectedScope !== 'ALL' && jd.scopeType !== selectedScope) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && jd.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [jds, searchQuery, selectedBrand, selectedDepartment, selectedScope, selectedStatus]);

  const getScopeBadge = (scopeType: JDScopeType) => {
    switch (scopeType) {
      case 'INDIVIDUAL':
        return {
          priority: 'Priority 1',
          name: 'Individual Override',
          bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
        };
      case 'BRAND_DEPT_DESIGNATION':
        return {
          priority: 'Priority 2',
          name: 'Brand + Dept + Role',
          bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
        };
      case 'DEPT_DESIGNATION':
        return {
          priority: 'Priority 3',
          name: 'Dept + Role Standard',
          bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
        };
      case 'BRAND':
        return {
          priority: 'Priority 4',
          name: 'Brand Charter',
          bg: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800'
        };
      case 'DEPARTMENT':
        return {
          priority: 'Priority 5',
          name: 'Department Charter',
          bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
        };
      case 'DESIGNATION':
        return {
          priority: 'Priority 6',
          name: 'Designation Wide',
          bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
        };
      case 'GENERAL':
      default:
        return {
          priority: 'Priority 7',
          name: 'Factory General Default',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        };
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Top Banner & Title Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 uppercase tracking-wider font-mono">
                HR Governance & Distribution Portal
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Turag Garments And Hosiery Limited
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1 flex items-center gap-2">
              <span>Centralized Job Description (JD) Management</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Standardized PDF document governance, 7-tier priority hierarchy resolution, brand-specific specifications, and individual employee custom overrides.
            </p>
          </div>

          {/* Action Button: Admin Only for Upload */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <button
                type="button"
                onClick={onOpenUploadNew}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload & Assign New JD</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>View-Only Mode (Admin controls upload & edits)</span>
              </div>
            )}
          </div>
        </div>

        {/* 8 Mandatory KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
          {/* 1. Total JDs */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 truncate">
              1. Total JDs
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {stats.totalJDs}
            </div>
            <span className="text-[10px] text-slate-500">Document Specs</span>
          </div>

          {/* 2. Active JDs */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5 truncate">
              2. Active JDs
            </span>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 font-mono">
              {stats.activeJDs}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Published in Force</span>
          </div>

          {/* 3. Department Coverage */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-0.5 truncate">
              3. Dept Coverage
            </span>
            <div className="text-xl font-black text-blue-800 dark:text-blue-200 font-mono">
              {stats.departmentCoveragePercent}%
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">
              {stats.coveredDepartmentsCount}/{stats.totalDepartmentsCount} Depts Covered
            </span>
          </div>

          {/* 4. Roles Coverage */}
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-0.5 truncate">
              4. Roles Coverage
            </span>
            <div className="text-xl font-black text-indigo-800 dark:text-indigo-200 font-mono">
              {stats.rolesCoveragePercent}%
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Designation Scope</span>
          </div>

          {/* 5. Individual Overrides */}
          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block mb-0.5 truncate">
              5. Priority 1 Overrides
            </span>
            <div className="text-xl font-black text-purple-800 dark:text-purple-200 font-mono">
              {stats.individualOverridesCount}
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400">Custom Person JDs</span>
          </div>

          {/* 6. Pending Approval */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5 truncate">
              6. Pending Review
            </span>
            <div className="text-xl font-black text-amber-800 dark:text-amber-200 font-mono">
              {stats.pendingApprovalCount}
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">Drafts / In Review</span>
          </div>

          {/* 7. Flagged Conflicts */}
          <div className={`p-3 rounded-xl border ${
            stats.conflictingJDsCount > 0 
              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800' 
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5 truncate">
              7. Conflicts Flagged
            </span>
            <div className={`text-xl font-black font-mono ${stats.conflictingJDsCount > 0 ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {stats.conflictingJDsCount}
            </div>
            <span className="text-[10px] text-slate-500">Tier Duplicate Guard</span>
          </div>

          {/* 8. Total Headcount Covered */}
          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-0.5 truncate">
              8. Active Headcount
            </span>
            <div className="text-xl font-black text-teal-800 dark:text-teal-200 font-mono">
              {stats.totalEmployeesCovered}
            </div>
            <span className="text-[10px] text-teal-600 dark:text-teal-400">Positions Mapped</span>
          </div>
        </div>

        {/* Conflict Warning Banner if any conflict detected */}
        {stats.conflictingJDsCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-lg flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Management Notice:</strong> {stats.conflictingJDsCount} employee positions match multiple Job Descriptions at identical priority tiers.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Admin review required to resolve ambiguity.
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by JD Title, Code, Role, or Employee Name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Scope / Priority Tier Filter */}
          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Priority Tiers (1 to 7)</option>
            <option value="INDIVIDUAL">Priority 1: Individual Override</option>
            <option value="BRAND_DEPT_DESIGNATION">Priority 2: Brand + Dept + Role</option>
            <option value="DEPT_DESIGNATION">Priority 3: Dept + Role Standard</option>
            <option value="BRAND">Priority 4: Brand-Specific Charter</option>
            <option value="DEPARTMENT">Priority 5: Department Charter</option>
            <option value="DESIGNATION">Priority 6: Designation Wide</option>
            <option value="GENERAL">Priority 7: Factory General Default</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {uniqueDepartments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Brands & Units</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active (Published)</option>
            <option value="pending_approval">Pending Review</option>
            <option value="inactive">Draft / Inactive</option>
          </select>
        </div>

        {/* View Switcher: Table vs Cards */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setViewLayout('table')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
              viewLayout === 'table'
                ? 'bg-red-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewLayout('grid')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
              viewLayout === 'grid'
                ? 'bg-red-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Card View"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {filteredJDs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matching Job Descriptions found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, scope filters, or upload a new Job Description specification.
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenUploadNew}
                className="mt-4 px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-lg hover:bg-red-800 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New JD</span>
              </button>
            )}
          </div>
        ) : viewLayout === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Code & Title</th>
                    <th className="py-3 px-4">Assignment Scope & Tier</th>
                    <th className="py-3 px-4">Brand / Entity</th>
                    <th className="py-3 px-4">Target Coverage</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4 text-center">Impact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredJDs.map((jd) => {
                    const badge = getScopeBadge(jd.scopeType);
                    const affectedCount = getAffectedEmployeesCount(jd, allNodes);
                    return (
                      <tr 
                        key={jd.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Title and Code */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-mono text-[11px] font-bold text-red-900 dark:text-red-400">
                            {jd.code}
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
                            {jd.title}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {jd.summary}
                          </div>
                        </td>

                        {/* Scope & Priority Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                            <span>{badge.priority}:</span>
                            <span>{badge.name}</span>
                          </span>
                        </td>

                        {/* Brand */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                          {jd.brand || 'All Brands'}
                        </td>

                        {/* Target Department / Designation / Individual */}
                        <td className="py-3 px-4 max-w-[200px]">
                          {jd.scopeType === 'INDIVIDUAL' ? (
                            <div>
                              <span className="font-bold text-purple-700 dark:text-purple-300 block">
                                {jd.employeeName || 'Individual Spec'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                ID: {jd.employeeId} ({jd.department})
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                                {jd.designation || 'All Roles'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {jd.department || 'Enterprise-Wide'}{jd.subDepartment ? ` · ${jd.subDepartment}` : ''}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Version */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {jd.currentVersion}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {jd.versions?.[0]?.effectiveDate || jd.updatedAt.split('T')[0]}
                          </span>
                        </td>

                        {/* Impact (Headcount count) */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded">
                            {affectedCount}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            jd.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : jd.status === 'pending_approval'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {jd.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewJDPdf(jd)}
                              className="px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="View PDF Document"
                            >
                              <FileText className="w-3.5 h-3.5 text-red-400" />
                              <span>View PDF</span>
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onEditJD(jd)}
                                  className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Edit / Reassign Scope"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteJD(jd.id)}
                                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                  title="Delete JD"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
        ) : (
          /* CARD / GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJDs.map((jd) => {
              const badge = getScopeBadge(jd.scopeType);
              const affectedCount = getAffectedEmployeesCount(jd, allNodes);
              return (
                <div 
                  key={jd.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-red-400 dark:hover:border-red-600 transition-all"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                        <span>{badge.priority}:</span>
                        <span>{badge.name}</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {jd.currentVersion}
                      </span>
                    </div>

                    <div className="font-mono text-xs font-bold text-red-800 dark:text-red-400">
                      {jd.code}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                      {jd.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {jd.summary}
                    </p>

                    {/* Metadata tags */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Brand / Entity:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{jd.brand || 'All Brands'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Department:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{jd.department || 'Enterprise'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Target Role:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{jd.designation || 'All Roles'}</strong>
                      </div>
                      {jd.employeeId && (
                        <div className="flex items-center justify-between text-purple-700 dark:text-purple-300 font-semibold">
                          <span>Override Holder:</span>
                          <span>{jd.employeeName || jd.employeeId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>{affectedCount}</strong> Mapped Headcount</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onEditJD(jd)}
                          className="p-1.5 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit JD"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onViewJDPdf(jd)}
                        className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
