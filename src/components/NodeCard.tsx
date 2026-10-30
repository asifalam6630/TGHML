/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HierarchyNode, UserRole } from '../types/organogram';
import { BAND_COLORS } from '../data/afwlOrgData';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Users, 
  GripVertical, 
  CornerDownRight 
} from 'lucide-react';
import { CARD_WIDTH, CARD_HEIGHT } from '../utils/treeUtils';

interface NodeCardProps {
  node: HierarchyNode;
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: (nodeId: string) => void;
  onEditNode: (node: HierarchyNode) => void;
  onAddChild: (parentNode: HierarchyNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: HierarchyNode) => void;
  onDragStart?: (e: React.DragEvent, node: HierarchyNode) => void;
  onDragOver?: (e: React.DragEvent, node: HierarchyNode) => void;
  onDragLeave?: (e: React.DragEvent, node: HierarchyNode) => void;
  onDrop?: (e: React.DragEvent, targetNode: HierarchyNode) => void;
  isDragTarget?: boolean;
  isSearchMatch?: boolean;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  userRole,
  isCollapsed,
  onToggleCollapse,
  onEditNode,
  onAddChild,
  onDeleteNode,
  onSelectNode,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragTarget = false,
  isSearchMatch = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const bandStyle = BAND_COLORS[node.band] || BAND_COLORS['Officer Band'];
  const hasChildren = node.children && node.children.length > 0;
  const isAdmin = userRole === 'admin';

  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
      }}
      draggable={isAdmin}
      onDragStart={(e) => onDragStart && onDragStart(e, node)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver && onDragOver(e, node);
      }}
      onDragLeave={(e) => onDragLeave && onDragLeave(e, node)}
      onDrop={(e) => {
        e.preventDefault();
        onDrop && onDrop(e, node);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectNode(node)}
      className={`group cursor-pointer select-none rounded-lg border text-left transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs ${
        bandStyle.bg
      } ${
        isDragTarget
          ? 'ring-3 ring-indigo-500 scale-105 border-indigo-600 shadow-md bg-indigo-50/90'
          : isSearchMatch
          ? 'ring-2 ring-amber-500 scale-102 border-amber-600'
          : bandStyle.border
      }`}
    >
      {/* Top Header Strip: Band Tag & Headcount */}
      <div
        className={`px-2.5 py-1 flex items-center justify-between border-b ${bandStyle.headerBg} border-inherit`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isAdmin && (
            <span title="Drag to reassign reporting structure" className="shrink-0 flex items-center">
              <GripVertical
                className="w-3 h-3 text-slate-500 opacity-40 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
              />
            </span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
            {node.subDepartment || node.department}
          </span>
        </div>

        {/* Headcount pill */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono tabular-nums ${bandStyle.badge}`}>
            {node.headcount || '1'}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-2.5 py-1.5 flex-1 flex flex-col justify-center min-w-0">
        {/* Title / Role */}
        <div className="font-semibold text-xs leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
          {node.title}
        </div>

        {/* Name if available */}
        {node.name && (
          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5">
            {node.name}
          </div>
        )}

        {/* Phone / Subtext */}
        {node.phone ? (
          <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 truncate font-mono">
            <Phone className="w-2.5 h-2.5 shrink-0" />
            <span>{node.phone}</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {node.band}
          </div>
        )}
      </div>

      {/* Footer Strip: Direct Reports & Admin Action Buttons */}
      <div className="px-2 py-1 bg-white/70 dark:bg-slate-900/60 border-t border-inherit flex items-center justify-between min-h-[26px]">
        {/* Expand / Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(node.id);
            }}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title={isCollapsed ? 'Expand branch' : 'Collapse branch'}
          >
            {isCollapsed ? (
              <>
                <ChevronRight className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span className="font-mono tabular-nums">+{node.directReportsCount} reports</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-slate-500" />
                <span className="font-mono tabular-nums">{node.directReportsCount} reports</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 text-[9px] text-slate-500">
            <span>Direct</span>
          </div>
        )}

        {/* Admin Quick Action Controls */}
        {isAdmin && isHovered ? (
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onAddChild(node)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Add subordinate role"
            >
              <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={() => onEditNode(node)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Edit role details"
            >
              <Edit3 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            </button>
            {node.reportsTo && (
              <button
                type="button"
                onClick={() => onDeleteNode(node.id)}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 transition-colors"
                title="Delete role"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-[9px] text-slate-500 font-mono">
            L{node.levelNumber}
          </span>
        )}
      </div>
    </div>
  );
};
