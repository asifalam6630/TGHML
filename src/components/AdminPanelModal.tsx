/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OrgNodeData, EmployeeBand } from '../types/organogram';
import { willCreateCycle } from '../utils/treeUtils';
import { X, Save, AlertCircle, PlusCircle } from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialNode?: OrgNodeData | null;
  parentNode?: OrgNodeData | null;
  allNodes: OrgNodeData[];
  onSave: (nodeData: OrgNodeData) => void;
  onClose: () => void;
}

const ALL_BANDS: EmployeeBand[] = [
  'GM Band',
  'Manager Band',
  'Executive Band',
  'Officer Band',
  'Operator Band',
];

const STANDARD_DEPARTMENTS = [
  'Admin & HR',
  'Sample',
  'CAD',
  'Cutting',
  'Sewing',
  'Quality Control',
  'Finishing',
  'Technical',
  'Maintenance',
  'Planning',
  'IE',
  'Compliance',
  'Utility',
  'SIC',
  'Supply Chain',
  'GPQ',
  'Execution',
  'Management',
  'Corporate Governance',
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  mode,
  initialNode,
  parentNode,
  allNodes,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<OrgNodeData>>({
    title: '',
    name: '',
    department: 'Sewing',
    subDepartment: '',
    reportsTo: null,
    band: 'Officer Band',
    levelNumber: 3,
    headcount: '1',
    phone: '',
    notes: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialNode) {
      setFormData({ ...initialNode });
    } else if (mode === 'add') {
      setFormData({
        id: `node-${Date.now()}`,
        title: '',
        name: '',
        department: parentNode?.department || 'Sewing',
        subDepartment: parentNode?.subDepartment || '',
        reportsTo: parentNode ? parentNode.id : null,
        band: getRecommendedChildBand(parentNode?.band),
        levelNumber: (parentNode?.levelNumber || 0) + 1,
        headcount: '1',
        phone: '',
        notes: '',
      });
    }
    setValidationError(null);
  }, [mode, initialNode, parentNode, isOpen]);

  if (!isOpen) return null;

  function getRecommendedChildBand(parentBand?: EmployeeBand): EmployeeBand {
    if (!parentBand) return 'Officer Band';
    switch (parentBand) {
      case 'GM Band':
        return 'Manager Band';
      case 'Manager Band':
        return 'Executive Band';
      case 'Executive Band':
        return 'Officer Band';
      default:
        return 'Operator Band';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setValidationError('Role / Title is required');
      return;
    }
    if (!formData.department?.trim()) {
      setValidationError('Department is required');
      return;
    }

    // Verify cycle prevention
    if (mode === 'edit' && initialNode && formData.reportsTo) {
      if (willCreateCycle(allNodes, initialNode.id, formData.reportsTo)) {
        setValidationError('Cannot assign this manager: it would create a circular reporting loop.');
        return;
      }
    }

    onSave(formData as OrgNodeData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'add' ? (
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Save className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {mode === 'add' ? 'Add Organization Role' : 'Edit Reporting Role'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designation / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Assistant Manager, Sr. Officer"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Md. Arif Hossain"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Department & Sub-Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {STANDARD_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Department / Wing
              </label>
              <input
                type="text"
                placeholder="e.g. Pre-Sewing, Finishing Execution"
                value={formData.subDepartment || ''}
                onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Employee Band & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee Band
              </label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value as EmployeeBand })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {ALL_BANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Level
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={formData.levelNumber || 3}
                onChange={(e) => setFormData({ ...formData, levelNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Headcount & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headcount / Strength
              </label>
              <input
                type="text"
                placeholder="e.g. 1, 1-8, 231, 100"
                value={formData.headcount || ''}
                onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone / Contact
              </label>
              <input
                type="text"
                placeholder="e.g. 01712915967"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Reporting Line Manager Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reports To (Reporting Manager)
            </label>
            <select
              value={formData.reportsTo || ''}
              onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value || null })}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No Manager (Root Level / Board)</option>
              {allNodes
                .filter((n) => mode === 'add' || n.id !== initialNode?.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    [{n.department}] {n.title} {n.name ? `(${n.name})` : ''} - {n.band}
                  </option>
                ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Operational Notes
            </label>
            <textarea
              rows={2}
              placeholder="Responsibilities, machine layout, specific factory requirements..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              {mode === 'add' ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
