import React, { useState } from 'react';
import { exportFullBackup, restoreFullBackup } from '../utils/storage';
import { X, Download, Upload, Check, AlertCircle, FileJson } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = exportFullBackup();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinRecon_Auto_Backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = restoreFullBackup(content);
        if (success) {
          setRestoreStatus('success');
          onDataRestored();
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setRestoreStatus('error');
          setErrorMessage('Invalid backup file format. Please check the JSON file.');
        }
      }
    };
    reader.onerror = () => {
      setRestoreStatus('error');
      setErrorMessage('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Data Backup & Transfer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All data is stored directly in your browser. Download backups to keep your data safe.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {restoreStatus === 'success' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-md flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Backup restored successfully! Updating data...</span>
            </div>
          )}

          {restoreStatus === 'error' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Download card */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Download Complete Backup</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Exports all partner profiles, loan cases, and custom bank rates to a single file.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="w-full mt-2 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File (.json)</span>
            </button>
          </div>

          {/* Restore card */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Restore from Backup</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Switching phones or restoring previous ledger? Upload your backup file here.
                </p>
              </div>
            </div>

            <label className="w-full mt-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Select File to Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
