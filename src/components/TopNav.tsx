import React from 'react';
import { PartnerProfile } from '../types';
import { ThemeMode } from '../utils/theme';
import { Plus, UserCheck, Download, Sun, Moon, LogOut } from 'lucide-react';

interface TopNavProps {
  activeTab: 'pipeline' | 'reconciliation' | 'banks';
  setActiveTab: (tab: 'pipeline' | 'reconciliation' | 'banks') => void;
  activePartner: PartnerProfile;
  onOpenNewCase: () => void;
  onOpenPartnerAuth: () => void;
  onOpenBackup: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeCasesCount: number;
  pendingDiscrepanciesCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  activePartner,
  onOpenNewCase,
  onOpenPartnerAuth,
  onOpenBackup,
  onLogout,
  theme,
  onToggleTheme,
  activeCasesCount,
  pendingDiscrepanciesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('pipeline')}
              className="text-left group focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-base shadow-xs">
                  ₹
                </div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                  FinRecon Auto
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean text states) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'pipeline'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              Loan Pipeline
              {activeCasesCount > 0 && (
                <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
                  ({activeCasesCount})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reconciliation'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              Payout Reconciliation
              {pendingDiscrepanciesCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 rounded border border-rose-200 dark:border-rose-900">
                  {pendingDiscrepanciesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('banks')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'banks'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              Banks & Commission Slabs
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Backup / Export icon */}
            <button
              onClick={onOpenBackup}
              title="Backup & Restore Data"
              className="hidden sm:inline-flex items-center justify-center p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Partner Switch / Profile Modal */}
            <button
              onClick={onOpenPartnerAuth}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
              title="Partner Profile & Commission Settings"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline truncate max-w-[90px]">
                {activePartner.name.split(' ')[0]}
              </span>
              <span className="sm:hidden">Profile</span>
            </button>

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              title="Lock & Log Out of Partner Workspace"
              className="inline-flex items-center gap-1 p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-medium">Logout</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewCase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md shadow-xs transition-colors whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Loan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 px-2 py-1 overflow-x-auto text-xs font-medium scrollbar-none">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex-1 min-w-[95px] py-1.5 px-2 text-center rounded transition-colors whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Pipeline ({activeCasesCount})
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex-1 min-w-[120px] py-1.5 px-2 text-center rounded transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
            activeTab === 'reconciliation'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Reconcile
          {pendingDiscrepanciesCount > 0 && (
            <span className="px-1 text-[10px] text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 rounded">
              {pendingDiscrepanciesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('banks')}
          className={`flex-1 min-w-[95px] py-1.5 px-2 text-center rounded transition-colors whitespace-nowrap ${
            activeTab === 'banks'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Banks & Slabs
        </button>
      </div>
    </header>
  );
};
