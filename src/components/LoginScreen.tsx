import React, { useState } from 'react';
import { PartnerProfile } from '../types';
import { ThemeMode } from '../utils/theme';
import { Lock, Unlock, UserCheck, Plus, Sun, Moon, ArrowRight, ShieldCheck } from 'lucide-react';
import { DEFAULT_BANKS } from '../utils/storage';

interface LoginScreenProps {
  partners: PartnerProfile[];
  activePartnerId: string;
  onLogin: (partnerId: string, pin?: string) => boolean;
  onCreatePartner: (newPartner: PartnerProfile) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  partners,
  activePartnerId,
  onLogin,
  onCreatePartner,
  theme,
  onToggleTheme,
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    activePartnerId || partners[0]?.id || ''
  );
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // New partner fields
  const [newName, setNewName] = useState('');
  const [newAgency, setNewAgency] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPin, setNewPin] = useState('');

  const targetPartner = partners.find((p) => p.id === selectedPartnerId) || partners[0];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const success = onLogin(selectedPartnerId, pinInput);
    if (!success) {
      setErrorMessage('Incorrect Security PIN. Please try again.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMessage('Partner name is required.');
      return;
    }
    const newProfile: PartnerProfile = {
      id: `partner-${Date.now()}`,
      name: newName.trim(),
      agencyName: newAgency.trim() || `${newName.trim()} Auto Finance`,
      phone: newPhone.trim(),
      city: newCity.trim(),
      pin: newPin.trim(),
      customBanks: JSON.parse(JSON.stringify(DEFAULT_BANKS)),
      createdAt: new Date().toISOString(),
    };
    onCreatePartner(newProfile);
    onLogin(newProfile.id);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Brand Lock Header */}
        <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-white/10 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 border border-white/20">
            <span className="text-xl font-bold font-mono">₹</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">FinRecon Auto</h1>
          <p className="text-xs text-slate-300 mt-1">
            DSA Loan File Ledger & Bank Commission Reconciliation
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted local workspace session</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-2.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-md">
              {errorMessage}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Channel Partner Profile
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMessage('');
                    }}
                    className="text-xs text-slate-900 dark:text-slate-200 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Partner</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {partners.map((p) => {
                    const isSelected = p.id === selectedPartnerId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPartnerId(p.id);
                          setErrorMessage('');
                          setPinInput('');
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {p.name}
                            </span>
                            {p.pin && (
                              <span title="PIN Protected">
                                <Lock className="w-3 h-3 text-slate-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {p.agencyName} {p.city ? `· ${p.city}` : ''}
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {p.customBanks.length} Banks
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {targetPartner?.pin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    This profile is protected to keep commission rates private.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Log In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Register New Partner
                </span>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Back to Log In
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Anil Sethi"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agency / Firm Name
                </label>
                <input
                  type="text"
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  placeholder="e.g. Sethi Auto Loans"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="98100xxxxx"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operating City
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Security PIN (Optional)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="4-digit PIN (optional)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-md shadow-xs transition-colors"
              >
                Create Profile & Start
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
