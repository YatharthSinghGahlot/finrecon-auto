import { PartnerProfile, BankProfile, LoanCase } from '../types';
import { calculatePayout } from './formatters';

const STORAGE_KEY_PARTNERS = 'autoloan_partners_v1';
const STORAGE_KEY_ACTIVE_PARTNER = 'autoloan_active_partner_id_v1';
const STORAGE_KEY_CASES = 'autoloan_cases_v1';

export const DEFAULT_BANKS: BankProfile[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank Ltd',
    shortCode: 'HDFC',
    smName: 'Rohan Mehra',
    smPhone: '9811234567',
    defaultNewCarRate: 1.25,
    defaultUsedCarRate: 1.8,
    defaultFileCharge: 1500,
    defaultTdsPercent: 5,
    notes: 'Direct DSA code: DSA-HDFC-9941. Monthly cutoff 30th.',
  },
  {
    id: 'icici',
    name: 'ICICI Bank Car Loans',
    shortCode: 'ICICI',
    smName: 'Amit Saxena',
    smPhone: '9820987654',
    defaultNewCarRate: 1.3,
    defaultUsedCarRate: 1.85,
    defaultFileCharge: 1500,
    defaultTdsPercent: 5,
    notes: 'Bonus 0.15% if monthly volume > ₹1 Crore.',
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    shortCode: 'SBI',
    smName: 'Deepak Verma',
    smPhone: '9711554433',
    defaultNewCarRate: 0.9,
    defaultUsedCarRate: 1.35,
    defaultFileCharge: 1000,
    defaultTdsPercent: 5,
    notes: 'Tie-up via RACPC Branch. Lowest processing fee.',
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Prime',
    shortCode: 'KOTAK',
    smName: 'Sanjay Rawat',
    smPhone: '9930112233',
    defaultNewCarRate: 1.2,
    defaultUsedCarRate: 2.1,
    defaultFileCharge: 2000,
    defaultTdsPercent: 5,
    notes: 'Best payout for used cars & luxury segment.',
  },
  {
    id: 'axis',
    name: 'Axis Bank Auto Loans',
    shortCode: 'AXIS',
    smName: 'Priya Joshi',
    smPhone: '9845012345',
    defaultNewCarRate: 1.25,
    defaultUsedCarRate: 1.75,
    defaultFileCharge: 1500,
    defaultTdsPercent: 5,
    notes: 'Fast turnaround on Maruti & Hyundai bookings.',
  },
  {
    id: 'chola',
    name: 'Cholamandalam Finance',
    shortCode: 'CHOLA',
    smName: 'Manoj Pillai',
    smPhone: '9890456789',
    defaultNewCarRate: 1.4,
    defaultUsedCarRate: 2.25,
    defaultFileCharge: 2500,
    defaultTdsPercent: 5,
    notes: 'Commercial & rural customer profile specialist.',
  },
];

const SEED_PARTNERS: PartnerProfile[] = [
  {
    id: 'partner-1',
    name: 'Rajesh Sharma',
    agencyName: 'Sharma Auto Fin Solutions',
    phone: '9810012345',
    email: 'rajesh@sharmaautofin.in',
    city: 'New Delhi / Gurgaon',
    pin: '', // Default no pin required
    customBanks: DEFAULT_BANKS,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'partner-2',
    name: 'Vikram Malhotra',
    agencyName: 'Malhotra Car DSA Hub',
    phone: '9820054321',
    email: 'vikram@malhotracars.com',
    city: 'Mumbai',
    pin: '',
    customBanks: DEFAULT_BANKS,
    createdAt: new Date().toISOString(),
  },
];

