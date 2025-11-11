import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EntryMode, UserProfile } from '../../types';

export const MAX_SELECTED_FUNDS = 10;

type GuidedState = {
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;
  profile: UserProfile;
  setProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  selectedFundId: string | null;
  selectedFundIds: string[];
  toggleSelectedFund: (id: string) => void;
  addSelectedFund: (id: string) => void;
  removeSelectedFund: (id: string) => void;
  clearSelectedFunds: () => void;
  setSelectedFundId: (id: string | null) => void;
};

const GuidedComparatorContext = createContext<GuidedState | undefined>(undefined);

export const GuidedComparatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [profile, setProfileState] = useState<UserProfile>({});
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>([]);

  const addSelectedFund = useCallback((id: string) => {
    setSelectedFundIds(prev => {
      if (prev.includes(id) || prev.length >= MAX_SELECTED_FUNDS) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const removeSelectedFund = useCallback((id: string) => {
    setSelectedFundIds(prev => prev.filter(x => x !== id));
  }, []);

  const toggleSelectedFund = useCallback((id: string) => {
    setSelectedFundIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= MAX_SELECTED_FUNDS) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clearSelectedFunds = useCallback(() => setSelectedFundIds([]), []);

  const setProfile = useCallback((updater: (prev: UserProfile) => UserProfile) => {
    setProfileState(prev => updater(prev));
  }, []);

  return (
    <GuidedComparatorContext.Provider
      value={{
        entryMode,
        setEntryMode,
        profile,
        setProfile,
        selectedFundId,
        selectedFundIds,
        toggleSelectedFund,
        addSelectedFund,
        removeSelectedFund,
        clearSelectedFunds,
        setSelectedFundId,
      }}
    >
      {children}
    </GuidedComparatorContext.Provider>
  );
};

export const useGuidedComparator = () => {
  const ctx = useContext(GuidedComparatorContext);
  if (!ctx) {
    throw new Error('useGuidedComparator must be used within GuidedComparatorProvider');
  }
  return ctx;
};
