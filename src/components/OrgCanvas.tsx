/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HierarchyNode, UserRole } from '../types/organogram';
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
  ChevronsUp
} from 'lucide-react';

interface OrgCanvasProps {
  roots: HierarchyNode[];
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

export const OrgCanvas: React.FC<OrgCanvasProps> = ({
  roots,
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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>('all');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Drag and Drop
  const [draggedNode, setDraggedNode] = useState<HierarchyNode | null>(null);
  const [dragTargetNode, setDragTargetNode] = useState<HierarchyNode | null>(null);

  // Compute Layout positions
  const { nodes: positionedNodes, width: canvasWidth, height: canvasHeight } = 
    computeVerticalLayout(roots, collapsedIds);

  // Filter and search matching
  const matchingNodeIds = React.useMemo(() => {
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
    // Only pan if clicking canvas background, not cards
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

  const handleFitToView = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = (rect.width - 80) / canvasWidth;
    const scaleY = (rect.height - 80) / canvasHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.2);
    setZoom(newZoom);
    setPan({
      x: (rect.width - canvasWidth * newZoom) / 2,
      y: 40,
    });
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
      {/* Top Floating Control Bar: Search, Filters & Expand/Collapse */}
      <div className="absolute top-4 left-6 z-20 flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search role, name, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentMatchIndex(0);
            }}
            className="w-48 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
          {matchingNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {currentMatchIndex + 1}/{matchingNodeIds.length}
              </span>
              <button
                type="button"
                onClick={handlePrevMatch}
                className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Previous match"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMatch}
                className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Next match"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Band filter */}
        <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
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
            <option value="all">All Employee Bands</option>
            <option value="GM Band">GM Band</option>
            <option value="Manager Band">Manager Band</option>
            <option value="Executive Band">Executive Band</option>
            <option value="Officer Band">Officer Band</option>
            <option value="Operator Band">Operator Band</option>
          </select>
        </div>

        {/* Global Expand / Collapse */}
        <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            type="button"
            onClick={onExpandAll}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
            title="Expand all hierarchy branches"
          >
            <ChevronsDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Expand All</span>
          </button>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />
          <button
            type="button"
            onClick={onCollapseAll}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
            title="Collapse branches to top managers"
          >
            <ChevronsUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Collapse</span>
          </button>
        </div>

        {/* Drag Notice for Admin */}
        {userRole === 'admin' && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-indigo-700 dark:text-indigo-300 text-xs shadow-xs">
            <span className="font-semibold">Manager Edit Mode:</span>
            <span>Drag any card to reassign reporting structure live</span>
          </div>
        )}
      </div>

      {/* Floating Canvas Zoom Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
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
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />
        <button
          type="button"
          onClick={handleFitToView}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="Fit to view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="Reset 100%"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Draggable / Pannable Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`relative flex-1 w-full h-full overflow-hidden bg-dot-slate cursor-grab ${
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
              isCollapsed={collapsedIds.has(node.id)}
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