function generateSeedCases(): LoanCase[] {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const prevMonthNum = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
  const prevYear = new Date().getMonth() === 0 ? currentYear - 1 : currentYear;
  const prevMonth = String(prevMonthNum).padStart(2, '0');

  // Case 1: Disbursed last month, bank paid accurately (Matched)
  const c1Calc = calculatePayout(1050000, 1.25, 1500, 5);
  // Case 2: Disbursed last month, bank paid LESS than expected (Short Payout by ₹2,425)
  const c2Calc = calculatePayout(880000, 1.25, 1500, 5);
  // Case 3: Disbursed last month, bank completely missed in MIS (Pending / Missing)
  const c3Calc = calculatePayout(1450000, 1.25, 1500, 5);
  // Case 4: Disbursed current month, recently disbursed
  const c4Calc = calculatePayout(1200000, 1.3, 1500, 5);
  // Case 5: Disbursed current month, Kotak used car
  const c5Calc = calculatePayout(650000, 2.1, 2000, 5);

  return [
    {
      id: 'case-101',
      partnerId: 'partner-1',
      customerName: 'Amitabh Verma',
      customerPhone: '9820144556',
      carModel: 'Hyundai Creta SX (O) Diesel',
      carType: 'New Car',
      dealerName: 'Frontier Hyundai, Okhla',
      bankId: 'hdfc',
      status: 'Disbursed',
      requestedLoanAmount: 1100000,
      disbursedAmount: 1050000,
      lan: 'HDFC-AL-882910',
      loginDate: `${prevYear}-${prevMonth}-05`,
      disbursalDate: `${prevYear}-${prevMonth}-14`,
      payoutRatePercent: 1.25,
      fileCharge: 1500,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      ...c1Calc,
      payoutStatus: 'Matched',
      bankPaidAmount: c1Calc.expectedNetPayout, // ₹11,044
      payoutReceivedDate: `${currentYear}-${currentMonth}-22`,
      bankReference: 'NEFT-HDFC-992144-MIS',
      payoutDifference: 0,
      notes: 'Customer delivery completed. Fast turnaround by Rohan (HDFC).',
      createdAt: `${prevYear}-${prevMonth}-05T10:00:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-22T14:30:00Z`,
    },
    {
      id: 'case-102',
      partnerId: 'partner-1',
      customerName: 'Sunil Bhatia',
      customerPhone: '9811899001',
      carModel: 'Maruti Suzuki Brezza ZXi+',
      carType: 'New Car',
      dealerName: 'Rana Motors, Vasant Kunj',
      bankId: 'hdfc',
      status: 'Disbursed',
      requestedLoanAmount: 900000,
      disbursedAmount: 880000,
      lan: 'HDFC-AL-883452',
      loginDate: `${prevYear}-${prevMonth}-10`,
      disbursalDate: `${prevYear}-${prevMonth}-19`,
      payoutRatePercent: 1.25,
      fileCharge: 1500,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      ...c2Calc,
      payoutStatus: 'Short Payout',
      bankPaidAmount: c2Calc.expectedNetPayout - 2425, // Bank short-paid by ₹2,425 (perhaps applied 1.00% default slab)
      payoutReceivedDate: `${currentYear}-${currentMonth}-22`,
      bankReference: 'NEFT-HDFC-992144-MIS',
      payoutDifference: -2425,
      notes: 'Bank MIS applied 1.00% instead of agreed 1.25%. Raised escalation to Rohan.',
      createdAt: `${prevYear}-${prevMonth}-10T11:00:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-23T09:00:00Z`,
    },
    {
      id: 'case-103',
      partnerId: 'partner-1',
      customerName: 'Pooja Aggarwal',
      customerPhone: '9717012388',
      carModel: 'Mahindra Scorpio-N Z8L 4x4',
      carType: 'New Car',
      dealerName: 'Koncept Mahindra, Noida',
      bankId: 'hdfc',
      status: 'Disbursed',
      requestedLoanAmount: 1500000,
      disbursedAmount: 1450000,
      lan: 'HDFC-AL-884918',
      loginDate: `${prevYear}-${prevMonth}-24`,
      disbursalDate: `${prevYear}-${prevMonth}-30`,
      payoutRatePercent: 1.25,
      fileCharge: 1500,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      ...c3Calc,
      payoutStatus: 'Pending',
      bankPaidAmount: null,
      payoutReceivedDate: '',
      bankReference: '',
      payoutDifference: -c3Calc.expectedNetPayout,
      notes: 'Disbursed on month-end 30th. Bank missed in primary MIS statement. Escalation sent.',
      createdAt: `${prevYear}-${prevMonth}-24T12:00:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-23T09:15:00Z`,
    },
    {
      id: 'case-104',
      partnerId: 'partner-1',
      customerName: 'Dr. Vivek Saxena',
      customerPhone: '9810844221',
      carModel: 'Tata Safari Accomplished Plus',
      carType: 'New Car',
      dealerName: 'Sagar Auto, Delhi',
      bankId: 'icici',
      status: 'Disbursed',
      requestedLoanAmount: 1250000,
      disbursedAmount: 1200000,
      lan: 'ICICI-AL-449102',
      loginDate: `${currentYear}-${currentMonth}-03`,
      disbursalDate: `${currentYear}-${currentMonth}-08`,
      payoutRatePercent: 1.3,
      fileCharge: 1500,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      ...c4Calc,
      payoutStatus: 'Pending',
      bankPaidAmount: null,
      payoutReceivedDate: '',
      bankReference: '',
      payoutDifference: -c4Calc.expectedNetPayout,
      notes: 'Doctor scheme file. Expected payout due in next month cycle.',
      createdAt: `${currentYear}-${currentMonth}-03T10:00:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-08T17:00:00Z`,
    },
    {
      id: 'case-105',
      partnerId: 'partner-1',
      customerName: 'Gaurav Singhal',
      customerPhone: '9910334455',
      carModel: 'Honda City 2021 ZX (Certified Pre-owned)',
      carType: 'Used Car',
      dealerName: 'Spinny Car Hub, Gurugram',
      bankId: 'kotak',
      status: 'Disbursed',
      requestedLoanAmount: 700000,
      disbursedAmount: 650000,
      lan: 'KOTAK-PRIME-77123',
      loginDate: `${currentYear}-${currentMonth}-07`,
      disbursalDate: `${currentYear}-${currentMonth}-12`,
      payoutRatePercent: 2.1,
      fileCharge: 2000,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      ...c5Calc,
      payoutStatus: 'Pending',
      bankPaidAmount: null,
      payoutReceivedDate: '',
      bankReference: '',
      payoutDifference: -c5Calc.expectedNetPayout,
      notes: 'Used car valuation done. High commission slab (2.1%).',
      createdAt: `${currentYear}-${currentMonth}-07T14:00:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-12T16:00:00Z`,
    },
    {
      id: 'case-106',
      partnerId: 'partner-1',
      customerName: 'Kunal Kapoor',
      customerPhone: '9818800112',
      carModel: 'Kia Seltos GTX+ Petrol',
      carType: 'New Car',
      dealerName: 'Allied Motors, Delhi',
      bankId: 'axis',
      status: 'Sanctioned',
      requestedLoanAmount: 1150000,
      disbursedAmount: 0,
      lan: 'AXIS-SAN-55219',
      loginDate: `${currentYear}-${currentMonth}-15`,
      disbursalDate: '',
      payoutRatePercent: 1.25,
      fileCharge: 1500,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      expectedGrossPayout: 0,
      expectedTdsAmount: 0,
      expectedNetPayout: 0,
      payoutStatus: 'Pending',
      bankPaidAmount: null,
      payoutReceivedDate: '',
      bankReference: '',
      payoutDifference: 0,
      notes: 'Sanction letter issued. Customer taking delivery this Saturday.',
      createdAt: `${currentYear}-${currentMonth}-15T09:30:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-18T11:00:00Z`,
    },
    {
      id: 'case-107',
      partnerId: 'partner-1',
      customerName: 'Meenakshi Sundaram',
      customerPhone: '9840112299',
      carModel: 'Hyundai Venue SX Turbo',
      carType: 'New Car',
      dealerName: 'Hans Hyundai, Moti Nagar',
      bankId: 'sbi',
      status: 'Logged In',
      requestedLoanAmount: 850000,
      disbursedAmount: 0,
      lan: '',
      loginDate: `${currentYear}-${currentMonth}-20`,
      disbursalDate: '',
      payoutRatePercent: 0.9,
      fileCharge: 1000,
      tdsPercent: 5,
      applyGst: false,
      gstPercent: 18,
      expectedGrossPayout: 0,
      expectedTdsAmount: 0,
      expectedNetPayout: 0,
      payoutStatus: 'Pending',
      bankPaidAmount: null,
      payoutReceivedDate: '',
      bankReference: '',
      payoutDifference: 0,
      notes: 'Salary slip & Form 16 submitted to RACPC. Credit verification in progress.',
      createdAt: `${currentYear}-${currentMonth}-20T15:00:00Z`,
      updatedAt: `${currentYear}-${currentMonth}-20T15:00:00Z`,
    },
  ];
}

