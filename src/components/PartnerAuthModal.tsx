import React, { useState } from 'react';
import { PartnerProfile } from '../types';
import { DEFAULT_BANKS } from '../utils/storage';
import { ThemeMode } from '../utils/theme';
import { X, UserCheck, Plus, Lock, Unlock, Check, Shield, LogOut, Sun, Moon } from 'lucide-react';

interface PartnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: PartnerProfile[];
  activePartnerId: string;
  onSwitchPartner: (partnerId: string, enteredPin?: string) => boolean;
  onSaveCurrentPartner: (updated: PartnerProfile) => void;
  onCreateNewPartner: (newPartner: PartnerProfile) => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const PartnerAuthModal: React.FC<PartnerAuthModalProps> = ({
  isOpen,
  onClose,
  partners,
  activePartnerId,
  onSwitchPartner,
  onSaveCurrentPartner,
  onCreateNewPartner,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [mode, setMode] = useState<'switch' | 'edit' | 'create'>('switch');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(activePartnerId);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Edit current profile fields
  const currentPartner = partners.find((p) => p.id === activePartnerId) || partners[0];
  const [editName, setEditName] = useState(currentPartner?.name || '');
  const [editAgency, setEditAgency] = useState(currentPartner?.agencyName || '');
  const [editPhone, setEditPhone] = useState(currentPartner?.phone || '');
  const [editCity, setEditCity] = useState(currentPartner?.city || '');
  const [editPin, setEditPin] = useState(currentPartner?.pin || '');

  // New profile fields
  const [newName, setNewName] = useState('');
  const [newAgency, setNewAgency] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const targetPartner = partners.find((p) => p.id === selectedPartnerId);

  const handleSwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const success = onSwitchPartner(selectedPartnerId, pinInput);
    if (success) {
      setPinInput('');
      onClose();
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMessage('Partner name is required.');
      return;
    }
    const updated: PartnerProfile = {
      ...currentPartner,
      name: editName.trim(),
      agencyName: editAgency.trim(),
      phone: editPhone.trim(),
      city: editCity.trim(),
      pin: editPin.trim(),
    };
    onSaveCurrentPartner(updated);
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
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
    onCreateNewPartner(newProfile);
    onSwitchPartner(newProfile.id);
    onClose();
  };

  const handleLogoutAction = () => {
    onClose();
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {mode === 'switch' && 'Partner Workspace / Profile'}
              {mode === 'edit' && 'Edit Profile & Settings'}
              {mode === 'create' && 'Register New Channel Partner'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage accounts, theme preference, and login session.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls for Modal */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium">
          <button
            onClick={() => {
              setMode('switch');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              mode === 'switch'
                ? 'border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold bg-white dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Switch Profile
          </button>
          <button
            onClick={() => {
              setMode('edit');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              mode === 'edit'
                ? 'border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold bg-white dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Profile & Security
          </button>
          <button
            onClick={() => {
              setMode('create');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              mode === 'create'
                ? 'border-b-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold bg-white dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            + New Partner
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-2.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* MODE: Switch Partner / Log In */}
          {mode === 'switch' && (
            <form onSubmit={handleSwitchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Channel Partner Profile
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {partners.map((p) => {
                    const isSelected = p.id === selectedPartnerId;
                    const isActive = p.id === activePartnerId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPartnerId(p.id);
                          setErrorMessage('');
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-slate-900 dark:border-slate-200 bg-slate-50 dark:bg-slate-800'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {p.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 font-medium px-1.5 py-0.2 rounded">
                                Current Active
                              </span>
                            )}
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

                        <div className="text-right">
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            {p.customBanks.length} Banks
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {targetPartner?.pin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Security PIN for {targetPartner.name}
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter partner PIN"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                    autoFocus
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLogoutAction}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md inline-flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Session</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md shadow-xs"
                  >
                    Switch Workspace
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE: Edit Current Profile & Settings */}
          {mode === 'edit' && (
            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Partner / DSA Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agency / Firm Name
                </label>
                <input
                  type="text"
                  value={editAgency}
                  onChange={(e) => setEditAgency(e.target.value)}
                  placeholder="e.g. Sharma Auto Finance"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="98100xxxxx"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Operating Area
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g. Delhi NCR"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
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
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  placeholder="Leave blank for no PIN"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Prevents colleagues from seeing your monthly commission numbers on shared showroom devices.
                </p>
              </div>

              {/* Theme Preference Option */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Application Appearance
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Currently using {theme === 'dark' ? 'Dark theme' : 'Light theme'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch to Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-600" />
                      <span>Switch to Dark</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLogoutAction}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md inline-flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE: Create New Partner */}
          {mode === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agency / Channel Partner Trade Name
                </label>
                <input
                  type="text"
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  placeholder="e.g. Patel Car Finance & DSA"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
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
                    placeholder="98200xxxxx"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
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
                    placeholder="e.g. Ahmedabad"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Set Security PIN (Optional)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="4-digit PIN (optional)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-200 dark:border-slate-700">
                A default list of Indian lenders (HDFC, ICICI, SBI, Kotak, Axis) will be configured for you with standard rates.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-md"
                >
                  Create & Open Workspace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
