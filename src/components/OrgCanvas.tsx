/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { HierarchyNode, UserRole, OrgNodeData } from '../types/organogram';
import { NodeCard } from './NodeCard';
import { 
  CARD_WIDTH, 
  CARD_HEIGHT, 
  generateOrthogonalPath, 
  computeVerticalLayout 
} from '../utils/treeUtils';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  ChevronsDown, 
  ChevronsUp,
  Building2,
  X,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Eye,
  Check
} from 'lucide-react';

interface OrgCanvasProps {
  roots: HierarchyNode[];
  allNodes?: OrgNodeData[];
  selectedDepartment?: string;
  onSelectDepartment?: (dept: string) => void;
  userRole: UserRole;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onEditNode: (node: HierarchyNode) => void;
  onAddChild: (parentNode: HierarchyNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: HierarchyNode) => void;
  onReassignParent: (nodeId: string, newParentId: string) => void;
}

/**
 * Filters the hierarchy tree so that only branches leading to or containing
 * the selected department are retained, hiding all other departments.
 */
function filterTreeByDepartment(
  nodes: HierarchyNode[],
  dept: string,
  isolateDeptHead: boolean = false
): HierarchyNode[] {
  if (!dept || dept === 'all') return nodes;

  const targetDeptLower = dept.toLowerCase().trim();

  // Helper: check if a node or any of its descendants belongs to targetDept
  function matchesOrHasDescendant(node: HierarchyNode): boolean {
    if (node.department && node.department.toLowerCase().trim() === targetDeptLower) {
      return true;
    }
    return node.children.some(matchesOrHasDescendant);
  }

  // If isolateDeptHead is true:
  // Find the top-most node(s) in this department and make them the root(s)
  if (isolateDeptHead) {
    const extractedRoots: HierarchyNode[] = [];
    function findDeptRoots(node: HierarchyNode) {
      if (node.department && node.department.toLowerCase().trim() === targetDeptLower) {
        extractedRoots.push(cloneSubtree(node));
        return;
      }
      node.children.forEach(findDeptRoots);
    }
    nodes.forEach(findDeptRoots);
    if (extractedRoots.length > 0) return extractedRoots;
  }

  // Preserve leadership chain up to target department, pruning non-matching siblings
  function pruneBranches(node: HierarchyNode): HierarchyNode | null {
    const isDirectMatch = Boolean(node.department && node.department.toLowerCase().trim() === targetDeptLower);
    const hasMatchingDescendant = node.children.some(matchesOrHasDescendant);

    if (!isDirectMatch && !hasMatchingDescendant) {
      return null; // Hide other departments completely
    }

    // If node is already in the department, include all its children
    if (isDirectMatch) {
      return cloneSubtree(node);
    }

    // If node is an ancestor leading to the department, only keep matching children
    const filteredChildren = node.children
      .map(pruneBranches)
      .filter((c): c is HierarchyNode => c !== null);

    return {
      ...node,
      children: filteredChildren,
      isCollapsed: false,
    };
  }

  function cloneSubtree(node: HierarchyNode): HierarchyNode {
    return {
      ...node,
      isCollapsed: false,
      children: node.children.map(cloneSubtree),
    };
  }

  const result = nodes
    .map(pruneBranches)
    .filter((n): n is HierarchyNode => n !== null);

  return result.length > 0 ? result : nodes;
}

