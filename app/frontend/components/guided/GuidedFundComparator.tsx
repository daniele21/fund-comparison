import React from 'react';
import type { PensionFund } from '../../types';
import { EntryModeSelector } from './EntryModeSelector';
import { QuestionChipsBar } from './QuestionChipsBar';
import { CheckMyFundFlow } from './CheckMyFundFlow';
import { ChooseFundFlow } from './ChooseFundFlow';
import { LearnAccordion } from './LearnAccordion';
import { useGuidedComparator } from './GuidedComparatorContext';

type GuidedFundComparatorProps = {
  funds: PensionFund[];
  onPresetSelected?: (id: string) => void;
  onFundClick?: (fund: PensionFund) => void;
  theme?: string;
  children: React.ReactNode;
};

const GuidedLayoutInner: React.FC<
  { funds: PensionFund[]; onPresetSelected?: (id: string) => void; onFundClick?: (fund: PensionFund) => void; theme?: string; children: React.ReactNode }
> = ({ funds, onPresetSelected, onFundClick, theme, children }) => {
  const { entryMode } = useGuidedComparator();

  return (
    <div className="space-y-6 min-w-0">
      <EntryModeSelector />
      {/* <QuestionChipsBar onPresetSelected={onPresetSelected} /> */}

      {entryMode === 'check-fund' && <CheckMyFundFlow funds={funds} />}
      {entryMode === 'choose-fund' && <ChooseFundFlow funds={funds} onFundClick={onFundClick} theme={theme} />}
      {entryMode === 'learn' && <LearnAccordion />}

      <div className="grid gap-6 min-w-0">
        <div className="space-y-6 min-w-0">{children}</div>
      </div>
    </div>
  );
};

export const GuidedFundComparator: React.FC<GuidedFundComparatorProps> = ({ funds, onPresetSelected, onFundClick, theme, children }) => {
  return (
    <GuidedLayoutInner funds={funds} onPresetSelected={onPresetSelected} onFundClick={onFundClick} theme={theme}>
      {children}
    </GuidedLayoutInner>
  );
};
