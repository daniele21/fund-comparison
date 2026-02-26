import React from 'react';
import FundTable from '@/components/FundTable';
import { PensionFund } from '@/types';
import { useGuidedComparator } from './GuidedComparatorContext';

const GuidedFundTable: React.FC<React.ComponentProps<typeof FundTable>> = ({ onFundClick, ...rest }) => {
  const { setSelectedFundId } = useGuidedComparator();

  const handleFundClick = (fund: PensionFund) => {
    setSelectedFundId(fund.id);
    onFundClick(fund);
  };

  return <FundTable {...rest} onFundClick={handleFundClick} />;
};

export default GuidedFundTable;
