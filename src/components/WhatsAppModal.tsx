import React, { useState } from 'react';
import { LoanCase } from '../types';
import { generateWhatsAppMessage } from '../utils/formatters';
import { X, Copy, Check, MessageSquare } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: LoanCase[];
  bankName: string;
  smName: string;
  smPhone?: string;
  monthStr: string;
  partnerName: string;
  agencyName: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  cases,
  bankName,
  smName,
  smPhone,
  monthStr,
  partnerName,
  agencyName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const message = generateWhatsAppMessage({
    bankName,
    smName,
    monthYear: monthStr,
    partnerName,
    agencyName,
    cases,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const cleanPhone = smPhone ? smPhone.replace(/\D/g, '') : '';
    const url = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              WhatsApp Escalation Note for Bank SM
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formatted case-by-case discrepancy statement ready to send to {smName || bankName}.
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
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
            {message}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tip: You can copy this directly and paste into your WhatsApp chat with the Bank Sales Manager or Regional DSA Coordinator.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
