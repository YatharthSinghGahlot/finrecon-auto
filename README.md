# FinRecon Auto — Car Loan DSA Ledger & Commission Reconciliation

A high-efficiency, offline-first operational ledger and bank payout reconciliation web application built specifically for auto loan channel partners, direct selling agents (DSAs), and bank sourcing executives in India.

## Key Features

- **Multi-Partner Workspace & Secure Session:** Switch or register partner profiles (e.g., agency name, contacts) with optional 4-digit security PIN and 1-tap Logout to protect sensitive commission numbers on showroom devices.
- **Accurate Commission Engine:** Calculates Gross Payout, auto-deducts Bank File Charges (login documentation fees) and 5% TDS (Section 194H) to compute the exact Net In-Bank figure.
- **Dynamic Bank & Slab Management:** Fully customizable lender roster (HDFC, ICICI, SBI, Axis, Kotak, Cholamandalam, etc.) with separate default rates for New Cars vs Used Cars, file charges, and Bank Sales Manager contacts.
- **Monthly Reconciliation Workspace:** Month-by-month bank statement verification with inline matching, instant discrepancy flagging (short payouts & missing files), and high-contrast reconciliation totals.
- **WhatsApp Escalation Generator:** 1-click clipboard copy of structured shortfall / missing LAN notice formatted for Bank Sales Managers.
- **Data Portability:** 1-click Excel/CSV export and full offline JSON backup & restore.
- **Dark Theme Support:** Seamless toggle between light and dark financial UI.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (with custom `@custom-variant dark`)
- **Icons:** Lucide React
- **Storage:** LocalStorage (zero server or database required, 100% client-side privacy)

## Quick Start (Local Setup)

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/finrecon-auto.git
   cd finrecon-auto
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build:**
   ```bash
   npm run build
   ```
   The production-ready assets will be created in the `dist/` directory, ready to deploy to GitHub Pages, Vercel, Netlify, or Cloudflare Pages.
