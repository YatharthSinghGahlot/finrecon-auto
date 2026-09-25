import React, { useState, useEffect, useMemo } from 'react';
import { PartnerProfile, BankProfile, LoanCase, LoanStatus, PayoutStatus } from './types';
import {
  loadPartners,
  savePartners,
  getActivePartnerId,
  setActivePartnerId,
  loadCases,
  saveCases,
  DEFAULT_BANKS,
} from './utils/storage';
import { ThemeMode, getInitialTheme, applyThemeToDOM } from './utils/theme';
import { TopNav } from './components/TopNav';
import { PipelineView } from './components/PipelineView';
import { ReconciliationView } from './components/ReconciliationView';
import { BanksManagerView } from './components/BanksManagerView';
import { CaseModal } from './components/CaseModal';
import { PartnerAuthModal } from './components/PartnerAuthModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { BackupModal } from './components/BackupModal';
import { LoginScreen } from './components/LoginScreen';

const STORAGE_KEY_AUTH = 'autoloan_is_logged_in_v1';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      return savedAuth !== 'false'; // default to true on first load
    } catch {
      return true;
    }
  });

  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [activePartnerId, setActivePartnerIdState] = useState<string>('partner-1');
  const [cases, setCases] = useState<LoanCase[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'reconciliation' | 'banks'>('pipeline');

  // Modal states
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<LoanCase | null>(null);

  const [isPartnerAuthOpen, setIsPartnerAuthOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppEscalationData, setWhatsAppEscalationData] = useState<{
    cases: LoanCase[];
    bankName: string;
    smName: string;
    monthStr: string;
  }>({
    cases: [],
    bankName: '',
    smName: '',
    monthStr: '',
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyThemeToDOM(nextTheme);
  };

  // Load initial data from local storage
  useEffect(() => {
    const loadedPartners = loadPartners();
    const currentActiveId = getActivePartnerId();
    const loadedCases = loadCases();

    setPartners(loadedPartners);
    setActivePartnerIdState(currentActiveId);
    setCases(loadedCases);
  }, []);

  // Current active partner profile
  const activePartner = useMemo(() => {
    return partners.find((p) => p.id === activePartnerId) || partners[0] || {
      id: 'partner-1',
      name: 'Channel Partner',
      agencyName: 'Auto Finance Services',
      phone: '',
      city: '',
      customBanks: DEFAULT_BANKS,
      createdAt: new Date().toISOString(),
    };
  }, [partners, activePartnerId]);

  // Current partner's configured banks
  const partnerBanks = useMemo(() => {
    return activePartner.customBanks && activePartner.customBanks.length > 0
      ? activePartner.customBanks
      : DEFAULT_BANKS;
  }, [activePartner]);

  // Cases filtered for this specific partner
  const partnerCases = useMemo(() => {
    return cases.filter((c) => c.partnerId === activePartner.id);
  }, [cases, activePartner.id]);

  // Badge counts
  const activeCasesCount = partnerCases.filter(
    (c) => c.status !== 'Disbursed' && c.status !== 'Rejected'
  ).length;

  const pendingDiscrepanciesCount = partnerCases.filter(
    (c) => c.status === 'Disbursed' && (c.payoutStatus === 'Short Payout' || c.payoutDifference < -10)
  ).length;

  // Case operations
  const handleSaveCase = (savedCase: LoanCase) => {
    setCases((prev) => {
      const exists = prev.some((c) => c.id === savedCase.id);
      let updated: LoanCase[];
      if (exists) {
        updated = prev.map((c) => (c.id === savedCase.id ? savedCase : c));
      } else {
        updated = [savedCase, ...prev];
      }
      saveCases(updated);
      return updated;
    });
  };

  const handleDeleteCase = (caseId: string) => {
    setCases((prev) => {
      const updated = prev.filter((c) => c.id !== caseId);
      saveCases(updated);
      return updated;
    });
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: LoanStatus) => {
    setCases((prev) => {
      const updated = prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      saveCases(updated);
      return updated;
    });
  };

  const handleUpdateCaseReconciliation = (
    caseId: string,
    bankPaid: number | null,
    payoutStatus: PayoutStatus,
    bankRef: string
  ) => {
    setCases((prev) => {
      const updated = prev.map((c) => {
        if (c.id === caseId) {
          const diff = bankPaid !== null ? bankPaid - c.expectedNetPayout : 0;
          return {
            ...c,
            bankPaidAmount: bankPaid,
            payoutStatus,
            bankReference: bankRef,
            payoutDifference: diff,
            payoutReceivedDate: bankPaid !== null ? new Date().toISOString().split('T')[0] : '',
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      saveCases(updated);
      return updated;
    });
  };

  // Partner operations
  const handleSwitchPartner = (newPartnerId: string, enteredPin?: string): boolean => {
    const target = partners.find((p) => p.id === newPartnerId);
    if (!target) return false;

    if (target.pin && target.pin.trim() !== '') {
      if (target.pin.trim() !== (enteredPin || '').trim()) {
        return false;
      }
    }

    setActivePartnerIdState(newPartnerId);
    setActivePartnerId(newPartnerId);
    return true;
  };

  const handleLogin = (partnerId: string, enteredPin?: string): boolean => {
    const success = handleSwitchPartner(partnerId, enteredPin);
    if (success) {
      setIsLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } catch (e) {
        console.error(e);
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCurrentPartner = (updated: PartnerProfile) => {
    setPartners((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      savePartners(next);
      return next;
    });
  };

  const handleCreateNewPartner = (newPartner: PartnerProfile) => {
    setPartners((prev) => {
      const next = [...prev, newPartner];
      savePartners(next);
      return next;
    });
    setActivePartnerIdState(newPartner.id);
    setActivePartnerId(newPartner.id);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBanks = (newBanks: BankProfile[]) => {
    const updatedPartner: PartnerProfile = {
      ...activePartner,
      customBanks: newBanks,
    };
    handleSaveCurrentPartner(updatedPartner);
  };

  const handleOpenCaseModal = (caseItem?: LoanCase) => {
    setCaseToEdit(caseItem || null);
    setIsCaseModalOpen(true);
  };

  const handleOpenWhatsApp = (
    filteredCases: LoanCase[],
    bankName: string,
    smName: string,
    monthStr: string
  ) => {
    setWhatsAppEscalationData({
      cases: filteredCases,
      bankName,
      smName,
      monthStr,
    });
    setIsWhatsAppOpen(true);
  };

  const handleDataRestored = () => {
    setPartners(loadPartners());
    setActivePartnerIdState(getActivePartnerId());
    setCases(loadCases());
  };

  // If user has logged out, render the professional lock / login screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        partners={partners}
        activePartnerId={activePartnerId}
        onLogin={handleLogin}
        onCreatePartner={handleCreateNewPartner}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 pb-16 md:pb-6 transition-colors">
      {/* 3-Zone Clean Header */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePartner={activePartner}
        onOpenNewCase={() => handleOpenCaseModal()}
        onOpenPartnerAuth={() => setIsPartnerAuthOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeCasesCount={activeCasesCount}
        pendingDiscrepanciesCount={pendingDiscrepanciesCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'pipeline' && (
          <PipelineView
            cases={partnerCases}
            banks={partnerBanks}
            onOpenCaseModal={handleOpenCaseModal}
            onDeleteCase={handleDeleteCase}
            onUpdateCaseStatus={handleUpdateCaseStatus}
          />
        )}

        {activeTab === 'reconciliation' && (
          <ReconciliationView
            cases={partnerCases}
            banks={partnerBanks}
            activePartner={activePartner}
            onUpdateCaseReconciliation={handleUpdateCaseReconciliation}
            onOpenWhatsAppEscalation={handleOpenWhatsApp}
          />
        )}

        {activeTab === 'banks' && (
          <BanksManagerView
            banks={partnerBanks}
            onSaveBanks={handleSaveBanks}
            partnerName={activePartner.name}
          />
        )}
      </main>

      {/* Case Add/Edit Modal */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false);
          setCaseToEdit(null);
        }}
        onSaveCase={handleSaveCase}
        caseToEdit={caseToEdit}
        partnerId={activePartner.id}
        banks={partnerBanks}
      />

      {/* Partner Switch / Login / Settings Modal */}
      <PartnerAuthModal
        isOpen={isPartnerAuthOpen}
        onClose={() => setIsPartnerAuthOpen(false)}
        partners={partners}
        activePartnerId={activePartner.id}
        onSwitchPartner={handleSwitchPartner}
        onSaveCurrentPartner={handleSaveCurrentPartner}
        onCreateNewPartner={handleCreateNewPartner}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* WhatsApp Escalation Copier Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        cases={whatsAppEscalationData.cases}
        bankName={whatsAppEscalationData.bankName}
        smName={whatsAppEscalationData.smName}
        smPhone={
          partnerBanks.find((b) => b.name === whatsAppEscalationData.bankName)?.smPhone
        }
        monthStr={whatsAppEscalationData.monthStr}
        partnerName={activePartner.name}
        agencyName={activePartner.agencyName}
      />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
}
