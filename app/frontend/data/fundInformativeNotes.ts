import type { FundInformativeNote, FundType } from '../types';

type FundInformativeNoteKey = `${FundType}:${number}`;

const buildFundInformativeNoteKey = (type: FundType, nAlbo: number): FundInformativeNoteKey => (
  `${type}:${nAlbo}` as FundInformativeNoteKey
);

const fundInformativeNotesByKey: Partial<Record<FundInformativeNoteKey, FundInformativeNote>> = {
  'FPA:10': {
    fileName: '10-PREVID-SYSTEM - FONDO PENSIONE APERTO.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQCWUyN_036jS7DbjetxrEBiAaOWw4lH2UDWyayuyLNXZdw?e=Vz0REf',
  },
  'FPN:100': {
    fileName: '100-FONDO PENSIONE PEGASO.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQCT7_H3NschQIkV6CwIdl0_AcIpvU1oPqn1wGmIr1Un0-g?e=2i50qw',
  },
  'FPN:103': {
    fileName: '103-FONDO PENSIONE TELEMACO.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQDnGdfaOmVmTJbcVVNM_3NJASAruU6eDEe2tTwyP8MHrck?e=qfT5VC',
  },
  'FPN:106': {
    fileName: '106-FONDO PENSIONE ARCO.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQDR35uLHBZuQ5S1kdTJ9iNVAXS1vQ1k5NiUJwWAyfXU79Y?e=mtRDtD',
  },
  'FPN:107': {
    fileName: '107-FONDO PENSIONE FONCER.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQD3d4uHYTMxS5pW5yxNaiXgAXv4bcsWmtALFMGqKlLvT9s?e=bFEgE6',
  },
  'FPA:111': {
    fileName: '111-AZIONE DI PREVIDENZA - FONDO PENSIONE APERTO.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQBdgIxifzpDTI2JlLFu5ooNAbKus-uTyYQZ-tecQHQwm-M?e=wseWEF',
  },
  'FPA:115': {
    fileName: '115-FONDO PENSIONE APERTO CNP.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQDgqv6Ov_PnSZ_D6TT67IDZAQW04nb0n7R3AyLum8nFMl0?e=TfRNL0',
  },
  'FPN:116': {
    fileName: '116-FONDO PENSIONE FONDAPI.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQC0hHgVZAApRqrz1RAqCoyyAZ3w-nsyqaBkbuWTMQTQzG8?e=Vr5YGc',
  },
  'FPN:117': {
    fileName: '117-FONDO PENSIONE PREVIMODA.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQCu1RP0WRw3R7E5u5oXeP1QASBi_n9GUlW8WLDSpyEIeLA?e=0M9Spm',
  },
  'FPA:118': {
    fileName: '118-INSIEME - FONDO PENSIONE APERTO A CONTRIBUZIONE DEFINITA.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQAkE_tu1SmLQ7YOD-KFqhXWAfx1W5fjRWPrAUEMU2OAU8M?e=aMbJrS',
  },
  'FPA:120': {
    fileName: '120-FONDO PENSIONE APERTO BIM VITA.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQDXl8RJg48ZR6E2R56VGmdIAb0dU2a5K4Gbi_MJMaUZH5Q?e=dzc0O1',
  },
  'FPN:122': {
    fileName: '122-FONDO PENSIONE CONCRETO.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQB7aSoA9fZEQ43_pfhF_hmvAX1WzAhMl04H5ULdqW75sAY?e=TxrnEr',
  },
  'FPN:123': {
    fileName: '123-FONDO PENSIONE FONTE.pdf',
    url: 'https://31pbyr-my.sharepoint.com/:b:/g/personal/glarosa1996_31pbyr_onmicrosoft_com/IQDwEqchVtatQr2m8-uSu9OTAXvia6o1gv6Se4ZtoZ7hpR0?e=6pvoQk',
  },
};

export const getFundInformativeNote = (type: FundType, nAlbo: number): FundInformativeNote | null => {
  return fundInformativeNotesByKey[buildFundInformativeNoteKey(type, nAlbo)] ?? null;
};
