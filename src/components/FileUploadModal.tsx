/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { OrgDataset } from '../types/organogram';
import { parseUploadedOrganogramFile, ParseOutcome } from '../utils/fileParser';
import { AFWL_MASTER_DATASET, GOS_AS_IS_DATASET, GOS_TO_BE_DATASET } from '../data/afwlOrgData';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Download, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (dataset: OrgDataset) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseOutcome | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setParseResult(null);
    try {
      const result = await parseUploadedOrganogramFile(file);
      setParseResult(result);
    } catch (err: unknown) {
      setParseResult({
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = `id,title,name,department,subdepartment,band,levelnumber,headcount,reportsto,phone,notes
emp-01,Board of Director,Executive Board,Corporate Governance,,GM Band,0,1,,,"Governing body"
emp-02,Deputy General Manager (DGM),Alomgir Hossain,Manufacturing Operations,,GM Band,1,1,emp-01,01700000000,"Factory Head"
emp-03,Sr. Manager,Md. Arif Hossain,Sewing,Pre-Sewing,Manager Band,2,1,emp-02,01712915967,"Sewing head"
emp-04,Asst. Manager,,Sewing,Sewing Operation,Manager Band,2,1,emp-03,,"Line production"
emp-05,Line Supervisors,,Sewing,Sewing Operation,Officer Band,4,1-8,emp-04,,"Floor supervisor"
emp-06,Sewing Assistants,,Sewing,Sewing Operation,Operator Band,4,231,emp-05,,"Sewing assistants"`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'organogram_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Upload Organogram File & Import Structure
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Preload from Attached Source PDFs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Load from Attached PDF Documents
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" />
                Pre-parsed datasets
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* AFWL Master Org */}
              <button
                type="button"
                onClick={() => {
                  onApplyDataset(AFWL_MASTER_DATASET);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>AFWL - Garment Manufacturing Operation</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    15 operational departments (Sewing, Cutting, Finishing, Utility, QC, HR) with 45+ hierarchical nodes.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
              </button>

              {/* GOS AS-IS Plan */}
              <button
                type="button"
                onClick={() => {
                  onApplyDataset(GOS_AS_IS_DATASET);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Garments Operating System (GOS) - AS-IS Plan</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    BOD & DGM with Execution (Digital Transformation, CI & ME) & Management wings.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
              </button>

              {/* GOS To-Be Plan */}
              <button
                type="button"
                onClick={() => {
                  onApplyDataset(GOS_TO_BE_DATASET);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Garments Operating System (GOS) - To-Be Plan</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Restructured future target plan with Core Responsible and Unit Responsible architecture.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold absolute">
              Or Upload New File
            </span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-102'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept=".pdf,.vdx,.vsdx,.xml,.csv,.json"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Drop your PDF, Visio (.vdx/.xml), or CSV file here
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Supports Adobe PDF (.pdf), Microsoft Visio (.vdx, .xml), CSV, and JSON
              </span>
              <button
                type="button"
                className="mt-3 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs hover:bg-slate-50"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Parsing Feedback */}
          {isProcessing && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-indigo-700 dark:text-indigo-300">
                Extracting hierarchical nodes, roles, and reporting lines...
              </span>
            </div>
          )}

          {parseResult && (
            <div
              className={`p-4 rounded-lg border text-xs ${
                parseResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
              }`}
            >
              {parseResult.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Structure successfully parsed!</span>
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 space-y-1">
                    <div>Identified <strong className="font-mono">{parseResult.nodeCount}</strong> reporting roles.</div>
                    {parseResult.detectedDepartments && parseResult.detectedDepartments.length > 0 && (
                      <div>
                        Departments: {parseResult.detectedDepartments.slice(0, 5).join(', ')}
                        {parseResult.detectedDepartments.length > 5 && ` (+${parseResult.detectedDepartments.length - 5} more)`}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (parseResult.dataset) {
                        onApplyDataset(parseResult.dataset);
                        onClose();
                      }
                    }}
                    className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    Apply Parsed Structure to Organogram
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{parseResult.errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Download Sample Template */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Need a standardized template to populate?
            </span>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
