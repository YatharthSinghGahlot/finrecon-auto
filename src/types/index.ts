export type CarType = 'New Car' | 'Used Car';

export type LoanStatus = 'Inquiry' | 'Logged In' | 'Sanctioned' | 'Disbursed' | 'Rejected';

export type PayoutStatus = 'Pending' | 'Matched' | 'Short Payout' | 'Overpaid' | 'Disputed';

export interface BankProfile {
  id: string;
  name: string;
  shortCode: string;
  smName: string;
  smPhone: string;
  defaultNewCarRate: number; // e.g. 1.25%
  defaultUsedCarRate: number; // e.g. 1.75%
  defaultFileCharge: number; // e.g. 1500 in INR
  defaultTdsPercent: number; // e.g. 5%
  notes?: string;
}

export interface LoanCase {
  id: string;
  partnerId: string;
  customerName: string;
  customerPhone: string;
  carModel: string;
  carType: CarType;
  dealerName: string;
  bankId: string;
  status: LoanStatus;
  
  // Financial numbers
  requestedLoanAmount: number;
  disbursedAmount: number;
  lan: string; // Loan Account Number
  
  // Dates (YYYY-MM-DD)
  loginDate: string;
  disbursalDate: string;
  
  // Commission settings (defaulted from bank, but customizable per case)
  payoutRatePercent: number;
  fileCharge: number;
  tdsPercent: number;
  applyGst: boolean;
  gstPercent: number;
  
  // Calculated figures
  expectedGrossPayout: number;
  expectedTdsAmount: number;
  expectedNetPayout: number;
  
  // Payout reconciliation
  payoutStatus: PayoutStatus;
  bankPaidAmount: number | null;
  payoutReceivedDate: string;
  bankReference: string; // UTR or statement batch no.
  payoutDifference: number; // (bankPaidAmount || 0) - expectedNetPayout
  
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerProfile {
  id: string;
  name: string;
  agencyName: string;
  phone: string;
  email?: string;
  city: string;
  pin?: string; // Optional 4-digit security PIN for sensitive payout numbers
  customBanks: BankProfile[];
  createdAt: string;
}
