import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EntryMode, UserProfile } from '../../types';

type GuidedState = {
  entryMode: EntryMode;
  setEntryMode: (mode: EntryMode) => void;
  profile: UserProfile;
  setProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  selectedFundId: string | null;
  setSelectedFundId: (id: string | null) => void;
};

const GuidedComparatorContext = createContext<GuidedState | undefined>(undefined);

export const GuidedComparatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [profile, setProfileState] = useState<UserProfile>({});
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);

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
