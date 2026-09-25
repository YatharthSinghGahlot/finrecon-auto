import React, { useState } from 'react';
import { BankProfile } from '../types';
import { DEFAULT_BANKS } from '../utils/storage';
import { Plus, Edit2, Trash2, X, RotateCcw } from 'lucide-react';

interface BanksManagerViewProps {
  banks: BankProfile[];
  onSaveBanks: (banks: BankProfile[]) => void;
  partnerName: string;
}

export const BanksManagerView: React.FC<BanksManagerViewProps> = ({
  banks,
  onSaveBanks,
  partnerName,
}) => {
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states for add / edit
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [smName, setSmName] = useState('');
  const [smPhone, setSmPhone] = useState('');
  const [newCarRate, setNewCarRate] = useState<number>(1.25);
  const [usedCarRate, setUsedCarRate] = useState<number>(1.75);
  const [fileCharge, setFileCharge] = useState<number>(1500);
  const [tdsPercent, setTdsPercent] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const startEdit = (b: BankProfile) => {
    setEditingBankId(b.id);
    setName(b.name);
    setShortCode(b.shortCode);
    setSmName(b.smName);
    setSmPhone(b.smPhone);
    setNewCarRate(b.defaultNewCarRate);
    setUsedCarRate(b.defaultUsedCarRate);
    setFileCharge(b.defaultFileCharge);
    setTdsPercent(b.defaultTdsPercent);
    setNotes(b.notes || '');
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setEditingBankId(null);
    setIsAddingNew(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isAddingNew) {
      const newBank: BankProfile = {
        id: `bank-${Date.now()}`,
        name: name.trim(),
        shortCode: shortCode.trim() || name.trim().slice(0, 5).toUpperCase(),
        smName: smName.trim(),
        smPhone: smPhone.trim(),
        defaultNewCarRate: newCarRate,
        defaultUsedCarRate: usedCarRate,
        defaultFileCharge: fileCharge,
        defaultTdsPercent: tdsPercent,
        notes: notes.trim(),
      };
      onSaveBanks([...banks, newBank]);
    } else if (editingBankId) {
      const updated = banks.map((b) => {
        if (b.id === editingBankId) {
          return {
            ...b,
            name: name.trim(),
            shortCode: shortCode.trim() || name.trim().slice(0, 5).toUpperCase(),
            smName: smName.trim(),
            smPhone: smPhone.trim(),
            defaultNewCarRate: newCarRate,
            defaultUsedCarRate: usedCarRate,
            defaultFileCharge: fileCharge,
            defaultTdsPercent: tdsPercent,
            notes: notes.trim(),
          };
        }
        return b;
      });
      onSaveBanks(updated);
    }

    cancelEdit();
  };

  const handleDelete = (id: string, bankName: string) => {
    if (confirm(`Remove ${bankName} from your partner tie-ups?`)) {
      const updated = banks.filter((b) => b.id !== id);
      onSaveBanks(updated);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset your bank list to standard Indian auto loan defaults (HDFC, ICICI, SBI, Kotak, Axis)?')) {
      onSaveBanks(JSON.parse(JSON.stringify(DEFAULT_BANKS)));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Explainer */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Bank Tie-ups & Commission Slabs ({partnerName})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure your agreed commission percentages, file charges, and Bank Sales Manager contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            title="Reset to default Indian auto loan rates"
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditingBankId(null);
              setName('');
              setShortCode('');
              setSmName('');
              setSmPhone('');
              setNewCarRate(1.25);
              setUsedCarRate(1.75);
              setFileCharge(1500);
              setTdsPercent(5);
              setNotes('');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bank / Financier</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal/Card */}
      {(isAddingNew || editingBankId) && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border-2 border-slate-900 dark:border-slate-100 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isAddingNew ? 'Add New Bank / NBFC Tie-up' : `Edit Commission Slabs for ${name}`}
            </h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank / Financier Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IndusInd Bank Car Loans"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Code
                </label>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="e.g. INDUS"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Car Payout (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  required
                  value={newCarRate}
                  onChange={(e) => setNewCarRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Used Car Payout (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  required
                  value={usedCarRate}
                  onChange={(e) => setUsedCarRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default File Charge (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  value={fileCharge}
                  onChange={(e) => setFileCharge(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TDS Rate (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  required
                  value={tdsPercent}
                  onChange={(e) => setTdsPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sales Manager (SM) Name
                </label>
                <input
                  type="text"
                  value={smName}
                  onChange={(e) => setSmName(e.target.value)}
                  placeholder="e.g. Rajesh Khurana"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sales Manager Phone (for WhatsApp)
                </label>
                <input
                  type="tel"
                  value={smPhone}
                  onChange={(e) => setSmPhone(e.target.value)}
                  placeholder="98111xxxxx"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                DSA Code / Internal Bank Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. DSA Code: DSA-INDUS-8821. Month-end cutoff on 30th."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md"
              >
                Save Bank Slabs
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Bank Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {banks.map((b) => (
          <div
            key={b.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{b.name}</span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {b.shortCode}
                  </span>
                </div>
                {b.smName && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>SM: {b.smName}</span>
                    {b.smPhone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <a
                          href={`tel:${b.smPhone}`}
                          className="hover:text-slate-900 dark:hover:text-slate-100 font-mono text-[11px]"
                        >
                          {b.smPhone}
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(b)}
                  title="Edit Bank Commission Slabs"
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.name)}
                  title="Remove Bank"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slabs details */}
            <div className="grid grid-cols-4 gap-2 py-2 px-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-md border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">New Car</div>
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {b.defaultNewCarRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Used Car</div>
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {b.defaultUsedCarRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">File Fee</div>
                <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  ₹{b.defaultFileCharge}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">TDS (194H)</div>
                <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {b.defaultTdsPercent}%
                </div>
              </div>
            </div>

            {b.notes && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {b.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
