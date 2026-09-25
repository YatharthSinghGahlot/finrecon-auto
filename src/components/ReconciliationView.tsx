import React, { useState, useMemo } from 'react';
import { LoanCase, BankProfile, PayoutStatus, PartnerProfile } from '../types';
import { formatINR, formatLakhs, exportToCSV } from '../utils/formatters';
import {
  Download,
  Share2,
  Building2,
} from 'lucide-react';

interface ReconciliationViewProps {
  cases: LoanCase[];
  banks: BankProfile[];
  activePartner: PartnerProfile;
  onUpdateCaseReconciliation: (
    caseId: string,
    bankPaid: number | null,
    payoutStatus: PayoutStatus,
    bankRef: string
  ) => void;
  onOpenWhatsAppEscalation: (filteredCases: LoanCase[], bankName: string, smName: string, monthStr: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  cases,
  banks,
  activePartner,
  onUpdateCaseReconciliation,
  onOpenWhatsAppEscalation,
}) => {
  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const list: { label: string; value: string }[] = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      list.push({ label, value });
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0]?.value || '');
  const [selectedBankId, setSelectedBankId] = useState<string>('All');
  const [reconcileFilter, setReconcileFilter] = useState<'All' | 'Discrepancies' | 'Matched' | 'Pending'>('All');

  const bankMap = useMemo(() => {
    const map = new Map<string, BankProfile>();
    banks.forEach((b) => map.set(b.id, b));
    return map;
  }, [banks]);

  // All disbursed cases for the selected month
  const monthDisbursedCases = useMemo(() => {
    return cases.filter((c) => {
      if (c.status !== 'Disbursed') return false;
      const dateToCheck = c.disbursalDate || c.updatedAt;
      if (!dateToCheck.startsWith(selectedMonth)) return false;
      if (selectedBankId !== 'All' && c.bankId !== selectedBankId) return false;

      if (reconcileFilter === 'Discrepancies') {
        return c.payoutStatus === 'Short Payout' || c.payoutDifference < -10;
      }
      if (reconcileFilter === 'Matched') {
        return c.payoutStatus === 'Matched';
      }
      if (reconcileFilter === 'Pending') {
        return c.payoutStatus === 'Pending' || c.bankPaidAmount === null;
      }

      return true;
    });
  }, [cases, selectedMonth, selectedBankId, reconcileFilter]);

  // Metrics for all disbursed in this month & bank (unfiltered by matched/short toggle)
  const baseMonthCases = useMemo(() => {
    return cases.filter((c) => {
      if (c.status !== 'Disbursed') return false;
      const dateToCheck = c.disbursalDate || c.updatedAt;
      if (!dateToCheck.startsWith(selectedMonth)) return false;
      if (selectedBankId !== 'All' && c.bankId !== selectedBankId) return false;
      return true;
    });
  }, [cases, selectedMonth, selectedBankId]);

  const totalDisbursedVol = baseMonthCases.reduce((sum, c) => sum + c.disbursedAmount, 0);
  const totalExpectedNet = baseMonthCases.reduce((sum, c) => sum + c.expectedNetPayout, 0);
  const totalReceivedNet = baseMonthCases.reduce((sum, c) => sum + (c.bankPaidAmount || 0), 0);
  const netShortfall = totalExpectedNet - totalReceivedNet;

  const matchedCount = baseMonthCases.filter((c) => c.payoutStatus === 'Matched').length;
  const shortCount = baseMonthCases.filter((c) => c.payoutStatus === 'Short Payout').length;
  const pendingCount = baseMonthCases.filter(
    (c) => c.payoutStatus === 'Pending' || c.bankPaidAmount === null
  ).length;

  // Selected Bank info for escalation
  const activeBankProfile = selectedBankId !== 'All' ? bankMap.get(selectedBankId) : null;
  const targetBankName = activeBankProfile?.name || 'All Lenders';
  const targetSmName = activeBankProfile?.smName || 'Bank Channel Manager';
  const targetMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth;

  // Handle inline quick amount change
  const handleAmountChange = (caseItem: LoanCase, valStr: string) => {
    if (valStr.trim() === '') {
      onUpdateCaseReconciliation(caseItem.id, null, 'Pending', caseItem.bankReference || '');
      return;
    }
    const entered = parseFloat(valStr);
    if (isNaN(entered)) return;

    const diff = entered - caseItem.expectedNetPayout;
    let newStatus: PayoutStatus = 'Pending';
    if (Math.abs(diff) < 10) {
      newStatus = 'Matched';
    } else if (diff < 0) {
      newStatus = 'Short Payout';
    } else {
      newStatus = 'Overpaid';
    }

    onUpdateCaseReconciliation(caseItem.id, entered, newStatus, caseItem.bankReference || '');
  };

  // 1-Click Match Button
  const handleOneClickMatch = (caseItem: LoanCase) => {
    onUpdateCaseReconciliation(
      caseItem.id,
      caseItem.expectedNetPayout,
      'Matched',
      caseItem.bankReference || 'BANK-MIS-MATCHED'
    );
  };

  // CSV Export for Accountant / Self Record
  const handleExportCSV = () => {
    const filename = `Payout_Reconciliation_${targetBankName.replace(/\s+/g, '_')}_${selectedMonth}`;
    const headers = [
      'Customer Name',
      'LAN',
      'Car Model',
      'Car Type',
      'Bank',
      'Disbursal Date',
      'Disbursed Amount (INR)',
      'Payout Rate (%)',
      'Gross Commission (INR)',
      'File Charges (INR)',
      'TDS (INR)',
      'Expected Net In-Hand (INR)',
      'Bank Actual Paid (INR)',
      'Difference / Shortfall (INR)',
      'Reconciliation Status',
      'Bank Reference / UTR',
      'Notes',
    ];

    const rows = baseMonthCases.map((c) => [
      c.customerName,
      c.lan || 'Pending',
      c.carModel,
      c.carType,
      bankMap.get(c.bankId)?.name || c.bankId,
      c.disbursalDate,
      c.disbursedAmount,
      c.payoutRatePercent,
      c.expectedGrossPayout,
      c.fileCharge,
      c.expectedTdsAmount,
      c.expectedNetPayout,
      c.bankPaidAmount ?? 'Unpaid',
      c.payoutDifference,
      c.payoutStatus,
      c.bankReference || '—',
      c.notes || '',
    ]);

    exportToCSV(filename, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Filter Workspace */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Disbursal Month Cycle
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Financier / Bank Statement
              </label>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              >
                <option value="All">All Banks Combined</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action CTAs: Export & WhatsApp */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportCSV}
              disabled={baseMonthCases.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() =>
                onOpenWhatsAppEscalation(
                  baseMonthCases,
                  targetBankName,
                  targetSmName,
                  targetMonthLabel
                )
              }
              disabled={baseMonthCases.length === 0}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Escalate Discrepancies</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs for Reconciliation State */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={() => setReconcileFilter('All')}
            className={`px-3 py-1 rounded font-medium whitespace-nowrap transition-colors ${
              reconcileFilter === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Files ({baseMonthCases.length})
          </button>
          <button
            onClick={() => setReconcileFilter('Discrepancies')}
            className={`px-3 py-1 rounded font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              reconcileFilter === 'Discrepancies'
                ? 'bg-rose-700 text-white dark:bg-rose-600'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <span>Short Payouts</span>
            <span className="font-mono text-[11px]">({shortCount})</span>
          </button>
          <button
            onClick={() => setReconcileFilter('Pending')}
            className={`px-3 py-1 rounded font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              reconcileFilter === 'Pending'
                ? 'bg-amber-700 text-white dark:bg-amber-600'
                : 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span>Unpaid / Missing</span>
            <span className="font-mono text-[11px]">({pendingCount})</span>
          </button>
          <button
            onClick={() => setReconcileFilter('Matched')}
            className={`px-3 py-1 rounded font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              reconcileFilter === 'Matched'
                ? 'bg-emerald-800 text-white dark:bg-emerald-600'
                : 'text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span>Matched Full</span>
            <span className="font-mono text-[11px]">({matchedCount})</span>
          </button>
        </div>
      </div>

      {/* Monthly Reconciliation High-Contrast Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Disbursed Volume</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {formatLakhs(totalDisbursedVol)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {baseMonthCases.length} car deliveries
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Net Expected</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {formatINR(totalExpectedNet)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            After TDS & file fees
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bank Actually Credited</div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-400 mt-0.5">
            {formatINR(totalReceivedNet)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {matchedCount} files reconciled
          </div>
        </div>

        <div
          className={`p-3.5 rounded-lg border transition-colors ${
            netShortfall > 0
              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
              : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900'
          }`}
        >
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {netShortfall > 0 ? 'Pending / Shortfall' : 'Reconciliation Status'}
          </div>
          <div
            className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-0.5 ${
              netShortfall > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-800 dark:text-emerald-400'
            }`}
          >
            {netShortfall > 0 ? `- ${formatINR(netShortfall)}` : '100% Settled'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {shortCount + pendingCount > 0
              ? `${shortCount + pendingCount} cases need chase`
              : 'All funds accounted for'}
          </div>
        </div>
      </div>

      {/* Case-by-Case Matching Ledger */}
      {monthDisbursedCases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
          <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No disbursed loans found for {targetMonthLabel}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Either no cases were marked disbursed in this month, or they don't match the selected filter.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Customer & Loan Info</th>
                  <th className="py-3 px-3.5 text-right">Disbursed (₹)</th>
                  <th className="py-3 px-3.5 text-right">Expected Net (₹)</th>
                  <th className="py-3 px-3.5 text-right">Bank Statement Paid (₹)</th>
                  <th className="py-3 px-3.5 text-right">Difference (₹)</th>
                  <th className="py-3 px-3.5 text-center">Match Status</th>
                  <th className="py-3 px-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthDisbursedCases.map((c) => {
                  const isMatched = c.payoutStatus === 'Matched';
                  const isShort = c.payoutStatus === 'Short Payout' || c.payoutDifference < -10;
                  const isPending = c.payoutStatus === 'Pending' || c.bankPaidAmount === null;
                  const bank = bankMap.get(c.bankId);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isShort ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Customer & LAN */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span>{c.carModel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            LAN: {c.lan || 'Not Assigned'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {bank?.shortCode || c.bankId.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Disbursed Amount */}
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                        {formatINR(c.disbursedAmount)}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {c.payoutRatePercent}%
                        </div>
                      </td>

                      {/* Expected Net */}
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {formatINR(c.expectedNetPayout)}
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          Gross: {formatINR(c.expectedGrossPayout)}
                        </div>
                      </td>

                      {/* Inline Input for Bank Paid */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span className="text-slate-400">₹</span>
                          <input
                            type="number"
                            value={c.bankPaidAmount !== null ? c.bankPaidAmount : ''}
                            onChange={(e) => handleAmountChange(c, e.target.value)}
                            placeholder="Enter paid"
                            className="w-24 px-2 py-1 text-right font-mono tabular-nums text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                          />
                        </div>
                        {c.bankReference && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px] ml-auto">
                            Ref: {c.bankReference}
                          </div>
                        )}
                      </td>

                      {/* Difference */}
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold">
                        {c.bankPaidAmount === null ? (
                          <span className="text-slate-400">—</span>
                        ) : c.payoutDifference === 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400">₹0</span>
                        ) : c.payoutDifference < 0 ? (
                          <span className="text-rose-700 dark:text-rose-400">
                            - {formatINR(Math.abs(c.payoutDifference))}
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            + {formatINR(c.payoutDifference)}
                          </span>
                        )}
                      </td>

                      {/* Match Status */}
                      <td className="py-3 px-3.5 text-center">
                        {isMatched && (
                          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            ✓ Matched
                          </span>
                        )}
                        {isShort && (
                          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                            ⚠ Short Payout
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                            ⏳ Missing / Unpaid
                          </span>
                        )}
                      </td>

                      {/* Quick 1-Click Match button */}
                      <td className="py-3 px-3.5 text-right">
                        {!isMatched ? (
                          <button
                            onClick={() => handleOneClickMatch(c)}
                            title="Mark as paid in full matching expected net"
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap"
                          >
                            Match Full
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            Reconciled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
