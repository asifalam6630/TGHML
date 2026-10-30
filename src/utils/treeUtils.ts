/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HierarchyNode, OrgNodeData } from '../types/organogram';

export const CARD_WIDTH = 240;
export const CARD_HEIGHT = 110;
export const HORIZONTAL_SPACING = 36;
export const VERTICAL_SPACING = 72;

/**
 * Builds a hierarchical tree structure from a flat array of nodes.
 */
export function buildHierarchyTree(nodes: OrgNodeData[], collapsedIds: Set<string>): HierarchyNode[] {
  const nodeMap = new Map<string, HierarchyNode>();

  // Initialize nodes with hierarchy properties
  nodes.forEach((n) => {
    nodeMap.set(n.id, {
      ...n,
      children: [],
      directReportsCount: 0,
      totalTeamCount: 0,
      depth: 0,
      isCollapsed: collapsedIds.has(n.id),
    });
  });

  const roots: HierarchyNode[] = [];

  // Wire up parent-child relationships
  nodes.forEach((n) => {
    const current = nodeMap.get(n.id)!;
    if (n.reportsTo && nodeMap.has(n.reportsTo)) {
      const parent = nodeMap.get(n.reportsTo)!;
      parent.children.push(current);
    } else {
      roots.push(current);
    }
  });

  // Calculate depths and counts recursively
  function computeStats(node: HierarchyNode, depth: number): number {
    node.depth = depth;
    node.directReportsCount = node.children.length;
    let total = node.children.length;

    for (const child of node.children) {
      total += computeStats(child, depth + 1);
    }

    node.totalTeamCount = total;
    return total;
  }

  roots.forEach((root) => computeStats(root, 0));

  return roots;
}

/**
 * Computes coordinates for a clean top-to-bottom hierarchical layout
 */
export function computeVerticalLayout(
  roots: HierarchyNode[],
  collapsedIds: Set<string>
): { nodes: HierarchyNode[]; width: number; height: number } {
  const allPositionedNodes: HierarchyNode[] = [];
  let currentXOffset = 40;
  let maxDepth = 0;

  function measureSubtreeWidth(node: HierarchyNode): number {
    if (collapsedIds.has(node.id) || node.children.length === 0) {
      return CARD_WIDTH;
    }
    const childrenWidth = node.children.reduce((acc, child) => {
      return acc + measureSubtreeWidth(child);
    }, 0) + (node.children.length - 1) * HORIZONTAL_SPACING;

    return Math.max(CARD_WIDTH, childrenWidth);
  }

  function positionSubtree(node: HierarchyNode, left: number, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    const subtreeWidth = measureSubtreeWidth(node);
    const y = 50 + depth * (CARD_HEIGHT + VERTICAL_SPACING);

    if (collapsedIds.has(node.id) || node.children.length === 0) {
      node.x = left + (subtreeWidth - CARD_WIDTH) / 2;
      node.y = y;
      allPositionedNodes.push(node);
      return subtreeWidth;
    }

    // Position children side by side
    let childLeft = left;
    const childCenters: number[] = [];

    node.children.forEach((child) => {
      const cWidth = positionSubtree(child, childLeft, depth + 1);
      childCenters.push(childLeft + cWidth / 2);
      childLeft += cWidth + HORIZONTAL_SPACING;
    });

    // Parent is centered over its children
    const firstChildCenter = childCenters[0];
    const lastChildCenter = childCenters[childCenters.length - 1];
    const parentCenterX = (firstChildCenter + lastChildCenter) / 2;

    node.x = parentCenterX - CARD_WIDTH / 2;
    node.y = y;
    allPositionedNodes.push(node);

    return subtreeWidth;
  }

  roots.forEach((root) => {
    const rootWidth = positionSubtree(root, currentXOffset, 0);
    currentXOffset += rootWidth + HORIZONTAL_SPACING * 2;
  });

  const totalWidth = Math.max(1400, currentXOffset + 100);
  const totalHeight = Math.max(900, (maxDepth + 1) * (CARD_HEIGHT + VERTICAL_SPACING) + 200);

  return { nodes: allPositionedNodes, width: totalWidth, height: totalHeight };
}

/**
 * Checks if targetId is an ancestor or identical to nodeId, preventing circular reporting
 */
export function willCreateCycle(nodes: OrgNodeData[], nodeId: string, targetParentId: string): boolean {
  if (nodeId === targetParentId) return true;

  let curr: string | null = targetParentId;
  const visited = new Set<string>();

  while (curr) {
    if (curr === nodeId) return true;
    if (visited.has(curr)) break;
    visited.add(curr);

    const parentNode = nodes.find((n) => n.id === curr);
    curr = parentNode ? parentNode.reportsTo : null;
  }

  return false;
}

/**
 * Generate orthogonal SVG path from parent bottom center to child top center
 */
export function generateOrthogonalPath(
  parentX: number,
  parentY: number,
  childX: number,
  childY: number
): string {
  const pBottomX = parentX + CARD_WIDTH / 2;
  const pBottomY = parentY + CARD_HEIGHT;
  const cTopX = childX + CARD_WIDTH / 2;
  const cTopY = childY;

  const midY = pBottomY + (cTopY - pBottomY) / 2;

  // Path with smooth orthogonal corners
  return `M ${pBottomX} ${pBottomY} V ${midY} H ${cTopX} V ${cTopY}`;
}

/**
 * Export nodes to CSV format
 */
export function exportToCSV(nodes: OrgNodeData[], orgName: string): void {
  const headers = ['ID', 'Title', 'Name', 'Department', 'SubDepartment', 'Band', 'LevelNumber', 'Headcount', 'ReportsTo', 'Phone', 'Notes'];
  const rows = nodes.map((n) => [
    n.id,
    `"${(n.title || '').replace(/"/g, '""')}"`,
    `"${(n.name || '').replace(/"/g, '""')}"`,
    `"${(n.department || '').replace(/"/g, '""')}"`,
    `"${(n.subDepartment || '').replace(/"/g, '""')}"`,
    n.band,
    n.levelNumber,
    `"${n.headcount || ''}"`,
    n.reportsTo || '',
    `"${n.phone || ''}"`,
    `"${(n.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${orgName.replace(/\s+/g, '_')}_organogram.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
