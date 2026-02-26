import { PensionFund, SortableKey } from '@/types';

export const getSortValue = (fund: PensionFund, key: SortableKey): string | number | null => {
  switch (key) {
    case 'linea':
      return fund.linea;
    case 'categoria':
      return fund.categoria;
    case 'type':
      return fund.type;
    case 'costoAnnuo':
      return fund.costoAnnuo;
    case 'ultimoAnno':
      return fund.rendimenti.ultimoAnno;
    case 'ultimi3Anni':
      return fund.rendimenti.ultimi3Anni;
    case 'ultimi5Anni':
      return fund.rendimenti.ultimi5Anni;
    case 'ultimi10Anni':
      return fund.rendimenti.ultimi10Anni;
    case 'ultimi20Anni':
      return fund.rendimenti.ultimi20Anni;
    default:
      return null;
  }
};
