import React, { useState, useMemo } from 'react';
import { LoanCase, BankProfile, LoanStatus } from '../types';
import { formatINR, formatLakhs, formatDateIndian } from '../utils/formatters';
import {
  Search,
  Phone,
  Edit3,
  Trash2,
  Car,
} from 'lucide-react';

interface PipelineViewProps {
  cases: LoanCase[];
  banks: BankProfile[];
  onOpenCaseModal: (loanCase?: LoanCase) => void;
  onDeleteCase: (caseId: string) => void;
  onUpdateCaseStatus: (caseId: string, newStatus: LoanStatus) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  cases,
  banks,
  onOpenCaseModal,
  onDeleteCase,
  onUpdateCaseStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LoanStatus>('All');
  const [bankFilter, setBankFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'New Car' | 'Used Car'>('All');

  const bankMap = useMemo(() => {
    const map = new Map<string, BankProfile>();
    banks.forEach((b) => map.set(b.id, b));
    return map;
  }, [banks]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (bankFilter !== 'All' && c.bankId !== bankFilter) return false;
      if (typeFilter !== 'All' && c.carType !== typeFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          c.customerName.toLowerCase().includes(query) ||
          c.customerPhone.includes(query) ||
          c.carModel.toLowerCase().includes(query) ||
          c.lan.toLowerCase().includes(query) ||
          c.dealerName.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [cases, statusFilter, bankFilter, typeFilter, searchQuery]);

  // Aggregate metrics
  const activeCases = cases.filter((c) => c.status !== 'Disbursed' && c.status !== 'Rejected');
  const activeVolume = activeCases.reduce((sum, c) => sum + c.requestedLoanAmount, 0);

  const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthDisbursed = cases.filter(
    (c) => c.status === 'Disbursed' && (c.disbursalDate || c.updatedAt).startsWith(currentYearMonth)
  );
  const thisMonthDisbursedVol = thisMonthDisbursed.reduce((sum, c) => sum + c.disbursedAmount, 0);
  const thisMonthExpectedComm = thisMonthDisbursed.reduce((sum, c) => sum + c.expectedNetPayout, 0);

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case 'Disbursed':
        return 'text-emerald-700 dark:text-emerald-400 font-semibold';
      case 'Sanctioned':
        return 'text-blue-700 dark:text-blue-400 font-semibold';
      case 'Logged In':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      case 'Inquiry':
        return 'text-slate-600 dark:text-slate-400 font-medium';
      case 'Rejected':
        return 'text-rose-700 dark:text-rose-400 font-medium';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top 3 Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Pipeline In-Progress</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatLakhs(activeVolume)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeCases.length} open files
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Inquiry, logged in & sanctioned
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Disbursed This Month ({new Date().toLocaleString('en-IN', { month: 'short' })})</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
              {formatLakhs(thisMonthDisbursedVol)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {thisMonthDisbursed.length} files delivery done
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Ready for next payout cycle
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expected Net Commission</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatINR(thisMonthExpectedComm)}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
              Net of TDS & Fees
            </span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Earned from {thisMonthDisbursed.length} disbursed loans
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name, phone, car, LAN, showroom..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bank & Type Filters */}
          <div className="flex items-center gap-2">
            <select
              value={bankFilter}
              onChange={(e) => setBankFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            >
              <option value="All">All Banks</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortCode || b.name}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            >
              <option value="All">New & Used</option>
              <option value="New Car">New Car Only</option>
              <option value="Used Car">Used Car Only</option>
            </select>
          </div>
        </div>

        {/* Segmented Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-2.5">
          {(['All', 'Inquiry', 'Logged In', 'Sanctioned', 'Disbursed', 'Rejected'] as const).map(
            (tab) => {
              const count =
                tab === 'All'
                  ? cases.length
                  : cases.filter((c) => c.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    statusFilter === tab
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] tabular-nums font-mono ${
                      statusFilter === tab
                        ? 'text-slate-300 dark:text-slate-600'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Case List / Ledger Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
          <Car className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No loan files match your filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, bank selection, or status filter to see other cases.
          </p>
          <button
            onClick={() => onOpenCaseModal()}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md transition-colors"
          >
            + Create New Loan Case
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCases.map((c) => {
            const bank = bankMap.get(c.bankId);
            const isDisbursed = c.status === 'Disbursed';
            const displayAmt = isDisbursed ? c.disbursedAmount : c.requestedLoanAmount;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors p-3.5 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Column: Customer, Vehicle & Dealership */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {c.customerName}
                      </span>
                      {/* Zero-pill unboxed metadata */}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        · {c.carModel}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        / {c.carType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {bank?.name || c.bankId.toUpperCase()}
                      </span>
                      {c.lan && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">LAN: {c.lan}</span>
                        </>
                      )}
                      {c.dealerName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{c.dealerName}</span>
                        </>
                      )}
                      {c.customerPhone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <a
                            href={`tel:${c.customerPhone}`}
                            className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{c.customerPhone}</span>
                          </a>
                        </>
                      )}
                    </div>

                    {c.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 line-clamp-1">
                        Note: {c.notes}
                      </p>
                    )}
                  </div>

                  {/* Middle Column: Financials & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {isDisbursed ? 'Disbursed Amount' : 'Requested Loan'}
                      </div>
                      <div className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                        {formatINR(displayAmt)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isDisbursed ? (
                          <span className="font-mono text-emerald-800 dark:text-emerald-400">
                            Net Comm: {formatINR(c.expectedNetPayout)}
                          </span>
                        ) : (
                          <span>Rate: {c.payoutRatePercent}%</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Stage</div>
                      <div className={`text-xs ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        {isDisbursed ? formatDateIndian(c.disbursalDate) : formatDateIndian(c.loginDate)}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {/* Advance Stage Shortcut */}
                      {c.status === 'Inquiry' && (
                        <button
                          onClick={() => onUpdateCaseStatus(c.id, 'Logged In')}
                          title="Submit File to Bank"
                          className="px-2 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900 rounded border border-amber-200 dark:border-amber-800 transition-colors whitespace-nowrap"
                        >
                          Log In
                        </button>
                      )}
                      {c.status === 'Logged In' && (
                        <button
                          onClick={() => onUpdateCaseStatus(c.id, 'Sanctioned')}
                          title="Mark Sanction Letter Received"
                          className="px-2 py-1 text-[11px] font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 rounded border border-blue-200 dark:border-blue-800 transition-colors whitespace-nowrap"
                        >
                          Sanction
                        </button>
                      )}
                      {c.status === 'Sanctioned' && (
                        <button
                          onClick={() => onOpenCaseModal(c)}
                          title="Customer Delivery Done - Mark Disbursed"
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded transition-colors whitespace-nowrap"
                        >
                          Disburse
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => onOpenCaseModal(c)}
                        title="Edit Case Details"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete case for ${c.customerName}?`)) {
                            onDeleteCase(c.id);
                          }
                        }}
                        title="Delete Case"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
