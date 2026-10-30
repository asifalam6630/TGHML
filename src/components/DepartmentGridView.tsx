/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OrgNodeData, EmployeeBand } from '../types/organogram';
import { BAND_COLORS } from '../data/afwlOrgData';
import { ArrowRight, Users, Phone, Building2 } from 'lucide-react';

interface DepartmentGridViewProps {
  nodes: OrgNodeData[];
  onSelectDepartmentNode: (node: OrgNodeData) => void;
}

export const DepartmentGridView: React.FC<DepartmentGridViewProps> = ({
  nodes,
  onSelectDepartmentNode,
}) => {
  // Group nodes by department
  const departmentMap = React.useMemo(() => {
    const map = new Map<string, OrgNodeData[]>();
    nodes.forEach((n) => {
      const list = map.get(n.department) || [];
      list.push(n);
      map.set(n.department, list);
    });
    return map;
  }, [nodes]);

  const departments = Array.from(departmentMap.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <div className="w-full h-[calc(100vh-68px)] overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Department Overview & Operational Units</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Showing {departments.length} departments spanning factory operations, engineering, quality, and administrative services.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
            <span>Total Roles: <strong>{nodes.length}</strong></span>
          </div>
        </div>

        {/* Grid of Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map(([deptName, deptNodes]) => {
            // Find department head (lowest levelNumber or first manager)
            const head = [...deptNodes].sort((a, b) => a.levelNumber - b.levelNumber)[0];

            // Sub-departments
            const subDepts = Array.from(
              new Set(deptNodes.map((n) => n.subDepartment).filter(Boolean))
            ) as string[];

            // Count bands
            const bandCounts: Record<EmployeeBand, number> = {
              'GM Band': 0,
              'Manager Band': 0,
              'Executive Band': 0,
              'Officer Band': 0,
              'Operator Band': 0,
            };

            deptNodes.forEach((n) => {
              if (bandCounts[n.band] !== undefined) {
                bandCounts[n.band]++;
              }
            });

            return (
              <div
                key={deptName}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Department Name Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <span>{deptName}</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {deptNodes.length} roles
                    </span>
                  </div>

                  {/* Department Head Box */}
                  {head && (
                    <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Department Head
                      </span>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {head.title}
                      </div>
                      {head.name && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {head.name}
                        </div>
                      )}
                      {head.phone && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{head.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-departments if any */}
                  {subDepts.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Sub-Wings
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {subDepts.map((sub) => (
                          <span
                            key={sub}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Band Breakdown */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Personnel Bands
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {(Object.keys(bandCounts) as EmployeeBand[]).map((band) => {
                        const count = bandCounts[band];
                        if (count === 0) return null;
                        const bStyle = BAND_COLORS[band];
                        return (
                          <div
                            key={band}
                            className={`px-2 py-1 rounded flex items-center justify-between ${bStyle.badge}`}
                          >
                            <span className="truncate">{band.replace(' Band', '')}</span>
                            <span className="font-mono font-bold tabular-nums ml-1">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Drill Down Button */}
                <button
                  type="button"
                  onClick={() => head && onSelectDepartmentNode(head)}
                  className="w-full mt-2 py-2 px-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Focus in Hierarchy Tree</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