export const OrgCanvas: React.FC<OrgCanvasProps> = ({
  roots,
  allNodes = [],
  selectedDepartment = 'all',
  onSelectDepartment,
  userRole,
  collapsedIds,
  onToggleCollapse,
  onCollapseAll,
  onExpandAll,
  onEditNode,
  onAddChild,
  onDeleteNode,
  onSelectNode,
  onReassignParent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom states
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 80, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(selectedDepartment || 'all');
  const [isolateDeptHead, setIsolateDeptHead] = useState<boolean>(false);
  const [showQuickPills, setShowQuickPills] = useState<boolean>(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Sync internal filter state when external selectedDepartment prop changes
  useEffect(() => {
    if (selectedDepartment) {
      setSelectedDeptFilter(selectedDepartment);
    }
  }, [selectedDepartment]);

  // Drag and Drop states
  const [draggedNode, setDraggedNode] = useState<HierarchyNode | null>(null);
  const [dragTargetNode, setDragTargetNode] = useState<HierarchyNode | null>(null);

  // Available unique departments with position counts
  const availableDepartments = useMemo(() => {
    const counts = new Map<string, number>();
    const sourceNodes = allNodes.length > 0 ? allNodes : roots;
    sourceNodes.forEach((n) => {
      if (n.department && n.department.trim()) {
        const d = n.department.trim();
        counts.set(d, (counts.get(d) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allNodes, roots]);

  // Top factory departments for quick 1-click filter pills
  const topFactoryDepartments = useMemo(() => {
    return availableDepartments.slice(0, 8);
  }, [availableDepartments]);

  // Effective collapsed IDs: when viewing a single department, auto-expand its nodes so full structure is visible
  const effectiveCollapsedIds = useMemo(() => {
    if (selectedDeptFilter === 'all') return collapsedIds;
    return new Set<string>();
  }, [collapsedIds, selectedDeptFilter]);

  // Filtered roots based on selected department (hiding other department sections)
  const displayRoots = useMemo(() => {
    return filterTreeByDepartment(roots, selectedDeptFilter, isolateDeptHead);
  }, [roots, selectedDeptFilter, isolateDeptHead]);

  // Compute Layout positions for the filtered roots
  const { nodes: positionedNodes, width: canvasWidth, height: canvasHeight } = 
    computeVerticalLayout(displayRoots, effectiveCollapsedIds);

  // Filter and search matching
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery && selectedBandFilter === 'all') return [];
    const query = searchQuery.toLowerCase().trim();

    return positionedNodes
      .filter((n) => {
        const matchesQuery = !query || 
          n.title.toLowerCase().includes(query) ||
          (n.name && n.name.toLowerCase().includes(query)) ||
          n.department.toLowerCase().includes(query) ||
          (n.phone && n.phone.includes(query));

        const matchesBand = selectedBandFilter === 'all' || n.band === selectedBandFilter;
        return matchesQuery && matchesBand;
      })
      .map((n) => n.id);
  }, [positionedNodes, searchQuery, selectedBandFilter]);

  // Center on node
  const centerOnNode = useCallback((node: HierarchyNode) => {
    if (!containerRef.current || node.x === undefined || node.y === undefined) return;
    const rect = containerRef.current.getBoundingClientRect();
    const targetX = rect.width / 2 - (node.x + CARD_WIDTH / 2) * zoom;
    const targetY = rect.height / 3 - (node.y + CARD_HEIGHT / 2) * zoom;
    setPan({ x: targetX, y: targetY });
  }, [zoom]);

  // Fit to view
  const handleFitToView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = (rect.width - 80) / canvasWidth;
    const scaleY = (rect.height - 80) / canvasHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.2);
    setZoom(newZoom);
    setPan({
      x: Math.max(20, (rect.width - canvasWidth * newZoom) / 2),
      y: 50,
    });
  }, [canvasWidth, canvasHeight]);

  // Automatically fit or center when department filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToView();
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedDeptFilter, isolateDeptHead, handleFitToView]);

  const handleDepartmentChange = (dept: string) => {
    setSelectedDeptFilter(dept);
    onSelectDepartment?.(dept);
  };

  // Focus next search match
  const focusMatch = (index: number) => {
    if (matchingNodeIds.length === 0) return;
    const targetId = matchingNodeIds[index];
    const node = positionedNodes.find((n) => n.id === targetId);
    if (node) {
      centerOnNode(node);
      onSelectNode(node);
      setCurrentMatchIndex(index);
    }
  };

  const handleNextMatch = () => {
    const nextIndex = (currentMatchIndex + 1) % matchingNodeIds.length;
    focusMatch(nextIndex);
  };

  const handlePrevMatch = () => {
    const prevIndex = (currentMatchIndex - 1 + matchingNodeIds.length) % matchingNodeIds.length;
    focusMatch(prevIndex);
  };

  // Canvas Mouse Pan Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.group')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.25), 2.2));
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 80, y: 40 });
  };

  // Drag and Drop handlers
  const handleDragStart = (_e: React.DragEvent, node: HierarchyNode) => {
    setDraggedNode(node);
  };

  const handleDragOver = (_e: React.DragEvent, node: HierarchyNode) => {
    if (draggedNode && draggedNode.id !== node.id) {
      setDragTargetNode(node);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, _node: HierarchyNode) => {
    setDragTargetNode(null);
  };

  const handleDrop = (_e: React.DragEvent, targetNode: HierarchyNode) => {
    if (draggedNode && draggedNode.id !== targetNode.id) {
      onReassignParent(draggedNode.id, targetNode.id);
    }
    setDraggedNode(null);
    setDragTargetNode(null);
  };

  // Collect connector line segments
  const connectors: { id: string; d: string }[] = [];
  const nodeMap = new Map<string, HierarchyNode>();
  positionedNodes.forEach((n) => nodeMap.set(n.id, n));

  positionedNodes.forEach((node) => {
    if (node.reportsTo && nodeMap.has(node.reportsTo)) {
      const parent = nodeMap.get(node.reportsTo)!;
      if (parent.x !== undefined && parent.y !== undefined && node.x !== undefined && node.y !== undefined) {
        connectors.push({
          id: `${parent.id}->${node.id}`,
          d: generateOrthogonalPath(parent.x, parent.y, node.x, node.y),
        });
      }
    }
  });

  return (
    <div className="relative w-full h-[calc(100vh-68px)] overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col select-none">
      {/* Top Floating Control Bar: Department-wise Filter, Search, Band & Tree Controls */}
      <div className="absolute top-4 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2.5 pointer-events-auto">
          {/* PRIMARY DEPARTMENT-WISE FILTER BUTTON & DROPDOWN */}
          <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg border border-red-200 dark:border-red-900/60 shadow-md ring-1 ring-red-500/20">
            <div className="flex items-center gap-1.5 pl-1.5 pr-1">
              <Building2 className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">
                Department:
              </span>
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              aria-label="Department-wise Organogram Filter"
              className="text-xs font-bold bg-transparent text-red-700 dark:text-red-400 py-1 pr-2 focus:outline-hidden cursor-pointer max-w-[210px] truncate"
            >
              <option value="all">🏢 All Departments (Full Organogram)</option>
              {availableDepartments.map((dept) => (
                <option key={dept.name} value={dept.name}>
                  {dept.name} ({dept.count} {dept.count === 1 ? 'role' : 'roles'})
                </option>
              ))}
            </select>

            {selectedDeptFilter !== 'all' && (
              <button
                type="button"
                onClick={() => handleDepartmentChange('all')}
                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                title="Clear filter & show all factory departments"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Scope Toggle (When Filtered) */}
          {selectedDeptFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setIsolateDeptHead(!isolateDeptHead)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 transition-colors pointer-events-auto cursor-pointer"
              title="Toggle between Department Head as root or Full Corporate Leadership chain"
            >
              <Layers className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">
                {isolateDeptHead ? 'View: Department Only' : 'View: Include Board Chain'}
              </span>
              <span className="md:hidden">
                {isolateDeptHead ? 'Isolated' : 'Chain'}
              </span>
            </button>
          )}

          {/* Quick Department Chips Bar Toggle */}
          <button
            type="button"
            onClick={() => setShowQuickPills(!showQuickPills)}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border backdrop-blur-md transition-colors pointer-events-auto cursor-pointer shadow-xs ${
              showQuickPills 
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold' 
                : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle quick department filter pills"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Depts</span>
          </button>

          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs pointer-events-auto">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search role, name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentMatchIndex(0);
              }}
              className="w-36 sm:w-44 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
            />
            {matchingNodeIds.length > 0 && (
              <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {currentMatchIndex + 1}/{matchingNodeIds.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrevMatch}
                  className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Previous match"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMatch}
                  className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Next match"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Band filter */}
          <div className="hidden xl:flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs pointer-events-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <select
              value={selectedBandFilter}
              onChange={(e) => {
                setSelectedBandFilter(e.target.value);
                setCurrentMatchIndex(0);
              }}
              aria-label="Filter by employee band"
              className="text-xs font-medium bg-transparent text-slate-700 dark:text-slate-200 py-0.5 pr-2 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Bands</option>
              <option value="GM Band">GM Band</option>
              <option value="Manager Band">Manager Band</option>
              <option value="Executive Band">Executive Band</option>
              <option value="Officer Band">Officer Band</option>
              <option value="Operator Band">Operator Band</option>
            </select>
          </div>

          {/* Global Expand / Collapse */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs pointer-events-auto">
            <button
              type="button"
              onClick={onExpandAll}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors whitespace-nowrap cursor-pointer"
              title="Expand all hierarchy branches"
            >
              <ChevronsDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Expand</span>
            </button>
            <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={onCollapseAll}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors whitespace-nowrap cursor-pointer"
              title="Collapse branches to top managers"
            >
              <ChevronsUp className="w-3.5 h-3.5 text-slate-500" />
              <span>Collapse</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK DEPARTMENT PILLS BAR (Instant 1-click filtering) */}
      {showQuickPills && (
        <div className="absolute top-16 left-6 right-6 z-15 flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleDepartmentChange('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
              selectedDeptFilter === 'all'
                ? 'bg-red-700 text-white border-red-700 shadow-xs'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-400'
            }`}
          >
            All Departments ({allNodes.length || roots.length})
          </button>

          {topFactoryDepartments.map((dept) => {
            const isSelected = selectedDeptFilter.toLowerCase() === dept.name.toLowerCase();
            return (
              <button
                key={dept.name}
                type="button"
                onClick={() => handleDepartmentChange(dept.name)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-red-700 text-white border-red-700 font-bold shadow-xs'
                    : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-400 font-medium'
                }`}
              >
                <span>{dept.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded-full ${
                  isSelected ? 'bg-red-900/60 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {dept.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ACTIVE DEPARTMENT FILTER BANNER */}
      {selectedDeptFilter !== 'all' && (
        <div className={`absolute ${showQuickPills ? 'top-26' : 'top-16'} left-6 z-15 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 text-white backdrop-blur-md rounded-lg shadow-md border border-slate-700 text-xs animate-in fade-in slide-in-from-top-1 duration-150`}>
          <Building2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>
            Viewing: <strong className="text-white font-bold">{selectedDeptFilter}</strong> Organogram
          </span>
          <span className="text-slate-400 text-[11px]">
            ({positionedNodes.length} {positionedNodes.length === 1 ? 'role displayed' : 'roles displayed'} · other departments hidden)
          </span>
          <button
            type="button"
            onClick={() => handleDepartmentChange('all')}
            className="ml-2 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <X className="w-3 h-3" />
            <span>Show All</span>
          </button>
        </div>
      )}

      {/* Floating Canvas Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 px-1 min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.25))}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />
        <button
          type="button"
          onClick={handleFitToView}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="Fit organogram to view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          title="Reset to 100%"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* MAIN DRAGGABLE / PANNABLE CANVAS AREA (MATCHES CSS SELECTOR 1) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full overflow-hidden bg-dot-slate cursor-grab transition-colors duration-150 ${
          isPanning ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
          className="relative transition-transform duration-75 ease-out"
        >
          {/* SVG Connector Lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            {connectors.map((conn) => (
              <path
                key={conn.id}
                d={conn.d}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-200"
              />
            ))}
          </svg>

          {/* HTML Interactive Node Cards */}
          {positionedNodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              userRole={userRole}
              isCollapsed={effectiveCollapsedIds.has(node.id)}
              onToggleCollapse={onToggleCollapse}
              onEditNode={onEditNode}
              onAddChild={onAddChild}
              onDeleteNode={onDeleteNode}
              onSelectNode={onSelectNode}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              isDragTarget={dragTargetNode?.id === node.id}
              isSearchMatch={matchingNodeIds.includes(node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
