/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPdf?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  defaultPdf,
}) => {
  const [selectedPdf, setSelectedPdf] = useState<string>(
    defaultPdf || '/assets/aistudio/Organizational_Structure__AFWL__ce17f022.pdf'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Source Document Reference
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Inspect authentic organogram diagrams from engineering attachments
              </p>
            </div>
          </div>

          {/* PDF Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedPdf('/assets/aistudio/Organizational_Structure__AFWL__ce17f022.pdf')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedPdf.includes('AFWL')
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              AFWL (15 Depts)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPdf('/assets/aistudio/GOS_Organogram_V1_4f616d62.pdf')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedPdf.includes('GOS')
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              GOS (AS-IS & To-Be)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={selectedPdf}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 transition-colors"
              title="Open full PDF in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe */}
        <div className="flex-1 w-full h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
          <iframe
            src={`${selectedPdf}#toolbar=1&navpanes=1`}
            title="Organogram Source Document"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};