// ----------------- STORAGE API -----------------

export function loadPartners(): PartnerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARTNERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PARTNERS, JSON.stringify(SEED_PARTNERS));
      return SEED_PARTNERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_PARTNERS;
  } catch {
    return SEED_PARTNERS;
  }
}

export function savePartners(partners: PartnerProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PARTNERS, JSON.stringify(partners));
  } catch (err) {
    console.error('Failed to save partners:', err);
  }
}

export function getActivePartnerId(): string {
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_PARTNER);
    if (active) return active;
    const partners = loadPartners();
    const defaultId = partners[0]?.id || 'partner-1';
    localStorage.setItem(STORAGE_KEY_ACTIVE_PARTNER, defaultId);
    return defaultId;
  } catch {
    return 'partner-1';
  }
}

export function setActivePartnerId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PARTNER, id);
  } catch (err) {
    console.error('Failed to set active partner:', err);
  }
}

export function loadCases(): LoanCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CASES);
    if (!raw) {
      const seed = generateSeedCases();
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCases(cases: LoanCase[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases:', err);
  }
}

export function exportFullBackup(): string {
  const partners = loadPartners();
  const cases = loadCases();
  const backup = {
    app: 'FinRecon Auto DSA System',
    exportDate: new Date().toISOString(),
    version: '1.0',
    partners,
    cases,
  };
  return JSON.stringify(backup, null, 2);
}

export function restoreFullBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.partners && Array.isArray(data.partners)) {
      savePartners(data.partners);
    }
    if (data.cases && Array.isArray(data.cases)) {
      saveCases(data.cases);
    }
    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
}
