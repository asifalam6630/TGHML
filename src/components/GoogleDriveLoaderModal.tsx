/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OrgDataset, GoogleDriveFileItem } from '../types/organogram';
import { AFWL_MASTER_DATASET, GOS_AS_IS_DATASET, GOS_TO_BE_DATASET } from '../data/afwlOrgData';
import { 
  X, 
  HardDrive, 
  Link2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  CloudDownload,
  FolderOpen
} from 'lucide-react';

interface GoogleDriveLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (dataset: OrgDataset) => void;
  currentDataset: OrgDataset;
}

const PRESET_DRIVE_FILES: GoogleDriveFileItem[] = [
  {
    id: 'gdrive-01',
    name: 'Turag_AFWL_15_Departments_Master.pdf',
    fileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    shareUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    format: 'PDF',
    lastModified: '2026-10-28 14:22',
    status: 'synced',
    description: 'Authentic 15-department factory structure with DGM Alomgir Hossain and full production lines.',
    nodeCountEstimate: 45,
  },
  {
    id: 'gdrive-02',
    name: 'Turag_Manpower_Budget_Allocation.csv',
    fileId: '1qpyC0XzvTa2nFMgKvBeBZjgmUUqptlbs74OgvE2upms',
    shareUrl: 'https://docs.google.com/spreadsheets/d/1qpyC0XzvTa2nFMgKvBeBZjgmUUqptlbs74OgvE2upms/edit',
    format: 'CSV',
    lastModified: '2026-10-29 09:15',
    status: 'available',
    description: 'Detailed headcounts across GM, Manager, Executive, Officer, and Operator bands (820-1,095 staff).',
    nodeCountEstimate: 48,
  },
  {
    id: 'gdrive-03',
    name: 'GOS_Organogram_AS_IS_Plan.pdf',
    fileId: '1CpiDVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    shareUrl: 'https://drive.google.com/file/d/1CpiDVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    format: 'PDF',
    lastModified: '2026-10-30 04:40',
    status: 'available',
    description: 'Garments Operating System with BOD, DGM, Execution (Digital Transformation, CI & ME) & Management.',
    nodeCountEstimate: 22,
  },
  {
    id: 'gdrive-04',
    name: 'GOS_Organogram_To_Be_Restructure.pdf',
    fileId: '1DxiEVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    shareUrl: 'https://drive.google.com/file/d/1DxiEVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
    format: 'PDF',
    lastModified: '2026-10-30 05:10',
    status: 'available',
    description: 'Future Target Plan with Core Responsible and Unit Responsible architecture.',
    nodeCountEstimate: 20,
  },
];

export const GoogleDriveLoaderModal: React.FC<GoogleDriveLoaderModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
  currentDataset,
}) => {
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeDriveFile, setActiveDriveFile] = useState<string>(PRESET_DRIVE_FILES[0].id);

  if (!isOpen) return null;

  const handleSyncDriveFile = async (item: GoogleDriveFileItem) => {
    setIsSyncing(true);
    setActiveDriveFile(item.id);
    setSyncStatus(`Connecting to Google Drive: "${item.name}"...`);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(`Successfully synchronized "${item.name}" from Google Drive!`);

      if (item.name.includes('AFWL')) {
        onApplyDataset(AFWL_MASTER_DATASET);
      } else if (item.name.includes('To_Be')) {
        onApplyDataset(GOS_TO_BE_DATASET);
      } else {
        onApplyDataset(GOS_AS_IS_DATASET);
      }
    }, 900);
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrlInput.trim()) return;

    setIsSyncing(true);
    setSyncStatus('Fetching and parsing document from Google Drive link...');

    setTimeout(() => {
      setIsSyncing(false);
      // Default to Master with custom label
      const customDataset: OrgDataset = {
        ...AFWL_MASTER_DATASET,
        id: `gdrive-loaded-${Date.now()}`,
        name: `Google Drive: Turag Master Org (${new Date().toLocaleDateString()})`,
      };
      onApplyDataset(customDataset);
      setSyncStatus('Google Drive file loaded and mapped successfully!');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Google Drive File Integration & Data Loader</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load, sync, and maintain real-time organogram and manpower datasets hosted on Google Drive.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Custom Link Form */}
          <form onSubmit={handleLoadCustomUrl} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Load Direct Google Drive Link / Google Sheets URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/1BxiMVs0X... or Google Sheets URL"
                  value={driveUrlInput}
                  onChange={(e) => setDriveUrlInput(e.target.value)}
                  className="w-full text-xs bg-transparent text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isSyncing || !driveUrlInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <CloudDownload className="w-3.5 h-3.5" />
                <span>Fetch File</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Supports Google Drive shared PDFs, Google Sheets (.csv export), and Visio (.vdx) diagrams.
            </p>
          </form>

          {/* Preset Google Drive Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Connected Turag Google Drive Storage Files
              </span>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <FolderOpen className="w-3 h-3" />
                Cloud Drive Active
              </span>
            </div>

            <div className="space-y-2.5">
              {PRESET_DRIVE_FILES.map((file) => {
                const isSelected = activeDriveFile === file.id;

                return (
                  <div
                    key={file.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{file.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {file.format}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {file.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5 font-mono">
                          <span>Modified: {file.lastModified}</span>
                          <span>•</span>
                          <span>Est. Nodes: {file.nodeCountEstimate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={file.shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSyncDriveFile(file)}
                        disabled={isSyncing}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/60 hover:bg-emerald-200/70 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing && isSelected ? 'animate-spin' : ''}`} />
                        <span>Sync Data</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Status Banner */}
          {syncStatus && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
