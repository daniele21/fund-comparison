import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EntryMode, UserProfile } from '../../types';

export const MIN_SELECTED_FUNDS_FOR_COMPARE = 2;
export const MAX_SELECTED_FUNDS = 3;

/** Fund IDs passed from the compare page to the simulator for multi-fund simulation */
export const MAX_SIMULATION_FUNDS = 3;

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
  /** Fund IDs queued for multi-fund simulation */
  simulationFundIds: string[];
  setSimulationFundIds: (ids: string[]) => void;
  clearSimulationFundIds: () => void;
};

const GuidedComparatorContext = createContext<GuidedState | undefined>(undefined);

export const GuidedComparatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [profileState, setProfileState] = useState<UserProfile>({});
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>([]);
  const [simulationFundIds, setSimulationFundIdsState] = useState<string[]>([]);

  const setSimulationFundIds = useCallback((ids: string[]) => {
    setSimulationFundIdsState(ids.slice(0, MAX_SIMULATION_FUNDS));
  }, []);

  const clearSimulationFundIds = useCallback(() => setSimulationFundIdsState([]), []);

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
        profile: profileState,
        setProfile,
        selectedFundId,
        selectedFundIds,
        toggleSelectedFund,
        addSelectedFund,
        removeSelectedFund,
        clearSelectedFunds,
        setSelectedFundId,
        simulationFundIds,
        setSimulationFundIds,
        clearSimulationFundIds,
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
