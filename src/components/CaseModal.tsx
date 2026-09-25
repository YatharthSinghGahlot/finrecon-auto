import React, { useState, useEffect } from 'react';
import { LoanCase, BankProfile, CarType, LoanStatus, PayoutStatus } from '../types';
import { calculatePayout, formatINR } from '../utils/formatters';
import { X } from 'lucide-react';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (loanCase: LoanCase) => void;
  caseToEdit?: LoanCase | null;
  partnerId: string;
  banks: BankProfile[];
}

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
  caseToEdit,
  partnerId,
  banks,
}) => {
  const isEditing = Boolean(caseToEdit);
  const defaultBank = banks[0] || {
    id: 'hdfc',
    name: 'HDFC Bank',
    defaultNewCarRate: 1.25,
    defaultUsedCarRate: 1.75,
    defaultFileCharge: 1500,
    defaultTdsPercent: 5,
  };

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carType, setCarType] = useState<CarType>('New Car');
  const [dealerName, setDealerName] = useState('');
  const [bankId, setBankId] = useState(defaultBank.id);
  const [status, setStatus] = useState<LoanStatus>('Inquiry');

  const [requestedLoanAmount, setRequestedLoanAmount] = useState<number>(800000);
  const [disbursedAmount, setDisbursedAmount] = useState<number>(800000);
  const [lan, setLan] = useState('');
  const [loginDate, setLoginDate] = useState(new Date().toISOString().split('T')[0]);
  const [disbursalDate, setDisbursalDate] = useState('');

  const [payoutRatePercent, setPayoutRatePercent] = useState<number>(defaultBank.defaultNewCarRate);
  const [fileCharge, setFileCharge] = useState<number>(defaultBank.defaultFileCharge);
  const [tdsPercent, setTdsPercent] = useState<number>(defaultBank.defaultTdsPercent);
  const [applyGst, setApplyGst] = useState<boolean>(false);
  const [gstPercent, setGstPercent] = useState<number>(18);

  const [bankPaidAmount, setBankPaidAmount] = useState<string>('');
  const [bankReference, setBankReference] = useState('');
  const [notes, setNotes] = useState('');

  // Synchronize when opening for edit or new
  useEffect(() => {
    if (caseToEdit) {
      setCustomerName(caseToEdit.customerName || '');
      setCustomerPhone(caseToEdit.customerPhone || '');
      setCarModel(caseToEdit.carModel || '');
      setCarType(caseToEdit.carType || 'New Car');
      setDealerName(caseToEdit.dealerName || '');
      setBankId(caseToEdit.bankId || defaultBank.id);
      setStatus(caseToEdit.status || 'Inquiry');
      setRequestedLoanAmount(caseToEdit.requestedLoanAmount || 0);
      setDisbursedAmount(caseToEdit.disbursedAmount || caseToEdit.requestedLoanAmount || 0);
      setLan(caseToEdit.lan || '');
      setLoginDate(caseToEdit.loginDate || new Date().toISOString().split('T')[0]);
      setDisbursalDate(caseToEdit.disbursalDate || '');
      setPayoutRatePercent(caseToEdit.payoutRatePercent ?? defaultBank.defaultNewCarRate);
      setFileCharge(caseToEdit.fileCharge ?? defaultBank.defaultFileCharge);
      setTdsPercent(caseToEdit.tdsPercent ?? 5);
      setApplyGst(caseToEdit.applyGst || false);
      setGstPercent(caseToEdit.gstPercent || 18);
      setBankPaidAmount(caseToEdit.bankPaidAmount !== null ? String(caseToEdit.bankPaidAmount) : '');
      setBankReference(caseToEdit.bankReference || '');
      setNotes(caseToEdit.notes || '');
    } else {
      // New case reset
      setCustomerName('');
      setCustomerPhone('');
      setCarModel('');
      setCarType('New Car');
      setDealerName('');
      setBankId(defaultBank.id);
      setStatus('Inquiry');
      setRequestedLoanAmount(850000);
      setDisbursedAmount(850000);
      setLan('');
      setLoginDate(new Date().toISOString().split('T')[0]);
      setDisbursalDate('');
      setPayoutRatePercent(defaultBank.defaultNewCarRate);
      setFileCharge(defaultBank.defaultFileCharge);
      setTdsPercent(defaultBank.defaultTdsPercent);
      setApplyGst(false);
      setGstPercent(18);
      setBankPaidAmount('');
      setBankReference('');
      setNotes('');
    }
  }, [caseToEdit, isOpen]);

  // When bank changes or carType changes in NEW case, auto-fill standard slabs
  const handleBankChange = (newBankId: string) => {
    setBankId(newBankId);
    const selected = banks.find((b) => b.id === newBankId);
    if (selected && !isEditing) {
      const rate = carType === 'New Car' ? selected.defaultNewCarRate : selected.defaultUsedCarRate;
      setPayoutRatePercent(rate);
      setFileCharge(selected.defaultFileCharge);
      setTdsPercent(selected.defaultTdsPercent);
    }
  };

  const handleCarTypeChange = (type: CarType) => {
    setCarType(type);
    const selected = banks.find((b) => b.id === bankId);
    if (selected && !isEditing) {
      const rate = type === 'New Car' ? selected.defaultNewCarRate : selected.defaultUsedCarRate;
      setPayoutRatePercent(rate);
    }
  };

  if (!isOpen) return null;

  // Real-time Commission Calculation
  const activeDisbursed = status === 'Disbursed' ? disbursedAmount : requestedLoanAmount;
  const calc = calculatePayout(
    activeDisbursed,
    payoutRatePercent,
    fileCharge,
    tdsPercent,
    applyGst,
    gstPercent
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const actualDisbursed = status === 'Disbursed' ? disbursedAmount : 0;
    const finalCalc = calculatePayout(
      actualDisbursed,
      payoutRatePercent,
      fileCharge,
      tdsPercent,
      applyGst,
      gstPercent
    );

    const parsedBankPaid = bankPaidAmount !== '' ? parseFloat(bankPaidAmount) : null;
    let payoutStatus: PayoutStatus = 'Pending';
    let diff = 0;

    if (parsedBankPaid !== null) {
      diff = parsedBankPaid - finalCalc.expectedNetPayout;
      if (Math.abs(diff) < 10) {
        payoutStatus = 'Matched';
        diff = 0;
      } else if (diff < 0) {
        payoutStatus = 'Short Payout';
      } else {
        payoutStatus = 'Overpaid';
      }
    }

    const payload: LoanCase = {
      id: caseToEdit?.id || `case-${Date.now()}`,
      partnerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      carModel: carModel.trim(),
      carType,
      dealerName: dealerName.trim(),
      bankId,
      status,
      requestedLoanAmount,
      disbursedAmount: actualDisbursed,
      lan: lan.trim(),
      loginDate,
      disbursalDate: status === 'Disbursed' ? disbursalDate || new Date().toISOString().split('T')[0] : '',
      payoutRatePercent,
      fileCharge,
      tdsPercent,
      applyGst,
      gstPercent,
      expectedGrossPayout: finalCalc.expectedGrossPayout,
      expectedTdsAmount: finalCalc.expectedTdsAmount,
      expectedNetPayout: finalCalc.expectedNetPayout,
      payoutStatus,
      bankPaidAmount: parsedBankPaid,
      payoutReceivedDate: parsedBankPaid !== null ? (caseToEdit?.payoutReceivedDate || new Date().toISOString().split('T')[0]) : '',
      bankReference: bankReference.trim(),
      payoutDifference: diff,
      notes: notes.trim(),
      createdAt: caseToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCase(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full my-6 overflow-hidden max-h-[92vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? `Edit Loan File: ${caseToEdit?.customerName}` : 'Add New Car Loan Case'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track case lifecycle and calculate commission slab net of TDS & file charges.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Section 1: Customer & Vehicle Info */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Customer & Dealership Info
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Mobile
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="98100xxxxx"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Car Model & Variant *
                </label>
                <input
                  type="text"
                  required
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="e.g. Hyundai Creta SX (O) Petrol"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Car Type
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleCarTypeChange('New Car')}
                    className={`py-1.5 text-center text-xs font-medium rounded ${
                      carType === 'New Car'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    New Car
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCarTypeChange('Used Car')}
                    className={`py-1.5 text-center text-xs font-medium rounded ${
                      carType === 'Used Car'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Used Car
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Showroom / Sourcing Dealer
              </label>
              <input
                type="text"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                placeholder="e.g. Hans Hyundai, Moti Nagar"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 2: Bank & Loan Status */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Lender & Case Pipeline Status
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Bank / Financier *
                </label>
                <select
                  value={bankId}
                  onChange={(e) => handleBankChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                >
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (New: {b.defaultNewCarRate}% | Used: {b.defaultUsedCarRate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value as LoanStatus;
                    setStatus(newStatus);
                    if (newStatus === 'Disbursed' && !disbursalDate) {
                      setDisbursalDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm font-semibold rounded-md border focus:outline-none ${
                    status === 'Disbursed'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : status === 'Sanctioned'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                      : status === 'Logged In'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                      : status === 'Rejected'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <option value="Inquiry">Inquiry (Customer Booking / Discussion)</option>
                  <option value="Logged In">Logged In (KYC & Documents Submitted to Bank)</option>
                  <option value="Sanctioned">Sanctioned (Approval Letter Received)</option>
                  <option value="Disbursed">Disbursed (Loan Amount Credited & Delivery Done)</option>
                  <option value="Rejected">Rejected / Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {status === 'Disbursed' ? 'Final Disbursed Amount (₹) *' : 'Expected / Sanctioned Loan (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">₹</span>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={1000}
                    value={status === 'Disbursed' ? disbursedAmount : requestedLoanAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (status === 'Disbursed') {
                        setDisbursedAmount(val);
                        setRequestedLoanAmount(val);
                      } else {
                        setRequestedLoanAmount(val);
                        setDisbursedAmount(val);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Loan Account No. (LAN)
                </label>
                <input
                  type="text"
                  value={lan}
                  onChange={(e) => setLan(e.target.value)}
                  placeholder="e.g. HDFC-AL-889123"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Login Date
                </label>
                <input
                  type="date"
                  value={loginDate}
                  onChange={(e) => setLoginDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              {status === 'Disbursed' && (
                <div>
                  <label className="block font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                    Disbursal Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={disbursalDate}
                    onChange={(e) => setDisbursalDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Section 3: Commission Structure & Deductions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Agreed Commission Structure & Deductions
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Default applied from bank profile
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payout Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={payoutRatePercent}
                    onChange={(e) => setPayoutRatePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  File Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={fileCharge}
                    onChange={(e) => setFileCharge(parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TDS (u/s 194H)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="20"
                    value={tdsPercent}
                    onChange={(e) => setTdsPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="p-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-lg space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium">Commission Calculation Breakdown</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Loan: {formatINR(activeDisbursed)} @ {payoutRatePercent}%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">Gross Payout</div>
                  <div className="text-xs font-mono font-semibold tabular-nums text-slate-200">
                    {formatINR(calc.expectedGrossPayout)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">File Charges</div>
                  <div className="text-xs font-mono font-semibold tabular-nums text-slate-200">
                    - {formatINR(fileCharge)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">TDS ({tdsPercent}%)</div>
                  <div className="text-xs font-mono font-semibold tabular-nums text-rose-300">
                    - {formatINR(calc.expectedTdsAmount)}
                  </div>
                </div>
                <div className="bg-slate-800/80 rounded py-0.5">
                  <div className="text-[10px] text-emerald-300 font-semibold">Net In-Bank</div>
                  <div className="text-sm font-mono font-bold tabular-nums text-emerald-400">
                    {formatINR(calc.expectedNetPayout)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Bank Statement Match */}
          {status === 'Disbursed' && (
            <>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Bank Payout Credit (Optional - can be done in Reconcile tab)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Paid Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                      <input
                        type="number"
                        placeholder={`Expected: ${calc.expectedNetPayout}`}
                        value={bankPaidAmount}
                        onChange={(e) => setBankPaidAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-sm font-mono tabular-nums border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Statement / UTR Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NEFT-HDFC-992144"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              File Notes & Special Promises
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sales Manager promised 0.20% extra bonus if disbursed before 30th..."
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md shadow-xs transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Save Loan Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
