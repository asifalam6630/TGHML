/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrgNodeData, ManpowerAreaSummary, EmployeeBand } from '../types/organogram';

/**
 * Parses headcount strings like "1", "1-8", "231", "1-29", "2-25" into numeric min and max
 */
export function parseHeadcountRange(headcountStr?: string): { min: number; max: number } {
  if (!headcountStr) return { min: 1, max: 1 };

  const cleaned = headcountStr.trim();

  // Match range like "1-8" or "2-25" or "1-231"
  const rangeMatch = cleaned.match(/^(\d+)\s*[-–—]\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return { min: isNaN(min) ? 1 : min, max: isNaN(max) ? 1 : max };
  }

  // Match single number like "231" or "100 Jr. Operator"
  const singleMatch = cleaned.match(/^(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    const num = isNaN(val) ? 1 : val;
    return { min: num, max: num };
  }

  return { min: 1, max: 1 };
}

/**
 * Calculates area-wise manpower summary from nodes
 */
export function calculateManpowerSummaries(nodes: OrgNodeData[]): {
  areaSummaries: ManpowerAreaSummary[];
  totalMin: number;
  totalMax: number;
  totalRoles: number;
  bandTotals: Record<EmployeeBand, { min: number; max: number }>;
  managementTotal: { min: number; max: number };
  operationalTotal: { min: number; max: number };
} {
  const deptMap = new Map<string, OrgNodeData[]>();

  nodes.forEach((n) => {
    const list = deptMap.get(n.department) || [];
    list.push(n);
    deptMap.set(n.department, list);
  });

  const areaSummaries: ManpowerAreaSummary[] = [];

  let grandTotalMin = 0;
  let grandTotalMax = 0;

  const bandTotals: Record<EmployeeBand, { min: number; max: number }> = {
    'GM Band': { min: 0, max: 0 },
    'Manager Band': { min: 0, max: 0 },
    'Executive Band': { min: 0, max: 0 },
    'Officer Band': { min: 0, max: 0 },
    'Operator Band': { min: 0, max: 0 },
  };

  deptMap.forEach((deptNodes, deptName) => {
    let deptMin = 0;
    let deptMax = 0;
    let gm = 0;
    let mgr = 0;
    let exec = 0;
    let off = 0;
    let op = 0;

    const subDeptsSet = new Set<string>();

    // Sort by levelNumber to find the leader
    const sorted = [...deptNodes].sort((a, b) => a.levelNumber - b.levelNumber);
    const leader = sorted[0];

    deptNodes.forEach((n) => {
      const { min, max } = parseHeadcountRange(n.headcount);
      deptMin += min;
      deptMax += max;

      if (bandTotals[n.band]) {
        bandTotals[n.band].min += min;
        bandTotals[n.band].max += max;
      }

      if (n.band === 'GM Band') gm += max;
      else if (n.band === 'Manager Band') mgr += max;
      else if (n.band === 'Executive Band') exec += max;
      else if (n.band === 'Officer Band') off += max;
      else if (n.band === 'Operator Band') op += max;

      if (n.subDepartment) {
        subDeptsSet.add(n.subDepartment);
      }
    });

    grandTotalMin += deptMin;
    grandTotalMax += deptMax;

    areaSummaries.push({
      department: deptName,
      rolesCount: deptNodes.length,
      totalHeadcountMin: deptMin,
      totalHeadcountMax: deptMax,
      gmCount: gm,
      managerCount: mgr,
      execCount: exec,
      officerCount: off,
      operatorCount: op,
      keyLeader: leader ? `${leader.title}${leader.name ? ` (${leader.name})` : ''}` : undefined,
      phone: leader?.phone,
      subDepartments: Array.from(subDeptsSet),
    });
  });

  // Sort departments by manpower count descending
  areaSummaries.sort((a, b) => b.totalHeadcountMax - a.totalHeadcountMax);

  // Management is GM + Manager + Exec + Officer
  const managementTotal = {
    min: bandTotals['GM Band'].min + bandTotals['Manager Band'].min + bandTotals['Executive Band'].min + bandTotals['Officer Band'].min,
    max: bandTotals['GM Band'].max + bandTotals['Manager Band'].max + bandTotals['Executive Band'].max + bandTotals['Officer Band'].max,
  };

  const operationalTotal = {
    min: bandTotals['Operator Band'].min,
    max: bandTotals['Operator Band'].max,
  };

  return {
    areaSummaries,
    totalMin: grandTotalMin,
    totalMax: grandTotalMax,
    totalRoles: nodes.length,
    bandTotals,
    managementTotal,
    operationalTotal,
  };
}
