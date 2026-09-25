import { LoanCase, BankProfile } from '../types';

/**
 * Formats a number into Indian Rupee format (e.g., ₹12,50,000)
 */
export function formatINR(val: number | null | undefined, includeDecimals = false): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(val);
}

/**
 * Formats number in Lakhs/Crores for compact display (e.g., ₹9.5 L or ₹1.2 Cr)
 */
export function formatLakhs(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatINR(amount);
}

/**
 * Formats ISO date (YYYY-MM-DD) into readable Indian business date (e.g., 25 Jul 2026)
 */
export function formatDateIndian(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Calculates Gross Commission, TDS, and Net In-Hand Commission
 * Formula:
 * 1. Gross Commission = Disbursed Amount * (Payout Rate / 100)
 * 2. Taxable Base = Gross Commission - File Charges
 *    (If File Charges > Gross Commission, Taxable Base = 0)
 * 3. TDS (u/s 194H) = Taxable Base * (TDS % / 100)
 * 4. Net Payout = Taxable Base - TDS
 *    (If apply GST is true, GST is added to the invoice)
 */
export function calculatePayout(
  disbursedAmount: number,
  payoutRatePercent: number,
  fileCharge: number = 0,
  tdsPercent: number = 5,
  applyGst: boolean = false,
  gstPercent: number = 18
) {
  const gross = Math.round((disbursedAmount * (payoutRatePercent || 0)) / 100);
  const netBeforeTax = Math.max(0, gross - (fileCharge || 0));
  const tds = Math.round((netBeforeTax * (tdsPercent || 0)) / 100);
  let net = netBeforeTax - tds;

  if (applyGst) {
    const gst = Math.round((netBeforeTax * (gstPercent || 0)) / 100);
    net += gst;
  }

  return {
    expectedGrossPayout: gross,
    expectedTdsAmount: tds,
    expectedNetPayout: Math.max(0, net),
  };
}

/**
 * Exports data to CSV and triggers automatic download
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // UTF-8 BOM so Excel on Windows handles INR symbols and special characters correctly
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates formatted WhatsApp Escalation message for Bank Sales Manager
 */
export function generateWhatsAppMessage({
  bankName,
  smName,
  monthYear,
  partnerName,
  agencyName,
  cases,
}: {
  bankName: string;
  smName: string;
  monthYear: string;
  partnerName: string;
  agencyName: string;
  cases: LoanCase[];
}): string {
  const missingCases = cases.filter((c) => c.payoutStatus === 'Pending' || c.payoutStatus === 'Disputed');
  const shortCases = cases.filter((c) => c.payoutStatus === 'Short Payout');

  let text = `*Payout Escalation / Reconciliation Notice*\n`;
  text += `To: ${smName || 'Sales Manager'} (${bankName})\n`;
  text += `From: ${partnerName} (${agencyName})\n`;
  text += `Cycle: ${monthYear}\n\n`;

  if (missingCases.length > 0) {
    const totalMissingAmt = missingCases.reduce((sum, c) => sum + c.expectedNetPayout, 0);
    text += `*⚠️ Missing Cases in Bank MIS (${missingCases.length} files - Total: ${formatINR(totalMissingAmt)})*\n`;
    missingCases.forEach((c, idx) => {
      text += `${idx + 1}. *${c.customerName}* | LAN: ${c.lan || 'Pending'} | Disbursed: ${formatINR(c.disbursedAmount)} (${formatDateIndian(c.disbursalDate)}) | Due: ${formatINR(c.expectedNetPayout)}\n`;
    });
    text += `\n`;
  }

  if (shortCases.length > 0) {
    const totalShortAmt = shortCases.reduce((sum, c) => sum + Math.abs(c.payoutDifference), 0);
    text += `*⚠️ Short Payout Discrepancies (${shortCases.length} files - Shortfall: ${formatINR(totalShortAmt)})*\n`;
    shortCases.forEach((c, idx) => {
      text += `${idx + 1}. *${c.customerName}* | LAN: ${c.lan} | Exp: ${formatINR(c.expectedNetPayout)} | Recd: ${formatINR(c.bankPaidAmount || 0)} | *Diff: -${formatINR(Math.abs(c.payoutDifference))}*\n`;
    });
    text += `\n`;
  }

  text += `Kindly review and process the adjustment credit in the upcoming supplementary cycle.\n`;
  text += `Thank you,\n${partnerName}`;

  return text;
}
